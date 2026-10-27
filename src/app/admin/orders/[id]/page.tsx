'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  getOrder,
  getOrders,
  confirmPendingOrder,
  updateOrderItems,
  updateOrderStatus,
  getSellingPrice,
  getInventory,
  type Order,
  type OrderItem,
} from '@/lib/admin-data';
import { PRODUCTS } from '@/data/products';
import {
  Badge,
  Card,
  CardHeader,
  Empty,
  Field,
  STATUS_LABEL,
  Table,
  btnGhost,
  btnPrimary,
  input,
  td,
  inr,
  fmtDate,
} from '@/components/admin/ui';
import { CheckCircle2, ArrowLeft, AlertCircle, Clock, ShoppingCart, User, MapPin, Receipt, ArrowRight } from 'lucide-react';

interface EditableLine {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  image?: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function OrderPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = typeof params.id === 'string' ? decodeURIComponent(params.id) : '';

  const [order, setOrder] = useState<Order | undefined>(() => (orderId ? getOrder(orderId) : undefined));
  const [lines, setLines] = useState<EditableLine[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'COD'>('Unpaid');
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const inventory = useMemo(() => getInventory(), []);

  // Sync order data from storage
  const reloadOrder = () => {
    if (!orderId) return;
    const found = getOrder(orderId);
    setOrder(found);
    if (found) {
      setPaymentStatus(found.paymentStatus);
      const mapped: EditableLine[] = found.items.map((item) => {
        const invItem = inventory.find((i) => i.productId === item.productId);
        const prod = PRODUCTS.find((p) => p.id === item.productId);
        const unitPrice = getSellingPrice(item.productId) ?? item.unitPrice;
        const qty = item.quantity;
        return {
          productId: item.productId,
          productName: item.productName,
          quantity: qty,
          unit: item.unit,
          unitPrice,
          lineTotal: round2(qty * unitPrice),
          image: invItem?.image || prod?.image,
        };
      });
      setLines(mapped);
    }
  };

  useEffect(() => {
    reloadOrder();
  }, [orderId]);

  useEffect(() => {
    const handleUpdate = () => reloadOrder();
    window.addEventListener('sabuja_orders_updated', handleUpdate);
    return () => window.removeEventListener('sabuja_orders_updated', handleUpdate);
  }, [orderId]);

  if (!orderId || !order) {
    return (
      <Card className="max-w-2xl mx-auto my-8">
        <CardHeader title="Order Not Found" />
        <div className="p-6 text-center space-y-4">
          <Empty text={`Order “${orderId}” could not be found.`} />
          <Link href="/admin" className={btnPrimary}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </Card>
    );
  }

  // Real-time calculations based on editable lines
  const subtotal = round2(lines.reduce((sum, l) => sum + (l.quantity > 0 ? l.lineTotal : 0), 0));
  const deliveryFee = subtotal > 0 && subtotal < 149 ? 25 : 0;
  const grandTotal = round2(subtotal + deliveryFee);

  const hasInvalidQty = lines.some((l) => !Number.isFinite(l.quantity) || l.quantity <= 0);
  const isPending = order.status === 'Pending';
  const isConfirmedOrLater = order.status !== 'Pending';

  const stepQuantity = (index: number, delta: number) => {
    if (!isPending) return; // Only allow editing while Pending / Review
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const step = l.unit === 'kg' ? 0.5 : 1;
        const nextQty = Math.max(step, round2(l.quantity + delta * step));
        return {
          ...l,
          quantity: nextQty,
          lineTotal: round2(nextQty * l.unitPrice),
        };
      })
    );
  };

  const handleQtyInput = (index: number, val: string) => {
    if (!isPending) return;
    const num = Number(val);
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const validNum = Number.isFinite(num) && num >= 0 ? num : 0;
        return {
          ...l,
          quantity: validNum,
          lineTotal: round2(validNum * l.unitPrice),
        };
      })
    );
  };

  const handlePaymentStatusChange = (newStatus: 'Paid' | 'Unpaid' | 'COD') => {
    setPaymentStatus(newStatus);
    const updated = updateOrderItems(
      order.id,
      lines.map((l) => ({
        productId: l.productId,
        productName: l.productName,
        quantity: l.quantity,
        unit: l.unit,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
      })),
      newStatus
    );
    if (updated) {
      setOrder(updated);
      setFeedback({ text: `Payment status updated to ${newStatus}.`, ok: true });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSaveQuantityChanges = () => {
    if (hasInvalidQty) {
      setFeedback({ text: 'Please ensure all items have a quantity greater than 0.', ok: false });
      return;
    }
    const updated = updateOrderItems(
      order.id,
      lines.map((l) => ({
        productId: l.productId,
        productName: l.productName,
        quantity: l.quantity,
        unit: l.unit,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
      })),
      paymentStatus
    );
    if (updated) {
      setOrder(updated);
      setFeedback({ text: `Quantities and order total (${inr(updated.amount)}) saved successfully.`, ok: true });
      setTimeout(() => setFeedback(null), 3500);
    } else {
      setFeedback({ text: 'Failed to save quantity changes.', ok: false });
    }
  };

  const handleConfirmOrder = () => {
    if (!isPending) return;
    if (hasInvalidQty) {
      setFeedback({ text: 'Please fix invalid product quantities before confirming.', ok: false });
      return;
    }
    setIsConfirming(true);
    const result = confirmPendingOrder(
      order.id,
      lines.map((l) => ({
        productId: l.productId,
        productName: l.productName,
        quantity: l.quantity,
        unit: l.unit,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
      })),
      paymentStatus
    );

    setIsConfirming(false);
    if (result.success && result.order) {
      setOrder(result.order);
      setFeedback({
        text: `Order #${order.id} confirmed and moved to Confirmed / Processing!`,
        ok: true,
      });
    } else {
      setFeedback({ text: result.error || 'Failed to confirm order.', ok: false });
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-10">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
          </Link>
          <span className="text-xs text-gray-400">/</span>
          <span className="font-mono text-xs font-bold text-[#0B3D2E]">{order.id}</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge>{order.status}</Badge>
          <Badge>{order.paymentStatus}</Badge>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-xs font-medium border ${
            feedback.ok
              ? 'bg-emerald-50 border-emerald-200 text-[#0B3D2E]'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.ok ? (
              <CheckCircle2 className="h-4 w-4 text-[#2F8F4E] shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Confirmation Success Callout with Billing Prep link */}
      {isConfirmedOrLater && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#2F8F4E]" />
              <p className="text-xs font-bold text-[#0B3D2E]">
                This order has been confirmed ({STATUS_LABEL[order.status] ?? order.status}).
              </p>
            </div>
            <p className="text-[11px] text-gray-600 ml-6">
              It has been removed from Pending Orders and is now ready for order preparation and billing.
            </p>
          </div>
          <Link
            href={`/admin/billing?orderId=${encodeURIComponent(order.id)}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2F8F4E] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#257a40] transition-colors shadow-2xs"
          >
            Proceed to Billing Prep & Invoice <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Order & Customer Details Card */}
      <Card>
        <CardHeader
          title={`Order Preview · ${order.id}`}
          action={
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span>{fmtDate(order.date)}</span>
            </div>
          }
        />
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div className="space-y-1">
            <span className="block font-medium text-gray-500">Customer Name</span>
            {order.customerId ? (
              <Link
                href={`/admin/customers?customerId=${encodeURIComponent(order.customerId)}`}
                className="font-semibold text-gray-900 hover:text-[#2F8F4E] hover:underline"
              >
                {order.customerName}
              </Link>
            ) : (
              <span className="font-semibold text-gray-900">{order.customerName}</span>
            )}
          </div>

          <div className="space-y-1">
            <span className="block font-medium text-gray-500">Phone Number</span>
            <span className="font-medium text-gray-800">{order.customerPhone || 'Not provided'}</span>
          </div>

          <div className="space-y-1">
            <span className="block font-medium text-gray-500">Email Address</span>
            <span className="font-medium text-gray-800">{order.customerEmail || 'Not provided'}</span>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <span className="block font-medium text-gray-500">Delivery Address</span>
            <div className="flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <span className="font-medium text-gray-800">{order.address}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="block font-medium text-gray-500">Delivery Slot</span>
            <span className="font-medium text-gray-800">{order.deliveryDate || 'Standard Delivery'}</span>
          </div>

          <div className="space-y-1">
            <span className="block font-medium text-gray-500">Payment Method</span>
            <span className="font-semibold text-gray-900">{order.paymentMethod}</span>
          </div>

          <div className="space-y-1">
            <span className="block font-medium text-gray-500">Payment Status</span>
            <select
              aria-label="Update payment status"
              value={paymentStatus}
              onChange={(e) => handlePaymentStatusChange(e.target.value as 'Paid' | 'Unpaid' | 'COD')}
              className={`${input} py-1 text-xs`}
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
              <option value="COD">COD (Cash on Delivery)</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="block font-medium text-gray-500">Invoice Number</span>
            <span className="font-mono font-medium text-gray-700">
              {order.invoiceNumber || 'Not generated yet (assigned during billing finalization)'}
            </span>
          </div>

          {order.status === 'Cancelled' && (
            <div className="space-y-1 sm:col-span-3 rounded-md bg-red-50 p-2.5 border border-red-200">
              <span className="block font-bold text-red-700">Cancellation Reason</span>
              <p className="text-xs text-red-600">{order.cancellationReason || 'No reason specified'}</p>
              {order.cancelledAt && (
                <span className="block text-[10px] text-red-500 mt-0.5">Cancelled at {fmtDate(order.cancelledAt)}</span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Ordered Products & Quantities Review Card */}
      <Card>
        <CardHeader
          title="Ordered Products & Quantities"
          action={
            isPending ? (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                Quantities editable during pending review
              </span>
            ) : (
              <span className="text-[11px] font-medium text-gray-500">
                Quantities finalized (order confirmed)
              </span>
            )
          }
        />
        <Table head={['', 'Product', 'Quantity', 'Unit', 'Unit Price', 'Line Total']}>
          {lines.map((line, idx) => (
            <tr key={line.productId} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-3 py-2 w-10">
                {line.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={line.image} alt="" className="h-8 w-8 rounded object-cover border border-gray-100" />
                ) : (
                  <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                )}
              </td>
              <td className={`${td} font-semibold text-gray-900`}>{line.productName}</td>
              <td className={td}>
                {isPending ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Decrease ${line.productName}`}
                      onClick={() => stepQuantity(idx, -1)}
                      className="h-7 w-7 rounded border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      aria-label={`Quantity of ${line.productName}`}
                      min={line.unit === 'kg' ? 0.5 : 1}
                      step={line.unit === 'kg' ? 0.5 : 1}
                      value={line.quantity}
                      onChange={(e) => handleQtyInput(idx, e.target.value)}
                      className="w-16 h-7 rounded border border-gray-200 bg-white text-center text-xs font-semibold tabular-nums focus:border-[#2F8F4E] outline-none"
                    />
                    <button
                      type="button"
                      aria-label={`Increase ${line.productName}`}
                      onClick={() => stepQuantity(idx, 1)}
                      className="h-7 w-7 rounded border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="font-semibold tabular-nums text-gray-900">{line.quantity}</span>
                )}
              </td>
              <td className={`${td} text-gray-600`}>{line.unit}</td>
              <td className={`${td} tabular-nums text-gray-700`}>
                <span>{inr(line.unitPrice)}</span>
                <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 font-medium">
                  Auto
                </span>
              </td>
              <td className={`${td} font-bold tabular-nums text-gray-900`}>{inr(line.lineTotal)}</td>
            </tr>
          ))}
        </Table>

        {/* Totals Summary */}
        <div className="ml-auto max-w-xs space-y-1.5 border-t border-gray-100 p-4 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold tabular-nums text-gray-800">{inr(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery Fee {subtotal >= 149 ? '(Free ≥ ₹149)' : ''}</span>
            <span className="font-semibold tabular-nums text-gray-800">
              {deliveryFee === 0 ? 'Free (₹0)' : inr(deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold text-[#0B3D2E]">
            <span>Grand Total</span>
            <span className="tabular-nums text-base">{inr(grandTotal)}</span>
          </div>
        </div>
      </Card>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {isPending && (
            <>
              <button
                type="button"
                onClick={handleSaveQuantityChanges}
                disabled={hasInvalidQty}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-2xs"
              >
                Save Quantity Changes
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={hasInvalidQty || isConfirming}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2F8F4E] px-4 py-2 text-xs font-bold text-white hover:bg-[#257a40] transition-colors disabled:opacity-50 shadow-2xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isConfirming ? 'Confirming…' : 'Confirm Order'}
              </button>
            </>
          )}

          {isConfirmedOrLater && (
            <Link
              href={`/admin/billing?orderId=${encodeURIComponent(order.id)}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#2F8F4E] px-4 py-2 text-xs font-bold text-white hover:bg-[#257a40] transition-colors shadow-2xs"
            >
              Open Order Billing & Invoice <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
