import test from 'node:test';
import assert from 'node:assert/strict';

// Minimal browser shim so the localStorage-backed data layer can run under Node.
const store = new Map<string, string>();
(globalThis as unknown as { window: object }).window = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

async function load() {
  store.clear();
  const mod = await import('./admin-data');
  mod.ensureDemoData();
  return mod;
}

const stockStatus = (q: number) => (q <= 0 ? 'Out of Stock' : q <= 10 ? 'Low Stock' : 'In Stock');

test('dashboard status changes move orders between counts', async () => {
  const d = await load();
  const before = d.getOrderStatusCounts();
  const pending = d.getOrders().filter((o) => o.status === 'Pending');
  assert.ok(pending.length >= 2);
  assert.ok(d.updateOrderStatus(pending[0].id, 'Ready'));
  assert.ok(d.updateOrderStatus(pending[1].id, 'Out for Delivery'));
  const after = d.getOrderStatusCounts();
  assert.equal(after.Pending, before.Pending - 2);
  assert.equal(after.Ready, before.Ready + 1);
  assert.equal(after['Out for Delivery'], before['Out for Delivery'] + 1);
  assert.equal(d.getOrder(pending[0].id)?.status, 'Ready');
  assert.ok(d.updateOrderStatus(pending[0].id, 'Confirmed'));
  assert.equal(d.getOrder(pending[0].id)?.status, 'Confirmed');
});

test('cancelling an assigned order removes it from the delivery partner', async () => {
  const d = await load();
  const order = d.getOrders()[0];
  const dp = d.getDeliveryPartners()[0];
  d.assignDeliveryPerson(order.id, dp.id);
  assert.ok(d.getDeliveryPartners()[0].assignedOrders.includes(order.id));
  d.updateOrderStatus(order.id, 'Cancelled');
  assert.ok(!d.getDeliveryPartners()[0].assignedOrders.includes(order.id));
});

test('editing price and stock persists; status follows quantity', async () => {
  const d = await load();
  const item = d.getInventory()[0];
  const base = { productName: item.productName, category: item.category, unit: item.unit };
  assert.equal(d.updateInventoryProduct(item.productId, { ...base, sellingPrice: 99, stockQty: 40 }), '');
  let cur = d.getInventory().find((i) => i.productId === item.productId)!;
  assert.equal(cur.sellingPrice, 99);
  assert.equal(stockStatus(cur.stockQty), 'In Stock');

  assert.equal(d.updateInventoryProduct(item.productId, { ...base, sellingPrice: 99, stockQty: 0 }), '');
  cur = d.getInventory().find((i) => i.productId === item.productId)!;
  assert.equal(stockStatus(cur.stockQty), 'Out of Stock');

  assert.equal(d.updateInventoryProduct(item.productId, { ...base, sellingPrice: 99, stockQty: 25 }), '');
  cur = d.getInventory().find((i) => i.productId === item.productId)!;
  assert.equal(stockStatus(cur.stockQty), 'In Stock');

  assert.match(d.updateInventoryProduct(item.productId, { ...base, sellingPrice: 99, stockQty: -1 }), /negative/i);
  assert.match(d.updateInventoryProduct(item.productId, { ...base, sellingPrice: 0, stockQty: 5 }), /price/i);
});

test('adding Pumpkin works, validates, and blocks duplicates; billing uses its inventory price', async () => {
  const d = await load();
  assert.match(d.addInventoryProduct({ productName: '', category: 'vegetables', sellingPrice: 20, stockQty: 5, unit: 'kg' }), /name/i);
  assert.match(d.addInventoryProduct({ productName: 'Fresh Pumpkin', category: 'vegetables', sellingPrice: NaN, stockQty: 5, unit: 'kg' }), /price/i);
  assert.equal(d.addInventoryProduct({ productName: 'Fresh Pumpkin', category: 'vegetables', sellingPrice: 30, stockQty: 12, unit: 'kg' }), '');
  const added = d.getInventory().find((i) => i.productName === 'Fresh Pumpkin');
  assert.ok(added && added.custom);
  assert.equal(added!.stockQty, 12);
  assert.match(d.addInventoryProduct({ productName: 'fresh pumpkin', category: 'vegetables', sellingPrice: 30, stockQty: 1, unit: 'kg' }), /already exists/i);

  assert.equal(d.getSellingPrice(added!.productId), 30);
  const billing = d.getBillingProducts().find((p) => p.id === added!.productId);
  assert.equal(billing?.price, 30);

  // Price change in inventory is reflected for new billing, while a finalized invoice keeps its recorded price.
  const inv = {
    id: 'INV-T', invoiceNumber: 'T-1', orderId: null, customerId: 'WALK-IN', customerName: 'T', customerPhone: '', customerEmail: '', customerAddress: 'x',
    items: [{ productId: added!.productId, productName: 'Fresh Pumpkin', quantity: 2, unit: 'kg', unitPrice: 30, lineTotal: 60 }],
    subtotal: 60, deliveryFee: 25, discount: 0, total: 85, paymentStatus: 'Unpaid' as const, status: 'Finalized' as const, createdAt: new Date().toISOString(), isManual: true,
  };
  d.saveInvoice(inv);
  d.updateInventoryProduct(added!.productId, { productName: 'Fresh Pumpkin', category: 'vegetables', sellingPrice: 45, stockQty: 12, unit: 'kg' });
  assert.equal(d.getSellingPrice(added!.productId), 45);
  assert.equal(d.getInvoice('INV-T')!.items[0].unitPrice, 30);
});

