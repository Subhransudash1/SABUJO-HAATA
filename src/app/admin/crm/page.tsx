'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { addCustomerNote, getCustomerNotes, getCustomerStats, getOrders, type CustomerStats } from '@/lib/admin-data';
import { Badge, Card, CardHeader, Empty, Table, btnGhost, btnPrimary, input, td, inr, fmtDate } from '@/components/admin/ui';

// Segment definitions (based on non-cancelled order history):
//  New = exactly 1 order · Repeat = 2+ orders · High value = spent ≥ ₹3000 · Inactive = no orders, or last order > 14 days ago
const DAY = 86400000;
const segmentOf = (c: CustomerStats, now: number): string => {
  if (c.orderCount === 0) return 'Inactive';
  if (c.lastOrder && now - new Date(c.lastOrder).getTime() > 14 * DAY) return 'Inactive';
  if (c.spent >= 3000) return 'High value';
  if (c.orderCount >= 2) return 'Repeat';
  return 'New';
};
const SEGS = ['All', 'New', 'Repeat', 'High value', 'Inactive'];
const TONE: Record<string, 'green' | 'blue' | 'purple' | 'gray'> = { New: 'blue', Repeat: 'green', 'High value': 'purple', Inactive: 'gray' };

export default function CrmPage() {
  const now = useMemo(() => Date.now(), []);
  const customers = useMemo(() => getCustomerStats(), []);
  const orders = useMemo(() => getOrders(), []);
  const [seg, setSeg] = useState('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [ver, setVer] = useState(0);

  const withSeg = customers.map((c) => ({ ...c, segment: segmentOf(c, now) }));
  const rows = withSeg.filter((c) => (seg === 'All' || c.segment === seg) && (!q.trim() || `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q.trim().toLowerCase())));
  const selected = withSeg.find((c) => c.id === open);
  const myOrders = selected ? orders.filter((o) => o.customerId === selected.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notes = useMemo(() => (selected ? getCustomerNotes(selected.id) : []), [selected, ver]);
  const activity = [...orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader title="Customers" action={<input aria-label="Search customers" className={`${input} w-48`} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />} />
        <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2">
          {SEGS.map((s) => (
            <button key={s} className={seg === s ? btnPrimary : btnGhost} onClick={() => setSeg(s)}>
              {s} ({s === 'All' ? withSeg.length : withSeg.filter((c) => c.segment === s).length})
            </button>
          ))}
        </div>
        {rows.length === 0 ? <Empty text="No customers in this segment." /> : (
          <Table head={['Name', 'Phone', 'Orders', 'Spent', 'Last order', 'Segment']}>
            {rows.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setOpen(c.id)}>
                <td className={`${td} font-medium`}><button type="button" onClick={(e) => { e.stopPropagation(); setOpen(c.id); }} className="hover:underline text-left">{c.name}</button></td>
                <td className={td}>{c.phone || 'Not available'}</td>
                <td className={td}>{c.orderCount}</td>
                <td className={td}>{inr(c.spent)}</td>
                <td className={td}>{fmtDate(c.lastOrder)}</td>
                <td className={td}><Badge tone={TONE[c.segment]}>{c.segment}</Badge></td>
              </tr>
            ))}
          </Table>
        )}
        <p className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400">Segments: New = 1 order · Repeat = 2+ orders · High value = ₹3,000+ spent · Inactive = no orders or none in 14 days. Messaging integrations (email/SMS/WhatsApp) are not configured.</p>
      </Card>

      <div className="space-y-4">
        {selected && (
          <Card>
            <CardHeader
              title={selected.name}
              action={
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/customers?customerId=${encodeURIComponent(selected.id)}`}
                    className="text-xs font-medium text-[#2F8F4E] hover:underline"
                  >
                    Full details →
                  </Link>
                  <button className="text-xs text-gray-400" onClick={() => setOpen(null)}>Close</button>
                </div>
              }
            />
            <div className="space-y-3 p-4 text-xs">
              <div>
                <h3 className="mb-1 font-semibold text-gray-600">Order history ({myOrders.length})</h3>
                {myOrders.length === 0 ? <p className="text-gray-400">No orders.</p> : (
                  <ul className="divide-y divide-gray-100">
                    {myOrders.map((o) => (
                      <li key={o.id} className="flex justify-between py-1">
                        <Link href={`/admin/billing?orderId=${encodeURIComponent(o.id)}`} className="text-[#2F8F4E] hover:underline">{o.id}</Link>
                        <span>{fmtDate(o.date)} · {o.status} · {inr(o.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-600">Notes</h3>
                {notes.map((n) => <p key={n.id} className="mb-1 rounded bg-gray-50 p-2">{n.text}</p>)}
                <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; addCustomerNote(selected.id, text.trim()); setText(''); setVer((v) => v + 1); }}>
                  <input aria-label="New note" className={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add note…" />
                  <button className={btnPrimary} type="submit">Add</button>
                </form>
              </div>
            </div>
          </Card>
        )}
        <Card>
          <CardHeader title="Recent activity" />
          {activity.length === 0 ? <Empty text="No activity." /> : (
            <ul className="divide-y divide-gray-100 text-xs">
              {activity.map((o) => <li key={o.id} className="px-4 py-2">{o.customerName} placed {o.id} ({inr(o.amount)}) · {fmtDate(o.date)}</li>)}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
