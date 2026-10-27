'use client';

import React, { useMemo, useState } from 'react';
import { addExpense, deleteExpense, getExpenses, getOrders, updateExpense, type Expense } from '@/lib/admin-data';
import { Card, CardHeader, Confirm, Empty, Field, Modal, Stat, Table, btnDanger, btnGhost, btnPrimary, input, td, inr, fmtDate } from '@/components/admin/ui';

const CATS = ['Produce Procurement', 'Packaging', 'Delivery', 'Wages', 'Miscellaneous'];
type Range = 'today' | '7d' | '30d' | 'month' | 'custom';

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function rangeBounds(r: Range, from: string, to: string): [Date, Date] {
  const now = new Date();
  const end = new Date(dayStart(now).getTime() + 86400000 - 1);
  if (r === 'today') return [dayStart(now), end];
  if (r === '7d') return [new Date(dayStart(now).getTime() - 6 * 86400000), end];
  if (r === '30d') return [new Date(dayStart(now).getTime() - 29 * 86400000), end];
  if (r === 'month') return [new Date(now.getFullYear(), now.getMonth(), 1), end];
  const f = from ? new Date(from) : new Date(0);
  const t = to ? new Date(new Date(to).getTime() + 86400000 - 1) : end;
  return [f, t];
}

const blank = { date: new Date().toISOString().slice(0, 10), category: CATS[0], description: '', amount: '', reference: '' };

export default function FinancePage() {
  const [expenses, setExpenses] = useState<Expense[]>(() => getExpenses());
  const orders = useMemo(() => getOrders(), []);
  const [range, setRange] = useState<Range>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [form, setForm] = useState<{ id?: string } & typeof blank | null>(null);
  const [err, setErr] = useState('');
  const [del, setDel] = useState<Expense | null>(null);

  const [start, end] = rangeBounds(range, from, to);
  const inRange = (iso: string) => { const d = new Date(iso); return d >= start && d <= end; };

  const rOrders = orders.filter((o) => inRange(o.date));
  const valid = rOrders.filter((o) => o.status !== 'Cancelled');
  const gross = valid.reduce((s, o) => s + o.amount, 0);
  const collected = valid.filter((o) => o.paymentStatus === 'Paid' || o.status === 'Delivered').reduce((s, o) => s + o.amount, 0);
  const cancelled = rOrders.filter((o) => o.status === 'Cancelled');
  const cancelledValue = cancelled.reduce((s, o) => s + o.amount, 0);
  const rExp = expenses.filter((e) => inRange(e.date)).sort((a, b) => b.date.localeCompare(a.date));
  const expTotal = rExp.reduce((s, e) => s + e.amount, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const amount = Number(form.amount);
    if (!form.date) return setErr('Date is required.');
    if (!form.description.trim()) return setErr('Description is required.');
    if (!Number.isFinite(amount) || amount <= 0) return setErr('Amount must be greater than 0.');
    const data = { date: form.date, category: form.category, description: form.description.trim(), amount, reference: form.reference.trim() || undefined };
    if (form.id) updateExpense(form.id, data); else addExpense(data);
    setExpenses(getExpenses());
    setForm(null); setErr('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {([['today', 'Today'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['month', 'This month'], ['custom', 'Custom']] as [Range, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setRange(k)} className={range === k ? btnPrimary : btnGhost}>{l}</button>
        ))}
        {range === 'custom' && (
          <>
            <input aria-label="From date" type="date" className={`${input} w-36`} value={from} onChange={(e) => setFrom(e.target.value)} />
            <input aria-label="To date" type="date" className={`${input} w-36`} value={to} onChange={(e) => setTo(e.target.value)} />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Gross sales" value={inr(gross)} hint="Excludes cancelled" />
        <Stat label="Collected" value={inr(collected)} hint="Paid / delivered orders" />
        <Stat label="Cancellations" value={`${cancelled.length}`} hint={inr(cancelledValue)} />
        <Stat label="Expenses" value={inr(expTotal)} />
        <Stat label="Est. profit" value={inr(gross - expTotal)} hint="Gross sales − expenses (estimate)" />
        <Stat label="Net cash flow" value={inr(collected - expTotal)} hint="Collected − expenses" />
      </div>
      <p className="text-[11px] text-gray-400">Refund data is not tracked in the current data model, so refunds are shown as “Not available”.</p>

      <Card>
        <CardHeader title="Expenses" action={<button className={btnPrimary} onClick={() => { setForm({ ...blank }); setErr(''); }}>Add expense</button>} />
        {rExp.length === 0 ? <Empty text="No expenses in this period." /> : (
          <Table head={['Date', 'Category', 'Description', 'Amount', 'Reference', '']}>
            {rExp.map((x) => (
              <tr key={x.id}>
                <td className={td}>{fmtDate(x.date)}</td>
                <td className={td}>{x.category}</td>
                <td className={td}>{x.description}</td>
                <td className={td}>{inr(x.amount)}</td>
                <td className={td}>{x.reference ?? '—'}</td>
                <td className={td}>
                  <span className="flex gap-1">
                    <button className={btnGhost} onClick={() => { setForm({ id: x.id, date: x.date.slice(0, 10), category: x.category, description: x.description, amount: String(x.amount), reference: x.reference ?? '' }); setErr(''); }}>Edit</button>
                    <button className={btnDanger} onClick={() => setDel(x)}>Delete</button>
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {form && (
        <Modal title={form.id ? 'Edit expense' : 'Add expense'} onClose={() => setForm(null)}>
          <form onSubmit={submit} className="space-y-3" noValidate>
            <Field label="Date"><input type="date" className={input} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
            <Field label="Category">
              <select className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
            </Field>
            <Field label="Description"><input className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Amount (₹)"><input type="number" min={0} step="0.01" className={input} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
            <Field label="Reference / notes (optional)"><input className={input} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></Field>
            {err && <p role="alert" className="text-xs text-red-600">{err}</p>}
            <div className="flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setForm(null)}>Cancel</button><button type="submit" className={btnPrimary}>Save</button></div>
          </form>
        </Modal>
      )}
      {del && <Confirm message={`Delete expense “${del.description}” (${inr(del.amount)})?`} onNo={() => setDel(null)} onYes={() => { deleteExpense(del.id); setExpenses(getExpenses()); setDel(null); }} />}
    </div>
  );
}