test('duplicate invoice for the same order is prevented', async () => {
  const d = await load();
  const order = d.getOrders()[0];
  const mk = (id: string) => ({
    id, invoiceNumber: id, orderId: order.id, customerId: order.customerId, customerName: order.customerName, customerPhone: '', customerEmail: '', customerAddress: order.address,
    items: order.items, subtotal: order.amount, deliveryFee: 0, discount: 0, total: order.amount, paymentStatus: 'Unpaid' as const, status: 'Finalized' as const,
    createdAt: new Date().toISOString(), isManual: false,
  });
  d.saveInvoice(mk('A'));
  const second = d.saveInvoice(mk('B'));
  assert.equal(second.id, 'A');
  assert.equal(d.getInvoices().length, 1);
});

test('editing order quantities recalculates totals from inventory prices and does not mutate finalized invoices', async () => {
  const d = await load();
  const order = d.getOrders()[0];
  const item = order.items[0];
  const invPrice = d.getSellingPrice(item.productId)!;

  // Finalize an invoice first for a different order, then test that editing an order never mutates its finalized invoice
  const updated = d.updateOrderItems(order.id, [
    { ...item, quantity: 4, unitPrice: 999999, lineTotal: 0 }, // unitPrice must be overridden by inventory price
  ], 'Paid');
  assert.ok(updated);
  assert.equal(updated!.items[0].quantity, 4);
  assert.equal(updated!.items[0].unitPrice, invPrice);
  assert.equal(updated!.items[0].lineTotal, Math.round(4 * invPrice * 100) / 100);
  const expectedDelivery = updated!.items[0].lineTotal < 149 ? 25 : 0;
  assert.equal(updated!.amount, Math.round((updated!.items[0].lineTotal + expectedDelivery) * 100) / 100);
  assert.equal(updated!.paymentStatus, 'Paid');

  // Finalize an invoice for this order, then edit order again; finalized invoice must remain read-only
  const finalized = d.saveInvoice({
    id: 'INV-LOCK',
    invoiceNumber: 'SH-INV-LOCK',
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    customerAddress: order.address,
    items: updated!.items,
    subtotal: updated!.items[0].lineTotal,
    deliveryFee: expectedDelivery,
    discount: 0,
    total: updated!.amount,
    paymentStatus: 'Paid',
    status: 'Finalized',
    createdAt: new Date().toISOString(),
    isManual: false,
  });
  d.updateOrderItems(order.id, [{ ...item, quantity: 10 }]);
  const storedInv = d.getInvoiceByOrderId(order.id)!;
  assert.equal(storedInv.id, finalized.id);
  assert.equal(storedInv.items[0].quantity, 4);
});

test('delivery partner status can be toggled between Active and Inactive while preserving assignments', async () => {
  const d = await load();
  const order = d.getOrders()[0];
  const partner = d.getDeliveryPartners()[0];
  assert.equal(partner.active, true);

  d.assignDeliveryPerson(order.id, partner.id);
  assert.ok(d.getDeliveryPartners()[0].assignedOrders.includes(order.id));

  assert.ok(d.setDeliveryPartnerStatus(partner.id, false));
  let updated = d.getDeliveryPartners().find((p) => p.id === partner.id)!;
  assert.equal(updated.active, false);
  assert.ok(updated.assignedOrders.includes(order.id));

  assert.ok(d.setDeliveryPartnerStatus(partner.id, true));
  updated = d.getDeliveryPartners().find((p) => p.id === partner.id)!;
  assert.equal(updated.active, true);
});

