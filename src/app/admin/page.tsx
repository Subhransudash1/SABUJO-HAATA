'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock, XCircle, PackageCheck, Truck, AlertTriangle } from 'lucide-react';
import {
  getOrders,
  getInventory,
  getTopSellingProducts,
  updateOrderStatus,
  getPermittedNextStatuses,
  type Order,
  type OrderStatus,
} from '@/lib/admin-data';
import { Badge, Card, CardHeader, Confirm, Empty, STATUS_LABEL, Stat, Table, td, inr, fmtDate } from '@/components/admin/ui';

const CARDS: { label: string; status: OrderStatus; icon: React.ReactNode }[] = [
  { label: 'Pending Orders', status: 'Pending', icon: <Clock className="h-4 w-4 text-amber-500" /> },
  { label: 'Cancelled Orders', status: 'Cancelled', icon: <XCircle className="h-4 w-4 text-red-500" /> },
  { label: 'Ready to Ship', status: 'Ready', icon: <PackageCheck className="h-4 w-4 text-sky-500" /> },
  { label: 'Out for Delivery', status: 'Out for Delivery', icon: <Truck className="h-4 w-4 text-violet-500" /> },
  { label: 'Could Not Be Delivered', status: 'Could Not Deliver', icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
];

const STATUS_OPTIONS: OrderStatus[] = ['Pending', 'Confirmed', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled', 'Could Not Deliver'];
const label = (s: string) => STATUS_LABEL[s] ?? s;

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const inventory = useMemo(() => getInventory(), []);
  const top = useMemo(() => getTopSellingProducts(5), []);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [pendingCancel, setPendingCancel] = useState<Order | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const handleUpdate = () => setOrders(getOrders());
    window.addEventListener('sabuja_orders_updated', handleUpdate);
    return () => window.removeEventListener('sabuja_orders_updated', handleUpdate);
  }, []);

  const changeStatus = (o: Order, status: OrderStatus) => {
    if (status === o.status) return;
    const ok = updateOrderStatus(o.id, status);
    if (ok) {
      setOrders(getOrders());
      setToast({ ok: true, text: `${o.id} moved to ${label(status)}.` });
    } else {
      setToast({ ok: false, text: `Could not update ${o.id}.` });
    }
  };

  const request = (o: Order, status: OrderStatus) => {
    if (status === 'Cancelled') setPendingCancel(o);
    else changeStatus(o, status);
  };

  const pending = orders.filter((o) => o.status === 'Pending');
  const recent = [...orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const inStock = inventory.filter((i) => i.stockQty > 10).length;
  const low = inventory.filter((i) => i.stockQty > 0 && i.stockQty <= 10).length;
  const out = inventory.filter((i) => i.stockQty === 0).length;

  /**
   * Pending orders row: displays order info and a single View action.
   * Inline status-changing dropdown controls are removed.
   */
  const pendingOrderRow = (o: Order) => (
    <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
      <td className={`${td} font-mono text-[11px] font-semibold text-[#0B3D2E]`}>{o.id}</td>
      <td className={`${td} max-w-[130px] xl:max-w-[170px] truncate font-medium text-gray-800`} title={o.customerName}>
        {o.customerId ? (
          <Link href={`/admin/customers?customerId=${encodeURIComponent(o.customerId)}`} className="hover:text-[#2F8F4E] hover:underline">
            {o.customerName}
          </Link>
        ) : (
          o.customerName
        )}
      </td>
      <td className={`${td} text-[11px] text-gray-500`}>{fmtDate(o.date)}</td>
      <td className={`${td} text-center tabular-nums`}>{o.items.length}</td>
      <td className={`${td} font-semibold tabular-nums text-gray-900`}>{inr(o.amount)}</td>
      <td className={td}><Badge>{o.paymentStatus}</Badge></td>
      <td className={td}><Badge>{o.status}</Badge></td>
      <td className={td}>
        <Link
          href={`/admin/orders/${encodeURIComponent(o.id)}`}
          className="inline-flex items-center rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#2F8F4E] hover:bg-emerald-50/70 hover:border-[#2F8F4E]/50 transition-colors shadow-2xs"
        >
          View
        </Link>
      </td>
    </tr>
  );

  /**
   * Recent orders row: available actions strictly depend on current status.
   * Invalid status transitions are completely excluded.
   */
  const recentOrderRow = (o: Order) => {
    const permitted = getPermittedNextStatuses(o.status);
    const options = [o.status, ...permitted.filter((s) => s !== o.status)];

    return (
      <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
        <td className={`${td} font-mono text-[11px] font-semibold text-[#0B3D2E]`}>{o.id}</td>
        <td className={`${td} max-w-[130px] xl:max-w-[170px] truncate font-medium text-gray-800`} title={o.customerName}>
          {o.customerId ? (
            <Link href={`/admin/customers?customerId=${encodeURIComponent(o.customerId)}`} className="hover:text-[#2F8F4E] hover:underline">
              {o.customerName}
            </Link>
          ) : (
            o.customerName
          )}
        </td>
        <td className={`${td} text-[11px] text-gray-500`}>{fmtDate(o.date)}</td>
        <td className={`${td} text-center tabular-nums`}>{o.items.length}</td>
        <td className={`${td} font-semibold tabular-nums text-gray-900`}>{inr(o.amount)}</td>
        <td className={td}><Badge>{o.paymentStatus}</Badge></td>
        <td className={td}><Badge>{o.status}</Badge></td>
        <td className={td}>
          <div className="flex items-center gap-1.5">
            {o.status === 'Pending' ? (
              <Link
                href={`/admin/orders/${encodeURIComponent(o.id)}`}
                className="inline-flex items-center rounded border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2F8F4E] hover:bg-emerald-50/60 hover:border-[#2F8F4E]/40 transition-colors"
              >
                View
              </Link>
            ) : permitted.length > 0 ? (
              <>
                <select
                  aria-label={`Update status of ${o.id}`}
                  value={o.status}
                  onChange={(e) => request(o, e.target.value as OrderStatus)}
                  className="w-[126px] xl:w-[138px] rounded border border-gray-200 bg-white px-1.5 py-1 text-[11px] font-medium text-gray-700 focus:border-[#2F8F4E] focus:outline-none focus:ring-1 focus:ring-[#2F8F4E]"
                >
                  {options.map((s) => (
                    <option key={s} value={s}>
                      {label(s)}
                    </option>
                  ))}
                </select>
                <Link
                  href={`/admin/billing?orderId=${encodeURIComponent(o.id)}`}
                  className="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-[#2F8F4E] hover:bg-emerald-50/60 hover:border-[#2F8F4E]/40 transition-colors"
                >
                  Billing
                </Link>
              </>
            ) : (
              <Link
                href={`/admin/billing?orderId=${encodeURIComponent(o.id)}`}
                className="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Invoice
              </Link>
            )}
          </div>
        </td>
      </tr>
    );
  };
  const head = ['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'];

  return (
    <div className="space-y-4">
      {toast && (
        <div role="status" aria-live="polite" className={`fixed bottom-4 right-4 z-50 rounded-md px-3 py-2 text-xs font-medium shadow-lg ${toast.ok ? 'bg-[#0B3D2E] text-[#B9F0A8]' : 'bg-red-600 text-white'}`}>
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {CARDS.map((c) => (
          <Stat key={c.status} label={c.label} icon={c.icon} value={orders.filter((o) => o.status === c.status).length} />
        ))}
      </div>

      <Card>
        <CardHeader title={`Pending orders (${pending.length})`} />
        {pending.length === 0 ? <Empty text="No pending orders." /> : (
          <Table head={head}>{pending.map(pendingOrderRow)}</Table>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-12 items-start">
        <Card className="lg:col-span-9 min-w-0">
          <CardHeader title="Recent orders" />
          {recent.length === 0 ? <Empty text="No orders yet." /> : <Table head={head}>{recent.map(recentOrderRow)}</Table>}
        </Card>
        <div className="lg:col-span-3 min-w-0 space-y-4">
          <Card>
            <CardHeader
              title="Stock summary"
              action={<Link href="/admin/inventory" className="text-xs font-medium text-[#2F8F4E] hover:underline">Manage →</Link>}
            />
            <div className="divide-y divide-gray-100 px-3.5 py-1 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  In stock
                </span>
                <span className="font-semibold tabular-nums text-[#0B3D2E]">{inStock}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Low stock
                </span>
                <span className="font-semibold tabular-nums text-amber-700">{low}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Out of stock
                </span>
                <span className="font-semibold tabular-nums text-red-600">{out}</span>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Top products by revenue" />
            {top.length === 0 ? <Empty text="No sales data." /> : (
              <ul className="divide-y divide-gray-100 text-xs">
                {top.map((p) => (
                  <li key={p.productName} className="flex items-center justify-between gap-2 px-3.5 py-2">
                    <span className="truncate text-gray-700">{p.productName}</span>
                    <span className="shrink-0 font-medium tabular-nums text-gray-600">{inr(p.totalRevenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {pendingCancel && (
        <Confirm
          message={`Cancel order ${pendingCancel.id} for ${pendingCancel.customerName}?`}
          onNo={() => setPendingCancel(null)}
          onYes={() => { changeStatus(pendingCancel, 'Cancelled'); setPendingCancel(null); }}
        />
      )}
    </div>
  );
}
