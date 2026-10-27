'use client';

import React, { useMemo, useState } from 'react';
import { getInventory, getOrders } from '@/lib/admin-data';
import { Card, CardHeader, Empty, Stat, btnGhost, btnPrimary, inr } from '@/components/admin/ui';

const PERIODS: [string, number][] = [['7 days', 7], ['14 days', 14], ['30 days', 30]];
const COLORS: Record<string, string> = {
  Pending: '#F59E0B', Confirmed: '#38BDF8', Ready: '#0EA5E9', 'Out for Delivery': '#8B5CF6', Delivered: '#2F8F4E', Cancelled: '#EF4444', 'Could Not Deliver': '#B91C1C',
};

function BarChart({ data, format }: { data: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <svg viewBox="0 0 400 160" className="h-44 w-full" role="img" aria-label="Bar chart">
      {data.map((d, i) => {
        const h = (d.value / max) * 120;
        return (
          <g key={d.label}>
            <rect x={i * (400 / data.length) + 4} y={130 - h} width={400 / data.length - 8} height={h} rx={2} fill="#2F8F4E">
              <title>{`${d.label}: ${format ? format(d.value) : d.value}`}</title>
            </rect>
            <text x={i * (400 / data.length) + 200 / data.length} y={148} textAnchor="middle" fontSize="8" fill="#6B7280">{d.label}</text>
          </g>
        );
      })}
      <line x1="0" x2="400" y1="130" y2="130" stroke="#E5E7EB" />
    </svg>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(14);
  const orders = useMemo(() => getOrders(), []);
  const inventory = useMemo(() => getInventory(), []);

  const buckets = useMemo(() => {
    const out: { label: string; key: string; revenue: number; orders: number }[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      out.push({ key: d.toDateString(), label: `${d.getDate()}/${d.getMonth() + 1}`, revenue: 0, orders: 0 });
    }
    for (const o of orders) {
      const b = out.find((x) => x.key === new Date(o.date).toDateString());
      if (!b) continue;
      b.orders += 1;
      if (o.status !== 'Cancelled') b.revenue += o.amount;
    }
    return out;
  }, [orders, days]);

  const scoped = useMemo(() => {
    const keys = new Set(buckets.map((b) => b.key));
    return orders.filter((o) => keys.has(new Date(o.date).toDateString()));
  }, [orders, buckets]);

  const valid = scoped.filter((o) => o.status !== 'Cancelled');
  const revenue = valid.reduce((s, o) => s + o.amount, 0);
  const aov = valid.length ? revenue / valid.length : 0;
  const statuses = Object.keys(COLORS).map((s) => ({ s, n: scoped.filter((o) => o.status === s).length }));
  const totalStatus = statuses.reduce((a, b) => a + b.n, 0);

  const top = useMemo(() => {
    const m = new Map<string, number>();
    valid.forEach((o) => o.items.forEach((i) => m.set(i.productName, (m.get(i.productName) ?? 0) + i.lineTotal)));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label: label.slice(0, 8), value }));
  }, [valid]);

  const delivered = scoped.filter((o) => o.status === 'Delivered').length;
  const failed = scoped.filter((o) => o.status === 'Could Not Deliver').length;
  const stock = { ok: inventory.filter((i) => i.stockQty > 10).length, low: inventory.filter((i) => i.stockQty > 0 && i.stockQty <= 10).length, out: inventory.filter((i) => i.stockQty === 0).length };
  const empty = scoped.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {PERIODS.map(([l, d]) => <button key={l} className={days === d ? btnPrimary : btnGhost} onClick={() => setDays(d)}>{l}</button>)}
        <span className="text-[11px] text-gray-400">Development demo data stored in this browser.</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Revenue" value={inr(revenue)} />
        <Stat label="Orders" value={scoped.length} />
        <Stat label="Average order value" value={valid.length ? inr(aov) : 'Not available'} />
        <Stat label="Delivery success" value={delivered + failed ? `${((delivered / (delivered + failed)) * 100).toFixed(0)}%` : 'Not available'} hint={`${delivered} delivered · ${failed} failed`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Revenue per day (₹)" />
          {empty ? <Empty text="No orders in this period." /> : <div className="p-3"><BarChart data={buckets.map((b) => ({ label: b.label, value: b.revenue }))} format={inr} /></div>}
        </Card>
        <Card>
          <CardHeader title="Orders per day" />
          {empty ? <Empty text="No orders in this period." /> : <div className="p-3"><BarChart data={buckets.map((b) => ({ label: b.label, value: b.orders }))} /></div>}
        </Card>
        <Card>
          <CardHeader title="Order status distribution" />
          {totalStatus === 0 ? <Empty text="No orders in this period." /> : (
            <div className="space-y-2 p-4">
              <div className="flex h-3 overflow-hidden rounded-full bg-gray-100" role="img" aria-label="Status distribution">
                {statuses.filter((x) => x.n).map((x) => <div key={x.s} style={{ width: `${(x.n / totalStatus) * 100}%`, background: COLORS[x.s] }} title={`${x.s}: ${x.n}`} />)}
              </div>
              <ul className="grid grid-cols-2 gap-1 text-xs">
                {statuses.map((x) => <li key={x.s} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[x.s] }} />{x.s}: {x.n}</li>)}
              </ul>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="Top products by revenue (₹)" />
          {top.length === 0 ? <Empty text="No sales in this period." /> : <div className="p-3"><BarChart data={top} format={inr} /></div>}
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Inventory stock status" />
          <div className="grid grid-cols-3 gap-3 p-3">
            <Stat label="In stock" value={stock.ok} />
            <Stat label="Low stock" value={stock.low} />
            <Stat label="Out of stock" value={stock.out} />
          </div>
        </Card>
      </div>
    </div>
  );
}