test('customer stats include firstOrder, lastOrder, orderCount, and spent per customer', async () => {
  const d = await load();
  const stats = d.getCustomerStats();
  assert.ok(stats.length >= 5);
  for (const c of stats) {
    const custOrders = d.getCustomerOrders(c.id);
    assert.equal(c.orderCount, custOrders.length);
    if (custOrders.length > 0) {
      assert.ok(c.firstOrder.length > 0);
      assert.ok(c.lastOrder.length > 0);
      assert.ok(c.firstOrder <= c.lastOrder);
    }
  }
});

test('confirmPendingOrder moves order out of Pending and prevents duplicate confirmation', async () => {
  const d = await load();
  const pending = d.getOrders().find((o) => o.status === 'Pending')!;
  assert.ok(pending);

  const initialPendingCount = d.getOrderStatusCounts().Pending;
  const initialConfirmedCount = d.getOrderStatusCounts().Confirmed;

  // Modify quantities during review and confirm
  const updatedItems = [{ ...pending.items[0], quantity: 3 }];
  const res = d.confirmPendingOrder(pending.id, updatedItems, 'Paid');

  assert.equal(res.success, true);
  assert.equal(res.order?.status, 'Confirmed');
  assert.equal(res.order?.paymentStatus, 'Paid');
  assert.equal(res.order?.items[0].quantity, 3);

  const countsAfter = d.getOrderStatusCounts();
  assert.equal(countsAfter.Pending, initialPendingCount - 1);
  assert.equal(countsAfter.Confirmed, initialConfirmedCount + 1);

  // Attempt duplicate confirmation
  const dup = d.confirmPendingOrder(pending.id);
  assert.equal(dup.success, false);
  assert.match(dup.error!, /already been confirmed/i);
});

test('admin order status transition options strictly adhere to workflow rules', async () => {
  const d = await load();
  assert.deepEqual(d.getPermittedNextStatuses('Pending'), ['Confirmed']);
  assert.deepEqual(d.getPermittedNextStatuses('Confirmed'), ['Ready']);
  assert.deepEqual(d.getPermittedNextStatuses('Ready'), ['Out for Delivery', 'Cancelled']);
  assert.deepEqual(d.getPermittedNextStatuses('Out for Delivery'), ['Delivered', 'Could Not Deliver', 'Cancelled']);
  assert.deepEqual(d.getPermittedNextStatuses('Delivered'), []);
  assert.deepEqual(d.getPermittedNextStatuses('Cancelled'), []);
  assert.deepEqual(d.getPermittedNextStatuses('Could Not Deliver'), []);
});

test('order-to-invoice workflow: Generate Bill validates stock, deducts inventory, and locks invoice', async () => {
  const d = await load();
  const pending = d.getOrders().find((o) => o.status === 'Pending')!;

  // Must not allow bill generation while Pending
  const failPending = d.finalizeOrderBill(pending.id, pending.items, 'Paid');
  assert.equal(failPending.success, false);
  assert.match(failPending.error!, /pending/i);

  // Confirm order first
  d.confirmPendingOrder(pending.id);
  d.updateOrderStatus(pending.id, 'Ready');

  const item = pending.items[0];
  const invBefore = d.getInventory().find((i) => i.productId === item.productId)!;
  const initialStock = invBefore.stockQty;

  // Successful bill generation
  const res = d.finalizeOrderBill(pending.id, [{ ...item, quantity: 2 }], 'Paid');
  assert.equal(res.success, true);
  assert.ok(res.invoice?.invoiceNumber.startsWith('SH-INV-'));
  assert.equal(res.invoice?.status, 'Finalized');

  // Verify inventory was deducted atomically
  const invAfter = d.getInventory().find((i) => i.productId === item.productId)!;
  assert.equal(invAfter.stockQty, initialStock - 2);

  const orderAfter = d.getOrder(pending.id)!;
  assert.equal(orderAfter.invoiceFinalized, true);
  assert.equal(orderAfter.invoiceNumber, res.invoice!.invoiceNumber);

  // Prevent duplicate bill generation
  const second = d.finalizeOrderBill(pending.id, [{ ...item, quantity: 2 }], 'Paid');
  assert.equal(second.success, true);
  assert.equal(second.invoice?.invoiceNumber, res.invoice?.invoiceNumber);
  // Stock must not be deducted twice
  assert.equal(d.getInventory().find((i) => i.productId === item.productId)!.stockQty, initialStock - 2);
});

