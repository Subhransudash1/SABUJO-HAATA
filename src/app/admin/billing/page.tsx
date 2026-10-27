'use client';

import React, { Suspense, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  generateInvoiceNumber,
  getBillingProducts,
  getCustomers,
  getInvoice,
  getInvoiceByOrderId,
  getInvoices,
  getOrder,
  getSellingPrice,
  saveInvoice,
  updateOrderItems,
  updateOrderStatus,
  finalizeOrderBill,
  getPermittedNextStatuses,
  type Invoice,
  type OrderItem,
  type OrderStatus,
} from '@/lib/admin-data';
import { Badge, Card, CardHeader, Confirm, Empty, Field, Modal, STATUS_LABEL, Stat, Table, btnGhost, btnPrimary, input, td, inr, fmtDate } from '@/components/admin/ui';

// Delivery rule mirrors the storefront (src/lib/cart.ts): ₹25 below ₹149, free otherwise. No tax/discount configured.
const DELIVERY_FEE = 25;
const FREE_DELIVERY_AT = 149;
const STATUS_OPTIONS: OrderStatus[] = ['Pending', 'Confirmed', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled', 'Could Not Deliver'];

const round2 = (n: number) => Math.round(n * 100) / 100;

function validateQty(qty: number, unit: string): string {
  if (!Number.isFinite(qty) || qty <= 0) return 'Enter a quantity greater than 0.';
  if (unit === 'kg') return Math.abs(qty * 2 - Math.round(qty * 2)) > 1e-9 ? 'kg quantities use 0.5 steps.' : '';
  return Number.isInteger(qty) ? '' : `Whole numbers only for ${unit}.`;
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400">Loading billing…</div>}>
      <BillingRouter />
    </Suspense>
  );
}

function BillingRouter() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');
  const isNew = params.get('new') === '1';
  if (orderId || isNew) {
    return (
      <Editor
        key={orderId ?? 'new'}
        orderId={orderId}
        onBack={() => router.push('/admin/billing')}
        onBackToDashboard={() => router.push('/admin')}
      />
    );
  }
  return (
    <BillingList
      onCreate={() => router.push('/admin/billing?new=1')}
      onOpen={(inv) => router.push(`/admin/billing?invoice=${encodeURIComponent(inv.id)}`)}
      onReviewOrder={(oid) => router.push(`/admin/billing?orderId=${encodeURIComponent(oid)}`)}
    />
  );
}

/* ───────────────────────── List ───────────────────────── */

