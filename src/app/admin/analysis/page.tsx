'use client';

import React, { useMemo, useState } from 'react';
import { getAllProducts, getInventory, getOrders } from '@/lib/admin-data';
import { Card, CardHeader, Empty, Stat, Table, btnGhost, btnPrimary, td, inr } from '@/components/admin/ui';

const PERIODS: [string, number][] = [['7 days', 7], ['30 days', 30], ['All', 0]];

export default function AnalysisPage() {
  const [days, setDays] = useState(0);
  const orders = useMemo(() => getOrders(), []);
  const inventory = useMemo(() => getInventory(), []);
  const products = useMemo(() => getAllProducts(), []);

  const scoped = useMemo(() => {
    if (!days) return orders;
    const cutoff = Date.now() - days * 86400000;
    return orders.filter((o) => new Date(o.date).getTime() >= cutoff);
  }, [orders, days]);

  const total = scoped.length;
  const count = (s: string) => scoped.filter((o) => o.status === s).length;
  const pct = (n: number) => (total ? `${((n / total) * 100).toFixed(0)}%` : '—');

  const sales = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; revenue: number; category: string }>();
    for (const o of scoped) {
      if (o.status === 'Cancelled') continue;
      for (const i of o.items) {
        const p = products.find((x) => x.id === i.productId);
        const e = m.get(i.productId) ?? { name: i.productName, qty: 0, revenue: 0, category: p?.subCategoryLabelEn ?? 'Other' };
        e.qty += i.quantity; e.revenue += i.lineTotal; m.set(i.productId, e);
      }
    }
    return Array.from(m.entries()).map(([id, v]) => ({ id, ...v }));
  }, [scoped, products]);

  const best = [...sales].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const sold = new Set(sales.map((s) => s.id));
  const slow = inventory.filter((i) => !sold.has(i.productId) && i.stockQty > 0).slice(0, 8);
  const shortages = inventory.filter((i) => i.stockQty <= 10).sort((a, b) => a.stockQty - b.stockQty).slice(0, 10);
  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    sales.forEach((s) => m.set(s.category, (m.get(s.category) ?? 0) + s.revenue));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [sales]);

  const insights: string[] = [];
  if (total && count('Cancelled') / total > 0.15) insights.push(`Cancellation rate is ${pct(count('Cancelled'))} — review reasons for cancelled orders.`);
  if (count('Could Not Deliver') > 0) insights.push(`${count('Could Not Deliver')} order(s) could not be delivered — reassign or contact customers.`);
  if (count('Pending') > 0) insights.push(`${count('Pending')} order(s) are still pending.`);
  if (shortages.some((s) => s.stockQty === 0)) insights.push(`${shortages.filter((s) => s.stockQty === 0).length} product(s) are out of stock.`);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">{PERIODS.map(([l, d]) => <button key={l} className={days === d ? btnPrimary : btnGhost} onClick={() => setDays(d)}>{l}</button>)}</div>

      <Card>
        <CardHeader title="Actionable findings" />
        {insights.length === 0 ? <Empty text="No exceptions found for this period." /> : (
          <ul className="list-disc space-y-1 px-8 py-3 text-sm text-gray-700">{insights.map((i) => <li key={i}>{i}</li>)}</ul>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {['Pending', 'Confirmed', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled', 'Could Not Deliver'].map((s) => (
          <Stat key={s} label={s} value={count(s)} hint={pct(count(s))} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Best-selling products" />
          {best.length === 0 ? <Empty text="No sales in this period." /> : (
            <Table head={['Product', 'Qty', 'Revenue']}>{best.map((b) => <tr key={b.id}><td className={td}>{b.name}</td><td className={td}>{b.qty}</td><td className={td}>{inr(b.revenue)}</td></tr>)}</Table>
          )}
        </Card>
        <Card>
          <CardHeader title="Category performance" />
          {byCat.length === 0 ? <Empty text="No sales in this period." /> : (
            <Table head={['Category', 'Revenue']}>{byCat.map(([c, r]) => <tr key={c}><td className={td}>{c}</td><td className={td}>{inr(r)}</td></tr>)}</Table>
          )}
        </Card>
        <Card>
          <CardHeader title="Slow-moving (in stock, no sales in period)" />
          {slow.length === 0 ? <Empty text="None." /> : <ul className="divide-y divide-gray-100 text-sm">{slow.map((s) => <li key={s.productId} className="flex justify-between px-4 py-2"><span>{s.productName}</span><span className="text-gray-500">{s.stockQty} {s.unit}</span></li>)}</ul>}
        </Card>
        <Card>
          <CardHeader title="Stock shortages" />
          {shortages.length === 0 ? <Empty text="No shortages." /> : <ul className="divide-y divide-gray-100 text-sm">{shortages.map((s) => <li key={s.productId} className="flex justify-between px-4 py-2"><span>{s.productName}</span><span className={s.stockQty === 0 ? 'text-red-600' : 'text-amber-600'}>{s.stockQty} {s.unit}</span></li>)}</ul>}
        </Card>
      </div>
    </div>
  );
}
