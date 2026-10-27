'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  addCustomerNote, getCustomerNotes, getCustomerStats, getOrders,
  type CustomerStats, type Order,
} from '@/lib/admin-data';
import {
  Badge, Card, CardHeader, Empty, Stat, Table,
  btnGhost, btnPrimary, input, td, inr, fmtDate,
} from '@/components/admin/ui';

const PAGE = 10;

type HistoryFilter = 'All Orders' | 'Delivered' | 'In Progress' | 'Cancelled' | 'Failed';
const HISTORY_FILTERS: HistoryFilter[] = ['All Orders', 'Delivered', 'In Progress', 'Cancelled', 'Failed'];

function matchesHistoryFilter(o: Order, filter: HistoryFilter): boolean {
  if (filter === 'All Orders') return true;
  if (filter === 'Delivered') return o.status === 'Delivered';
  if (filter === 'In Progress') return ['Pending', 'Confirmed', 'Ready', 'Out for Delivery'].includes(o.status);
  if (filter === 'Cancelled') return o.status === 'Cancelled';
  if (filter === 'Failed') return o.status === 'Could Not Deliver';
  return true;
}

function formatItemsSummary(items: Order['items']): string {
  if (!items || items.length === 0) return 'No items';
  return items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ');
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400">Loading customers…</div>}>
      <CustomersContent />
    </Suspense>
  );
}

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCustomerId = searchParams.get('customerId');

  const [customers] = useState(() => getCustomerStats());
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(queryCustomerId);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('All Orders');
  const [noteText, setNoteText] = useState('');
  const [noteVersion, setNoteVersion] = useState(0);

  const activeCustomerId = queryCustomerId ?? selectedId;
  const selected: CustomerStats | null = useMemo(
    () => (activeCustomerId ? customers.find((c) => c.id === activeCustomerId) ?? null : null),
    [customers, activeCustomerId],
  );

  const openCustomer = (c: CustomerStats) => {
    setSelectedId(c.id);
    setHistoryFilter('All Orders');
    router.push(`/admin/customers?customerId=${encodeURIComponent(c.id)}`, { scroll: false });
  };

  const closeCustomer = () => {
    setSelectedId(null);
    router.push('/admin/customers', { scroll: false });
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return customers.filter((c) =>
      (status === 'All' || c.status === status) &&
      (!s || [c.id, c.name, c.phone, c.email, c.address].some((v) => v.toLowerCase().includes(s))));
  }, [customers, q, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PAGE, safePage * PAGE);

  const customerOrders = useMemo(
    () =>
      selected
        ? getOrders()
            .filter((o) => o.customerId === selected.id || (!o.customerId && o.customerPhone === selected.phone))
            .sort((a, b) => b.date.localeCompare(a.date))
        : [],
    [selected],
  );

  const recentOrders = useMemo(() => customerOrders.slice(0, 3), [customerOrders]);
  const filteredHistory = useMemo(
    () => customerOrders.filter((o) => matchesHistoryFilter(o, historyFilter)),
    [customerOrders, historyFilter],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notes = useMemo(() => (selected ? getCustomerNotes(selected.id) : []), [selected, noteVersion]);

  /* ───────────────────────── Complete Customer Details View ───────────────────────── */
  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" className={btnGhost} onClick={closeCustomer}>
            ← Back to Customers
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-500">{selected.id}</span>
            <Badge tone={selected.status === 'Active' ? 'green' : 'gray'}>{selected.status}</Badge>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total Orders" value={selected.orderCount} />
          <Stat label="Total Amount Spent" value={inr(selected.spent)} />
          <Stat label="First Order Date" value={selected.firstOrder ? fmtDate(selected.firstOrder) : 'No orders yet'} />
          <Stat label="Most Recent Order" value={selected.lastOrder ? fmtDate(selected.lastOrder) : 'No orders yet'} />
        </div>

        {/* A. Customer Profile & Internal Notes */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title={`Customer Profile — ${selected.name}`}
              action={<Badge tone={selected.status === 'Active' ? 'green' : 'gray'}>{selected.status}</Badge>}
            />
            <div className="grid gap-4 p-4 text-xs sm:grid-cols-2">
              <div className="rounded-md border border-gray-100 bg-gray-50/60 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Customer ID</div>
                <div className="mt-0.5 font-mono text-sm font-semibold text-[#0B3D2E]">{selected.id}</div>
              </div>
              <div className="rounded-md border border-gray-100 bg-gray-50/60 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Full Name</div>
                <div className="mt-0.5 text-sm font-semibold text-gray-900">{selected.name}</div>
              </div>
              <div className="rounded-md border border-gray-100 bg-gray-50/60 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Phone Number</div>
                <div className="mt-0.5 text-sm font-medium text-gray-800">{selected.phone || 'Not available'}</div>
              </div>
              <div className="rounded-md border border-gray-100 bg-gray-50/60 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Email Address</div>
                <div className="mt-0.5 text-sm font-medium text-gray-800">{selected.email || 'Not available'}</div>
              </div>
              <div className="rounded-md border border-gray-100 bg-gray-50/60 p-3 sm:col-span-2">
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Complete Delivery Address</div>
                <div className="mt-0.5 text-sm font-medium text-gray-800">{selected.address || 'Not available'}</div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Internal Customer Notes" />
            <div className="space-y-3 p-4 text-xs">
              {notes.length === 0 ? (
                <p className="text-gray-400">No internal notes recorded for this customer yet.</p>
              ) : (
                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-md border border-gray-100 bg-gray-50 p-2.5">
                      <p className="text-gray-800">{n.text}</p>
                      <span className="mt-1 block text-[10px] text-gray-400">{fmtDate(n.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
              <form
                className="flex gap-2 pt-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!noteText.trim()) return;
                  addCustomerNote(selected.id, noteText.trim());
                  setNoteText('');
                  setNoteVersion((v) => v + 1);
                }}
              >
                <input
                  aria-label="New note"
                  className={input}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about delivery preferences…"
                />
                <button className={btnPrimary} type="submit">Add</button>
              </form>
            </div>
          </Card>
        </div>

        {/* B. Recent Orders */}
        <Card>
          <CardHeader
            title={`Recent Orders (${recentOrders.length})`}
            action={<span className="text-xs text-gray-400">Latest orders placed by {selected.name}</span>}
          />
          {recentOrders.length === 0 ? (
            <Empty text={`${selected.name} has not placed any orders yet.`} />
          ) : (
            <Table head={['Order ID', 'Order Date', 'Items Ordered', 'Total Amount', 'Payment', 'Order Status', 'Action']}>
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/80">
                  <td className={`${td} font-mono text-xs font-semibold text-[#0B3D2E]`}>{o.id}</td>
                  <td className={td}>{fmtDate(o.date)}</td>
                  <td className={`${td} max-w-[280px]`}>
                    <div className="truncate font-medium text-gray-800" title={formatItemsSummary(o.items)}>
                      {formatItemsSummary(o.items)}
                    </div>
                    <div className="text-[11px] text-gray-400">{o.items.length} item{o.items.length === 1 ? '' : 's'}</div>
                  </td>
                  <td className={`${td} font-semibold tabular-nums text-gray-900`}>{inr(o.amount)}</td>
                  <td className={td}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-600">{o.paymentMethod}</span>
                      <Badge>{o.paymentStatus}</Badge>
                    </div>
                  </td>
                  <td className={td}><Badge>{o.status}</Badge></td>
                  <td className={td}>
                    <Link
                      href={`/admin/billing?orderId=${encodeURIComponent(o.id)}`}
                      className="inline-flex items-center rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#2F8F4E] hover:border-[#2F8F4E]/40 hover:bg-emerald-50/60"
                    >
                      View Order
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        {/* C. Complete Order History with Status Filter Tabs */}
        <Card>
          <CardHeader
            title={`Complete Order History (${customerOrders.length})`}
            action={
              <div className="flex flex-wrap gap-1.5">
                {HISTORY_FILTERS.map((f) => {
                  const count = customerOrders.filter((o) => matchesHistoryFilter(o, f)).length;
                  return (
                    <button
                      key={f}
                      type="button"
                      className={historyFilter === f ? btnPrimary : btnGhost}
                      onClick={() => setHistoryFilter(f)}
                    >
                      {f} ({count})
                    </button>
                  );
                })}
              </div>
            }
          />
          {customerOrders.length === 0 ? (
            <Empty text={`No order history found for ${selected.name}.`} />
          ) : filteredHistory.length === 0 ? (
            <Empty text={`No "${historyFilter}" orders for ${selected.name}.`} />
          ) : (
            <Table head={['Order ID', 'Order Date', 'Ordered Products & Quantities', 'Total Amount', 'Payment Method & Status', 'Delivery Status', 'Action']}>
              {filteredHistory.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/80">
                  <td className={`${td} font-mono text-xs font-semibold text-[#0B3D2E]`}>{o.id}</td>
                  <td className={td}>{fmtDate(o.date)}</td>
                  <td className={`${td} max-w-[320px]`}>
                    <div className="text-xs text-gray-800">{formatItemsSummary(o.items)}</div>
                  </td>
                  <td className={`${td} font-semibold tabular-nums text-gray-900`}>{inr(o.amount)}</td>
                  <td className={td}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-600">{o.paymentMethod}</span>
                      <Badge>{o.paymentStatus}</Badge>
                    </div>
                  </td>
                  <td className={td}><Badge>{o.status}</Badge></td>
                  <td className={td}>
                    <Link
                      href={`/admin/billing?orderId=${encodeURIComponent(o.id)}`}
                      className="inline-flex items-center rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#2F8F4E] hover:border-[#2F8F4E]/40 hover:bg-emerald-50/60"
                    >
                      View Order
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    );
  }

  /* ───────────────────────── Customers Directory Table ───────────────────────── */
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total Customers" value={customers.length} />
        <Stat label="Active Customers" value={customers.filter((c) => c.status === 'Active').length} />
        <Stat label="Total Orders Placed" value={customers.reduce((s, c) => s + c.orderCount, 0)} />
        <Stat label="Total Customer Spend" value={inr(customers.reduce((s, c) => s + c.spent, 0))} />
      </div>

      <Card>
        <CardHeader
          title={`Customers (${filtered.length})`}
          action={
            <div className="flex flex-wrap gap-2">
              <input
                aria-label="Search customers"
                placeholder="Search name, phone, ID…"
                className={`${input} w-52`}
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
              />
              <select
                aria-label="Status filter"
                className={`${input} w-28`}
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          }
        />
        {rows.length === 0 ? <Empty text="No customers match." /> : (
          <Table head={['ID', 'Name', 'Phone', 'Email', 'Address', 'Orders', 'Spent', 'Last order', 'Status', 'Action']}>
            {rows.map((c) => (
              <tr
                key={c.id}
                onClick={() => openCustomer(c)}
                className="cursor-pointer hover:bg-emerald-50/40 transition-colors"
              >
                <td className={`${td} font-mono text-xs text-gray-600`}>{c.id}</td>
                <td className={`${td} font-medium text-[#0B3D2E]`}>
                  <button
                    type="button"
                    className="text-left font-semibold hover:underline"
                    onClick={(e) => { e.stopPropagation(); openCustomer(c); }}
                  >
                    {c.name}
                  </button>
                </td>
                <td className={td}>{c.phone || 'Not available'}</td>
                <td className={td}>{c.email || 'Not available'}</td>
                <td className={`${td} max-w-[200px] truncate`} title={c.address}>{c.address || 'Not available'}</td>
                <td className={`${td} tabular-nums font-medium`}>{c.orderCount}</td>
                <td className={`${td} tabular-nums font-semibold`}>{inr(c.spent)}</td>
                <td className={td}>{fmtDate(c.lastOrder)}</td>
                <td className={td}><Badge>{c.status}</Badge></td>
                <td className={td}>
                  <button
                    type="button"
                    className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#2F8F4E] hover:border-[#2F8F4E]/40 hover:bg-emerald-50/60"
                    onClick={(e) => { e.stopPropagation(); openCustomer(c); }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
          <span>Page {safePage} of {pages}</span>
          <div className="flex gap-2">
            <button className="rounded border px-2 py-1 disabled:opacity-40" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Prev</button>
            <button className="rounded border px-2 py-1 disabled:opacity-40" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)}>Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