function BillingList({
  onCreate,
  onOpen,
  onReviewOrder,
}: {
  onCreate: () => void;
  onOpen: (i: Invoice) => void;
  onReviewOrder: (orderId: string) => void;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const viewId = params.get('invoice');
  const [invoices] = useState(() => getInvoices());
  const [q, setQ] = useState('');
  const [pay, setPay] = useState('All');

  if (viewId) {
    const inv = getInvoice(viewId);
    if (inv) {
      return (
        <InvoiceView
          invoice={inv}
          onBack={() => router.push('/admin/billing')}
          onReviewOrder={inv.orderId ? () => onReviewOrder(inv.orderId!) : undefined}
        />
      );
    }
  }

  const rows = invoices
    .filter((i) => (pay === 'All' || i.paymentStatus === pay) &&
      (!q.trim() || `${i.invoiceNumber} ${i.orderId ?? ''} ${i.customerName}`.toLowerCase().includes(q.trim().toLowerCase())))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total invoices" value={invoices.length} />
        <Stat label="Paid" value={invoices.filter((i) => i.paymentStatus === 'Paid').length} />
        <Stat label="Unpaid" value={invoices.filter((i) => i.paymentStatus === 'Unpaid').length} />
        <Stat label="Total invoiced" value={inr(invoices.reduce((s, i) => s + i.total, 0))} />
      </div>
      <Card>
        <CardHeader
          title="Recent invoices"
          action={
            <div className="flex flex-wrap gap-2">
              <input aria-label="Search invoices" className={`${input} w-44`} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
              <select aria-label="Payment filter" className={`${input} w-28`} value={pay} onChange={(e) => setPay(e.target.value)}>
                <option>All</option><option>Paid</option><option>Unpaid</option>
              </select>
              <button className={btnPrimary} onClick={onCreate}>Create Bill</button>
            </div>
          }
        />
        {rows.length === 0 ? <Empty text="No invoices yet. Create a bill or open a pending order from the dashboard." /> : (
          <Table head={['Invoice #', 'Order', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Source', 'Actions']}>
            {rows.map((i) => (
              <tr key={i.id}>
                <td className={`${td} font-medium`}>{i.invoiceNumber}</td>
                <td className={td}>
                  {i.orderId ? (
                    <button
                      type="button"
                      className="font-mono text-xs font-medium text-[#2F8F4E] hover:underline"
                      onClick={() => onReviewOrder(i.orderId!)}
                    >
                      {i.orderId}
                    </button>
                  ) : '—'}
                </td>
                <td className={td}>{i.customerName}</td>
                <td className={td}>{fmtDate(i.createdAt)}</td>
                <td className={td}>{inr(i.total)}</td>
                <td className={td}><Badge>{i.paymentStatus}</Badge></td>
                <td className={td}><Badge>{i.status}</Badge></td>
                <td className={td}>{i.isManual ? 'Manual' : 'Order'}</td>
                <td className={td}>
                  <div className="flex items-center gap-1.5">
                    {i.orderId && (
                      <button className={btnGhost} onClick={() => onReviewOrder(i.orderId!)}>
                        Review Order
                      </button>
                    )}
                    <button className={btnPrimary} onClick={() => onOpen(i)}>
                      Invoice
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

/* ───────────────────────── Order Review / Editor ───────────────────────── */

interface Line { productId: string; productName: string; unit: string; unitPrice: number; qty: string }

function Editor({
  orderId,
  onBack,
  onBackToDashboard,
}: {
  orderId: string | null;
  onBack: () => void;
  onBackToDashboard: () => void;
}) {
  const [orderState, setOrderState] = useState(() => (orderId ? getOrder(orderId) : undefined));
  const order = orderState;
  const existing = useMemo(() => (orderId ? getInvoiceByOrderId(orderId) : undefined), [orderId]);
  const products = useMemo(() => getBillingProducts(), []);
  const customers = useMemo(() => getCustomers(), []);
  const firstQtyRef = useRef<HTMLInputElement | null>(null);

  // Always open the Order Review / Edit screen first when viewing an order (do not skip straight to finalized invoice)
  const [stage, setStage] = useState<'edit' | 'preview' | 'created'>('edit');
  const [created, setCreated] = useState<Invoice | null>(existing ?? null);
  const [isEditingOrder, setIsEditingOrder] = useState<boolean>(!orderId);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order?.status ?? 'Pending');
  const [statusFeedback, setStatusFeedback] = useState<string>('');

  const [cust, setCust] = useState({
    id: order?.customerId ?? 'WALK-IN',
    name: order?.customerName ?? '',
    phone: order?.customerPhone ?? '',
    email: order?.customerEmail ?? '',
    address: order?.address ?? '',
  });
  const [lines, setLines] = useState<Line[]>(() =>
    // Price source = current inventory selling price (falls back to the order's saved price only if the product no longer exists).
    (order?.items ?? []).map((i) => ({
      productId: i.productId,
      productName: i.productName,
      unit: i.unit,
      unitPrice: getSellingPrice(i.productId) ?? i.unitPrice,
      qty: String(i.quantity),
    })));
  const [payment, setPayment] = useState<'Paid' | 'Unpaid'>(order?.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid');
  const [invoiceNumber] = useState(() => existing?.invoiceNumber ?? generateInvoiceNumber());
  const [invoiceDate] = useState(() => existing?.createdAt ?? new Date().toISOString());
  const [addId, setAddId] = useState('');
  const [removeIdx, setRemoveIdx] = useState<number | null>(null);
  const [saveError, setSaveError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showGenerateBillModal, setShowGenerateBillModal] = useState(false);

  if (orderId && !order && !existing) {
    return (
      <Card>
        <Empty text={`Order ${orderId} was not found.`} />
        <div className="flex gap-2 p-4">
          <button className={btnGhost} onClick={onBackToDashboard}>← Dashboard</button>
          <button className={btnGhost} onClick={onBack}>← Billing</button>
        </div>
      </Card>
    );
  }

  if (stage === 'created' && created) {
    return (
      <InvoiceView
        invoice={created}
        onBack={onBack}
        onReviewOrder={orderId ? () => setStage('edit') : undefined}
        justCreated={!existing}
      />
    );
  }

  const isManual = !orderId;
  const lineErrors = lines.map((l) => validateQty(Number(l.qty), l.unit));
  const items: OrderItem[] = lines.map((l) => {
    const q = Number(l.qty);
    // Unit price is always read-only and derived from Inventory (or fallback saved unit price)
    const unitPrice = getSellingPrice(l.productId) ?? l.unitPrice;
    return {
      productId: l.productId,
      productName: l.productName,
      quantity: q,
      unit: l.unit,
      unitPrice,
      lineTotal: round2((Number.isFinite(q) && q > 0 ? q : 0) * unitPrice),
    };
  });
  const subtotal = round2(items.reduce((s, i) => s + i.lineTotal, 0));
  const deliveryFee = subtotal > 0 && subtotal < FREE_DELIVERY_AT ? DELIVERY_FEE : 0;
  const total = round2(subtotal + deliveryFee);

  const problems: string[] = [];
  if (lines.length === 0) problems.push('Add at least one product.');
  if (lineErrors.some(Boolean)) problems.push('Fix invalid quantities.');
  if (!cust.name.trim()) problems.push('Customer name is required.');
  if (isManual && !cust.address.trim()) problems.push('Address is required.');

  const draft: Invoice = {
    id: existing?.id ?? `INV-${orderId ?? 'MANUAL'}-${invoiceNumber}`,
    invoiceNumber,
    orderId,
    customerId: cust.id,
    customerName: cust.name.trim(),
    customerPhone: cust.phone,
    customerEmail: cust.email,
    customerAddress: cust.address,
    items,
    subtotal,
    deliveryFee,
    discount: 0,
    total,
    paymentStatus: payment,
    status: 'Finalized',
    createdAt: invoiceDate,
    isManual,
  };

  const handleSaveOrderChanges = () => {
    if (!orderId || problems.length > 0) return;
    const updated = updateOrderItems(orderId, items, payment === 'Paid' ? 'Paid' : (order?.paymentMethod === 'COD' ? 'COD' : 'Unpaid'));
    if (updated) {
      setOrderState(updated);
      setIsEditingOrder(false);
      setStatusFeedback(`Order ${orderId} quantities and totals saved (${inr(updated.amount)}).`);
    }
  };

  const handleOrderStatusChange = (nextStatus: OrderStatus) => {
    if (!orderId) return;
    if (updateOrderStatus(orderId, nextStatus)) {
      setOrderStatus(nextStatus);
      setOrderState(getOrder(orderId));
      setStatusFeedback(`Order ${orderId} status updated to ${STATUS_LABEL[nextStatus] ?? nextStatus}.`);
    }
  };

  const handleConfirmAndGenerateBill = () => {
    setBusy(true);
    setSaveError('');
    setShowGenerateBillModal(false);
    try {
      if (orderId) {
        const res = finalizeOrderBill(orderId, items, payment);
        if (!res.success || !res.invoice) {
          throw new Error(res.error || 'Failed to finalize invoice and bill.');
        }
        setCreated(res.invoice);
        setOrderState(getOrder(orderId));
        setStage('created');
      } else {
        const saved = saveInvoice(draft);
        const stored = getInvoice(saved.id);
        if (!stored) throw new Error('Invoice was not persisted.');
        setCreated(stored);
        setStage('created');
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save invoice.');
    } finally {
      setBusy(false);
    }
  };

  const addProduct = () => {
    const p = products.find((x) => x.id === addId);
    if (!p || lines.some((l) => l.productId === p.id)) return;
    setLines([...lines, { productId: p.id, productName: p.name, unit: p.unit, unitPrice: p.price, qty: p.unit === 'kg' ? '0.5' : '1' }]);
    setAddId('');
  };

  const stepQty = (idx: number, delta: number) => {
    setLines(
      lines.map((l, j) => {
        if (j !== idx) return l;
        const step = l.unit === 'kg' ? 0.5 : 1;
        const cur = Number(l.qty);
        const next = Math.max(step, round2((Number.isFinite(cur) ? cur : 0) + delta * step));
        return { ...l, qty: String(next) };
      }),
    );
  };

  if (stage === 'preview') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-2.5">
          <div className="text-xs text-[#0B3D2E]">
            <span className="font-semibold">Invoice Preview</span> — Review the customer details, quantities, unit prices, and totals below before confirming.
          </div>
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => setStage('edit')}>← Back to Order Review / Edit</button>
            <button className={btnPrimary} onClick={() => setShowGenerateBillModal(true)} disabled={busy || order?.status === 'Pending'}>
              {busy ? 'Generating…' : 'Generate Bill'}
            </button>
          </div>
        </div>
        {saveError && <p role="alert" className="text-xs text-red-600">{saveError}</p>}
        <InvoiceDocument invoice={draft} />

        {showGenerateBillModal && (
          <Modal title="Confirm & Generate Bill" onClose={() => setShowGenerateBillModal(false)}>
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                Once the bill is generated, the invoice and finalized order quantities cannot be edited. Please verify all products, quantities, payment information, and totals before continuing.
              </p>
              <div className="rounded-md bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-bold">Final Order Summary:</p>
                <div className="flex justify-between text-[11px]">
                  <span>Customer:</span>
                  <span className="font-semibold text-gray-900">{cust.name}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Items:</span>
                  <span className="font-semibold text-gray-900">{items.length} product(s)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Total Amount:</span>
                  <span className="font-bold text-[#0B3D2E]">{inr(total)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Payment:</span>
                  <span className="font-semibold text-gray-900">{payment}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => setShowGenerateBillModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={handleConfirmAndGenerateBill}
                  disabled={busy}
                >
                  {busy ? 'Finalizing…' : 'Confirm & Generate Bill'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isManual && (
            <button className={btnGhost} onClick={onBackToDashboard}>← Dashboard</button>
          )}
          <button className={btnGhost} onClick={onBack}>← Billing</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isManual ? 'purple' : 'blue'}>
            {isManual ? 'Manual Bill' : `Order Review · ${orderId}`}
          </Badge>
          {!isManual && order && (
            <>
              <Badge>{orderStatus}</Badge>
              <Badge>{`${order.paymentMethod} · ${payment}`}</Badge>
            </>
          )}
        </div>
      </div>

      {statusFeedback && (
        <div role="status" className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-[#0B3D2E]">
          <span>{statusFeedback}</span>
          <button type="button" className="text-gray-400 hover:text-gray-700" onClick={() => setStatusFeedback('')}>✕</button>
        </div>
      )}

      {order?.status === 'Pending' && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div>
            <span className="font-bold">Pending Order Review Required:</span> This order is currently Pending. Pending orders must first be confirmed on the dedicated Order Preview page before preparing a finalized bill.
          </div>
          <Link
            href={`/admin/orders/${encodeURIComponent(order.id)}`}
            className="rounded-md bg-[#2F8F4E] px-3.5 py-1.5 font-bold text-white hover:bg-[#257a40] transition-colors shadow-2xs"
          >
            Go to Order Preview Page →
          </Link>
        </div>
      )}

      {order?.status === 'Confirmed' && !created && (
        <div className="rounded-lg border border-sky-200 bg-sky-50/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-900 shadow-2xs">
          <div>
            <span className="font-bold">Order Confirmed / Processing:</span> Review the quantities, pricing, and delivery details below. Mark Ready to Ship when packed, then Generate Bill to finalize the invoice.
          </div>
          <button
            type="button"
            onClick={() => handleOrderStatusChange('Ready')}
            className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3.5 py-1.5 font-bold text-white hover:bg-sky-700 transition-colors shadow-2xs cursor-pointer"
          >
            Mark Ready to Ship
          </button>
        </div>
      )}

      {created && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs text-[#0B3D2E]">
          <div>
            <span className="font-semibold">Finalized Invoice {created.invoiceNumber}</span> has already been generated for this order ({inr(created.total)}).
            <span className="block text-[11px] text-gray-600">
              Finalized invoices are read-only and locked at confirmation time so past billing records are never silently altered.
            </span>
          </div>
          <button className={btnPrimary} onClick={() => setStage('created')}>
            View / Download Finalized Invoice
          </button>
        </div>
      )}

      <Card>
        <CardHeader
          title={isManual ? 'Customer information' : `Order ${orderId} — Customer & Delivery Details`}
          action={
            !isManual && order?.customerId ? (
              <Link
                href={`/admin/customers?customerId=${encodeURIComponent(order.customerId)}`}
                className="text-xs font-medium text-[#2F8F4E] hover:underline"
              >
                View Customer Profile →
              </Link>
            ) : undefined
          }
        />
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {isManual && (
            <Field label="Existing customer">
              <select className={input} value={cust.id} onChange={(e) => {
                const c = customers.find((x) => x.id === e.target.value);
                setCust(c ? { id: c.id, name: c.name, phone: c.phone, email: c.email, address: c.address } : { id: 'WALK-IN', name: '', phone: '', email: '', address: '' });
              }}>
                <option value="WALK-IN">Enter manually</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          )}
          <Field label="Order ID">
            <input className={`${input} bg-gray-50 font-mono`} value={orderId ?? '— (Manual Bill)'} readOnly />
          </Field>
          <Field label="Order Date">
            <input className={`${input} bg-gray-50`} value={order ? fmtDate(order.date) : fmtDate(invoiceDate)} readOnly />
          </Field>
          <Field label="Customer Name">
            <input className={`${input} ${!isManual ? 'bg-gray-50' : ''}`} value={cust.name} readOnly={!isManual} onChange={(e) => setCust({ ...cust, name: e.target.value })} />
          </Field>
          <Field label="Phone Number">
            <input className={`${input} ${!isManual ? 'bg-gray-50' : ''}`} value={cust.phone} readOnly={!isManual} placeholder={isManual ? '' : 'Not available'} onChange={(e) => setCust({ ...cust, phone: e.target.value })} />
          </Field>
          <Field label="Email Address">
            <input className={`${input} ${!isManual ? 'bg-gray-50' : ''}`} value={cust.email} readOnly={!isManual} placeholder={isManual ? '' : 'Not available'} onChange={(e) => setCust({ ...cust, email: e.target.value })} />
          </Field>
          <Field label="Delivery Address">
            <input className={`${input} ${!isManual ? 'bg-gray-50' : ''}`} value={cust.address} readOnly={!isManual} onChange={(e) => setCust({ ...cust, address: e.target.value })} />
          </Field>
          {!isManual && order && (
            <Field label="Delivery / Order Status">
              {order.status === 'Pending' ? (
                <input className={`${input} bg-amber-50 text-amber-800 font-semibold`} value="Pending (Preview & Confirm first)" readOnly />
              ) : (
                <select
                  aria-label="Order delivery status"
                  className={input}
                  value={orderStatus}
                  onChange={(e) => handleOrderStatusChange(e.target.value as OrderStatus)}
                >
                  {[orderStatus, ...getPermittedNextStatuses(orderStatus).filter((s) => s !== orderStatus)].map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
                  ))}
                </select>
              )}
            </Field>
          )}
          <Field label={order ? `Payment Status (${order.paymentMethod})` : 'Payment Status'}>
            <select
              aria-label="Payment status"
              className={input}
              value={payment}
              onChange={(e) => setPayment(e.target.value as 'Paid' | 'Unpaid')}
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </Field>
          <Field label="Invoice Number">
            <input className={`${input} bg-gray-50 font-mono`} value={`${invoiceNumber} · ${fmtDate(invoiceDate)}`} readOnly />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Ordered Products & Quantities"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {!isManual && !created && (
                <button
                  type="button"
                  className={isEditingOrder ? btnGhost : btnPrimary}
                  onClick={() => {
                    const next = !isEditingOrder;
                    setIsEditingOrder(next);
                    if (next) setTimeout(() => firstQtyRef.current?.focus(), 30);
                  }}
                >
                  {isEditingOrder ? 'Done Editing' : 'Edit Order Quantities'}
                </button>
              )}
              {!created && (isManual || isEditingOrder) && (
                <div className="flex gap-1.5">
                  <select aria-label="Add product" className={`${input} w-48`} value={addId} onChange={(e) => setAddId(e.target.value)}>
                    <option value="">Add product…</option>
                    {products.filter((p) => !lines.some((l) => l.productId === p.id)).map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — ₹{p.price}/{p.unit}</option>
                    ))}
                  </select>
                  <button type="button" className={btnGhost} onClick={addProduct} disabled={!addId}>+ Add</button>
                </div>
              )}
            </div>
          }
        />
        <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-2 text-[11px] text-gray-500">
          Quantities can be adjusted below. Unit prices are automatically derived from Inventory and cannot be edited manually.
        </div>
        {lines.length === 0 ? <Empty text="No products added." /> : (
          <Table head={['Product', 'Quantity', 'Unit', 'Unit Price (Inventory)', 'Line Total', '']}>
            {lines.map((l, i) => (
              <tr key={l.productId}>
                <td className={`${td} font-medium text-gray-900`}>{l.productName}</td>
                <td className={td}>
                  {created ? (
                    <span className="font-semibold tabular-nums text-gray-900">{l.qty}</span>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Decrease quantity for ${l.productName}`}
                          className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          onClick={() => stepQty(i, -1)}
                        >
                          −
                        </button>
                        <input
                          ref={i === 0 ? firstQtyRef : undefined}
                          aria-label={`Quantity for ${l.productName}`}
                          type="number"
                          min={l.unit === 'kg' ? 0.5 : 1}
                          step={l.unit === 'kg' ? 0.5 : 1}
                          className={`${input} w-20 text-center tabular-nums`}
                          value={l.qty}
                          onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))}
                        />
                        <button
                          type="button"
                          aria-label={`Increase quantity for ${l.productName}`}
                          className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          onClick={() => stepQty(i, 1)}
                        >
                          +
                        </button>
                      </div>
                      {lineErrors[i] && <span role="alert" className="mt-0.5 block text-[11px] text-red-600">{lineErrors[i]}</span>}
                    </>
                  )}
                </td>
                <td className={td}>{l.unit}</td>
                <td className={`${td} tabular-nums text-gray-700`}>
                  <span>{inr(items[i].unitPrice)}</span>
                  <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">Auto</span>
                </td>
                <td className={`${td} font-semibold tabular-nums text-gray-900`}>{inr(items[i].lineTotal)}</td>
                <td className={td}>
                  {(isManual || (isEditingOrder && lines.length > 1)) && (
                    <button className={btnGhost} onClick={() => setRemoveIdx(i)}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div className="ml-auto max-w-xs space-y-1.5 border-t border-gray-100 p-4 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="tabular-nums">{inr(subtotal)}</span></div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery fee {subtotal >= FREE_DELIVERY_AT ? '(Free ≥ ₹149)' : ''}</span>
            <span className="tabular-nums">{deliveryFee === 0 ? 'Free (₹0)' : inr(deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t pt-1.5 text-base font-bold text-[#0B3D2E]">
            <span>Grand Total</span>
            <span className="tabular-nums">{inr(total)}</span>
          </div>
        </div>
      </Card>

      {problems.length > 0 && <ul className="text-xs text-red-600">{problems.map((p) => <li key={p}>• {p}</li>)}</ul>}
      {saveError && <p role="alert" className="text-xs text-red-600">{saveError}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!isManual && !created && (
          <button
            type="button"
            className={btnGhost}
            disabled={problems.length > 0 || order?.status === 'Pending'}
            onClick={handleSaveOrderChanges}
          >
            Save Order Changes
          </button>
        )}
        {created ? (
          <button className={btnPrimary} onClick={() => setStage('created')}>
            Open Finalized Invoice ({created.invoiceNumber})
          </button>
        ) : (
          <>
            <button
              type="button"
              className={btnGhost}
              disabled={problems.length > 0 || order?.status === 'Pending'}
              onClick={() => setStage('preview')}
            >
              Preview Invoice
            </button>
            <button
              type="button"
              className={btnPrimary}
              disabled={problems.length > 0 || busy || order?.status === 'Pending'}
              onClick={() => setShowGenerateBillModal(true)}
            >
              {busy ? 'Generating…' : 'Generate Bill'}
            </button>
          </>
        )}
      </div>

      {showGenerateBillModal && (
        <Modal title="Confirm & Generate Bill" onClose={() => setShowGenerateBillModal(false)}>
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
              Once the bill is generated, the invoice and finalized order quantities cannot be edited. Please verify all products, quantities, payment information, and totals before continuing.
            </p>
            <div className="rounded-md bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-800 space-y-1">
              <p className="font-bold">Final Order Summary:</p>
              <div className="flex justify-between text-[11px]">
                <span>Customer:</span>
                <span className="font-semibold text-gray-900">{cust.name}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Items:</span>
                <span className="font-semibold text-gray-900">{items.length} product(s)</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Total Amount:</span>
                <span className="font-bold text-[#0B3D2E]">{inr(total)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Payment:</span>
                <span className="font-semibold text-gray-900">{payment}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                className={btnGhost}
                onClick={() => setShowGenerateBillModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={btnPrimary}
                onClick={handleConfirmAndGenerateBill}
                disabled={busy}
              >
                {busy ? 'Finalizing…' : 'Confirm & Generate Bill'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {removeIdx !== null && (
        <Confirm
          message={`Remove ${lines[removeIdx]?.productName} from this order/bill?`}
          onNo={() => setRemoveIdx(null)}
          onYes={() => {
            setLines(lines.filter((_, j) => j !== removeIdx));
            setRemoveIdx(null);
          }}
        />
      )}
    </div>
  );
}

/* ───────────────────────── Invoice display ───────────────────────── */

function InvoiceView({
  invoice,
  onBack,
  onReviewOrder,
  justCreated,
}: {
  invoice: Invoice;
  onBack: () => void;
  onReviewOrder?: () => void;
  justCreated?: boolean;
}) {
  const print = () => {
    const prev = document.title;
    document.title = invoice.invoiceNumber;
    window.print();
    document.title = prev;
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className={btnGhost} onClick={onBack}>← All Invoices</button>
        {onReviewOrder && (
          <button className={btnGhost} onClick={onReviewOrder}>← Back to Order Review</button>
        )}
        <button className={btnPrimary} onClick={print}>Download Invoice (PDF)</button>
        {justCreated
          ? <span role="status" className="text-xs font-medium text-emerald-700">Invoice {invoice.invoiceNumber} confirmed and finalized.</span>
          : <span className="text-xs text-gray-500">Finalized invoice — read only.</span>}
      </div>
      <p className="text-[11px] text-gray-400 print:hidden">Choose “Save as PDF” in the print dialog to download.</p>
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}

function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  return (
    <>
      <style>{`@media print { body * { visibility: hidden !important; } #invoice-print, #invoice-print * { visibility: visible !important; } #invoice-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; } }`}</style>
      <div id="invoice-print" className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 text-sm text-gray-800 shadow-sm">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <div className="text-lg font-bold text-[#0B3D2E]">Sabuja Haata</div>
            <div className="text-xs text-gray-500">Fresh organic fruits &amp; vegetables</div>
          </div>
          <div className="text-right text-xs">
            <div className="text-base font-semibold">INVOICE</div>
            <div>{invoice.invoiceNumber}</div>
            <div>Date: {fmtDate(invoice.createdAt)}</div>
            {invoice.orderId && <div>Order: {invoice.orderId}</div>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 py-4 text-xs">
          <div>
            <div className="mb-1 font-semibold text-gray-500">BILL TO</div>
            <div className="font-medium">{invoice.customerName}</div>
            {invoice.customerPhone && <div>{invoice.customerPhone}</div>}
            {invoice.customerEmail && <div>{invoice.customerEmail}</div>}
            <div>{invoice.customerAddress}</div>
          </div>
          <div className="text-right">
            <div className="mb-1 font-semibold text-gray-500">PAYMENT</div>
            <div>{invoice.paymentStatus}</div>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-y bg-gray-50 text-left"><th className="py-1.5 pl-2">Item</th><th>Qty</th><th>Unit price</th><th className="pr-2 text-right">Total</th></tr>
          </thead>
          <tbody>
            {invoice.items.map((i) => (
              <tr key={i.productId} className="border-b">
                <td className="py-1.5 pl-2">{i.productName}</td>
                <td>{i.quantity} {i.unit}</td>
                <td>{inr(i.unitPrice)}</td>
                <td className="pr-2 text-right">{inr(i.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-4 w-56 space-y-1 text-xs">
          <div className="flex justify-between"><span>Subtotal</span><span>{inr(invoice.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery fee</span><span>{inr(invoice.deliveryFee)}</span></div>
          {invoice.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>−{inr(invoice.discount)}</span></div>}
          <div className="flex justify-between border-t pt-1 text-sm font-bold"><span>Grand total</span><span>{inr(invoice.total)}</span></div>
        </div>
        <div className="mt-8 border-t pt-3 text-center text-[11px] text-gray-400">Thank you for shopping with Sabuja Haata.</div>
      </div>
    </>
  );
}