test('customer order cancellation requires mandatory non-whitespace reason and restores stock safely', async () => {
  const d = await load();
  const order = d.getOrders().find((o) => o.status === 'Pending')!;

  // Whitespace-only reason must fail
  assert.equal(d.cancelCustomerOrder(order.id, '   ').success, false);
  assert.equal(d.cancelCustomerOrder(order.id, '').success, false);

  // Valid reason succeeds
  const res = d.cancelCustomerOrder(order.id, 'Accidental order by family member');
  assert.equal(res.success, true);

  const cancelled = d.getOrder(order.id)!;
  assert.equal(cancelled.status, 'Cancelled');
  assert.equal(cancelled.cancellationReason, 'Accidental order by family member');
  assert.ok(cancelled.cancelledAt);

  // Cannot re-cancel already cancelled order
  const dup = d.cancelCustomerOrder(order.id, 'Another reason');
  assert.equal(dup.success, false);
});

test('inventory supports kg and bundle units, selling price and offer price with discount %', async () => {
  const d = await load();

  // Test adding product with bundle unit and offer price
  const bundleInput = {
    productName: 'Fresh Palak Bundle',
    category: 'vegetables',
    unit: 'bundle',
    sellingPrice: 40,
    offerPrice: 30,
    stockQty: 25,
  };
  assert.equal(d.addInventoryProduct(bundleInput), '');
  const added = d.getInventory().find((i) => i.productName === 'Fresh Palak Bundle')!;
  assert.equal(added.unit, 'bundle');
  assert.equal(added.sellingPrice, 40);
  assert.equal(added.offerPrice, 30);
  // Customer pays active offer price
  assert.equal(d.getSellingPrice(added.productId), 30);
  assert.equal(d.getRegularPrice(added.productId), 40);

  // Update unit from bundle to kg or vice versa
  assert.equal(d.updateInventoryProduct(added.productId, { ...bundleInput, unit: 'kg', sellingPrice: 50, offerPrice: 40 }), '');
  const updated = d.getInventory().find((i) => i.productId === added.productId)!;
  assert.equal(updated.unit, 'kg');
  assert.equal(updated.sellingPrice, 50);
  assert.equal(updated.offerPrice, 40);

  // Validation: offer price cannot exceed selling price
  assert.match(d.validateInventoryInput({ ...bundleInput, sellingPrice: 30, offerPrice: 50 }), /cannot exceed/i);
  assert.match(d.validateInventoryInput({ ...bundleInput, sellingPrice: 30, offerPrice: -5 }), /greater than 0/i);
  // Whole numbers only for bundle stock
  assert.match(d.validateInventoryInput({ ...bundleInput, unit: 'bundle', stockQty: 4.5 }), /whole number/i);
});

test('four realistic demo orders are present, calculate totals accurately, and support confirmation workflow', async () => {
  const d = await load();
  const orders = d.getOrders();
  const demoIds = ['DEMO-ORD-101', 'DEMO-ORD-102', 'DEMO-ORD-103', 'DEMO-ORD-104'];

  for (const id of demoIds) {
    const order = orders.find((o) => o.id === id);
    assert.ok(order, `Demo order ${id} should exist`);
    assert.equal(order.status, 'Pending', `Demo order ${id} should be Pending`);

    // Verify subtotal and total calculations
    let calculatedSubtotal = 0;
    for (const item of order.items) {
      const lineExpected = Math.round(item.quantity * item.unitPrice * 100) / 100;
      assert.equal(item.lineTotal, lineExpected, `Line total for ${item.productName} in ${id} should match`);
      calculatedSubtotal += item.lineTotal;
    }
    calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;
    const deliveryFee = calculatedSubtotal < 149 ? 25 : 0;
    const expectedTotal = Math.round((calculatedSubtotal + deliveryFee) * 100) / 100;
    assert.equal(order.amount, expectedTotal, `Order amount for ${id} should match calculated subtotal + delivery`);
  }

  // Verify idempotency / duplicate prevention across multiple ensureDemoData calls
  const countBefore = d.getOrders().length;
  d.ensureDemoData();
  d.ensureDemoData();
  assert.equal(d.getOrders().length, countBefore, 'Subsequent ensureDemoData calls must not duplicate orders');

  // Verify confirmPendingOrder workflow works cleanly for demo orders
  const confirmResult = d.confirmPendingOrder('DEMO-ORD-101');
  assert.equal(confirmResult.success, true);
  assert.equal(confirmResult.order?.status, 'Confirmed');
  assert.equal(d.getOrder('DEMO-ORD-101')?.status, 'Confirmed');
});
