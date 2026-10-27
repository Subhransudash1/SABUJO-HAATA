'use client';

import React, { useEffect, useState } from 'react';
import {
  addDeliveryPartner, assignDeliveryPerson, getDeliveryPartners, getOrders,
  setDeliveryPartnerStatus, unassignDeliveryPerson, updateOrderStatus, type DeliveryPartner, type OrderStatus,
} from '@/lib/admin-data';
import { Badge, Card, CardHeader, Confirm, Empty, Field, Modal, Stat, Table, btnDanger, btnGhost, btnPrimary, input, td } from '@/components/admin/ui';

const ELIGIBLE: OrderStatus[] = ['Ready', 'Out for Delivery', 'Could Not Deliver'];

export default function DeliveryPage() {
  const [partners, setPartners] = useState(() => getDeliveryPartners());
  const [orders, setOrders] = useState(() => getOrders());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', notes: '' });
  const [err, setErr] = useState('');
  const [confirmDeactivate, setConfirmDeactivate] = useState<DeliveryPartner | null>(null);
  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const refresh = () => {
    setPartners(getDeliveryPartners());
    setOrders(getOrders());
  };

  const active = partners.filter((p) => p.active);
  const inactiveCount = partners.length - active.length;
  const eligible = orders.filter((o) => ELIGIBLE.includes(o.status));
  const nameOf = (id?: string) => partners.find((p) => p.id === id)?.name;

  const assignStatus = (o: (typeof orders)[number]) =>
    o.status === 'Out for Delivery' ? 'Out for delivery' : o.status === 'Could Not Deliver' ? 'Could not deliver' : o.deliveryPersonId ? 'Assigned' : 'Awaiting assignment';

  const handleStatusChange = (partner: DeliveryPartner, nextActive: boolean) => {
    if (partner.active === nextActive) return;
    if (nextActive) {
      setDeliveryPartnerStatus(partner.id, true);
      refresh();
      setToast(`${partner.name} is now Active and available for delivery assignments.`);
    } else {
      setConfirmDeactivate(partner);
    }
  };

  const confirmDeactivation = () => {
    if (!confirmDeactivate) return;
    setDeliveryPartnerStatus(confirmDeactivate.id, false);
    const name = confirmDeactivate.name;
    setConfirmDeactivate(null);
    refresh();
    setToast(`${name} is now Inactive. Existing order history is preserved.`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setErr('Name is required.');
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) return setErr('Enter a valid phone number.');
    const created = addDeliveryPartner({ name: form.name.trim(), phone: form.phone.trim(), notes: form.notes.trim() });
    setForm({ name: '', phone: '', notes: '' });
    setErr('');
    setAdding(false);
    refresh();
    setToast(`Delivery partner ${created.name} (${created.id}) added as Active.`);
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div role="status" aria-live="polite" className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-[#0B3D2E]">
          <span>{toast}</span>
          <button type="button" className="text-gray-400 hover:text-gray-700" onClick={() => setToast('')}>✕</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total Partners" value={partners.length} />
        <Stat label="Active Partners" value={active.length} />
        <Stat label="Inactive Partners" value={inactiveCount} />
        <Stat label="Orders in Delivery Queue" value={eligible.length} />
      </div>

      <Card>
        <CardHeader
          title="Delivery partners"
          action={<button className={btnPrimary} onClick={() => setAdding(true)}>Add delivery partner</button>}
        />
        {partners.length === 0 ? <Empty text="No delivery partners yet." /> : (
          <Table head={['ID', 'Name', 'Contact', 'Assigned orders', 'Status', 'Action']}>
            {partners.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/70">
                <td className={`${td} font-mono text-xs text-gray-600`}>{p.id}</td>
                <td className={td}>
                  <div className="font-medium text-gray-900">{p.name}</div>
                  {p.notes && <div className="text-[11px] text-gray-400">{p.notes}</div>}
                </td>
                <td className={td}>{p.phone || '—'}</td>
                <td className={`${td} tabular-nums font-medium`}>{p.assignedOrders.length}</td>
                <td className={td}>
                  <Badge tone={p.active ? 'green' : 'gray'}>
                    {p.active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className={td}>
                  {p.active ? (
                    <button
                      type="button"
                      className={btnDanger}
                      onClick={() => handleStatusChange(p, false)}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={btnPrimary}
                      onClick={() => handleStatusChange(p, true)}
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Order assignment" />
        {eligible.length === 0 ? <Empty text="No orders awaiting delivery." /> : (
          <Table head={['Order', 'Customer', 'Address', 'Assignment', 'Partner', 'Actions']}>
            {eligible.map((o) => (
              <tr key={o.id}>
                <td className={`${td} font-medium`}>{o.id}</td>
                <td className={td}>{o.customerName}</td>
                <td className={`${td} max-w-[180px] truncate`}>{o.address}</td>
                <td className={td}><Badge tone={o.status === 'Could Not Deliver' ? 'red' : o.deliveryPersonId ? 'blue' : 'amber'}>{assignStatus(o)}</Badge></td>
                <td className={td}>
                  <select aria-label={`Partner for ${o.id}`} className={`${input} w-40`} value={o.deliveryPersonId ?? ''}
                    onChange={(e) => { if (e.target.value) assignDeliveryPerson(o.id, e.target.value); else unassignDeliveryPerson(o.id); refresh(); }}>
                    <option value="">Unassigned</option>
                    {active.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    {o.deliveryPersonId && !active.some((p) => p.id === o.deliveryPersonId) && <option value={o.deliveryPersonId}>{nameOf(o.deliveryPersonId)} (inactive)</option>}
                  </select>
                </td>
                <td className={td}>
                  <span className="flex gap-1">
                    {o.status !== 'Out for Delivery' && <button className={btnGhost} disabled={!o.deliveryPersonId} title={o.deliveryPersonId ? '' : 'Assign a partner first'} onClick={() => { updateOrderStatus(o.id, 'Out for Delivery'); refresh(); }}>Dispatch</button>}
                    {o.status === 'Out for Delivery' && (
                      <>
                        <button className={btnPrimary} onClick={() => { updateOrderStatus(o.id, 'Delivered'); refresh(); }}>Delivered</button>
                        <button className={btnDanger} onClick={() => { updateOrderStatus(o.id, 'Could Not Deliver'); refresh(); }}>Failed</button>
                      </>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {adding && (
        <Modal title="Add delivery partner" onClose={() => setAdding(false)}>
          <form onSubmit={submit} className="space-y-3" noValidate>
            <Field label="Full name"><input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus /></Field>
            <Field label="Phone number"><input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Notes (optional)"><input className={input} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            {err && <p role="alert" className="text-xs text-red-600">{err}</p>}
            <p className="text-[11px] text-gray-400">A unique partner ID is generated automatically.</p>
            <div className="flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setAdding(false)}>Cancel</button><button type="submit" className={btnPrimary}>Add</button></div>
          </form>
        </Modal>
      )}
      {confirmDeactivate && (
        <Confirm
          message={
            confirmDeactivate.assignedOrders.length > 0
              ? `Deactivate ${confirmDeactivate.name}? They currently have ${confirmDeactivate.assignedOrders.length} assigned order(s). Order history and existing assignments will be preserved.`
              : `Deactivate ${confirmDeactivate.name}? Order history is kept and they can be reactivated at any time.`
          }
          onNo={() => setConfirmDeactivate(null)}
          onYes={confirmDeactivation}
        />
      )}
    </div>
  );
}
