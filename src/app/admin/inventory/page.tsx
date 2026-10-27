'use client';

import React, { useMemo, useState } from 'react';
import { PRODUCTS } from '@/data/products';
import {
  addInventoryProduct, getInventory, updateInventoryProduct,
  type InventoryItem, type InventoryProductInput,
} from '@/lib/admin-data';
import { Badge, Card, CardHeader, Empty, Field, Modal, Stat, Table, btnGhost, btnPrimary, input, td, inr, fmtDate } from '@/components/admin/ui';

const LOW = 10;
// Stock status is always derived from quantity — it is never user-selectable.
const statusOf = (q: number) => (q <= 0 ? 'Out of Stock' : q <= LOW ? 'Low Stock' : 'In Stock');
const MAX_IMAGE_BYTES = 200 * 1024;
const BASE_CATEGORIES = ['vegetables', 'fruits'];

interface FormState {
  productName: string;
  category: string;
  price: string;
  offerPrice: string;
  stock: string;
  unit: string;
  image: string;
}
const blank: FormState = {
  productName: '',
  category: 'vegetables',
  price: '',
  offerPrice: '',
  stock: '',
  unit: 'kg',
  image: '',
};

const imageOf = (i: InventoryItem) => {
  const p = PRODUCTS.find((x) => x.id === i.productId);
  if (i.image && i.image !== p?.image) return i.image;
  if (p && p.hasLocalPhoto && p.image) return p.image;
  return i.image && !p ? i.image : '';
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(() => getInventory());
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; id?: string } | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const cats = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const categoryChoices = useMemo(() => Array.from(new Set([...BASE_CATEGORIES, ...items.map((i) => i.category)])), [items]);
  const filtered = items.filter((i) =>
    (cat === 'All' || i.category === cat) &&
    (!q.trim() || `${i.productName} ${i.productId}`.toLowerCase().includes(q.trim().toLowerCase())));

  const openAdd = () => { setForm(blank); setError(''); setSaved(''); setModal({ mode: 'add' }); };
  const openEdit = (i: InventoryItem) => {
    setForm({
      productName: i.productName,
      category: i.category,
      price: String(i.sellingPrice),
      offerPrice: i.offerPrice !== undefined && i.offerPrice !== null ? String(i.offerPrice) : '',
      stock: String(i.stockQty),
      unit: i.unit || 'kg',
      image: i.image ?? '',
    });
    setError('');
    setSaved('');
    setModal({ mode: 'edit', id: i.productId });
  };
  const close = () => setModal(null);

  const parsed = (): InventoryProductInput => ({
    productName: form.productName,
    category: form.category,
    sellingPrice: form.price.trim() === '' ? NaN : Number(form.price),
    offerPrice: form.offerPrice.trim() === '' ? undefined : Number(form.offerPrice),
    stockQty: form.stock.trim() === '' ? NaN : Number(form.stock),
    unit: form.unit,
    image: form.image,
  });

  const onFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.');
    if (file.size > MAX_IMAGE_BYTES) return setError('Image must be under 200 KB.');
    const reader = new FileReader();
    reader.onload = () => { setForm((f) => ({ ...f, image: String(reader.result) })); setError(''); };
    reader.onerror = () => setError('Could not read the image.');
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal) return;
    const data = parsed();
    const err = modal.mode === 'edit' && modal.id ? updateInventoryProduct(modal.id, data) : addInventoryProduct(data);
    if (err) return setError(err);
    setItems(getInventory());
    setSaved(modal.mode === 'add' ? `“${data.productName.trim()}” added to inventory.` : `“${data.productName.trim()}” updated.`);
    setModal(null);
  };

  const live = (() => {
    const d = parsed();
    return Number.isFinite(d.stockQty) && d.stockQty >= 0 ? statusOf(d.stockQty) : null;
  })();
  const count = (s: string) => items.filter((i) => statusOf(i.stockQty) === s).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Products" value={items.length} />
        <Stat label="In stock" value={count('In Stock')} />
        <Stat label="Low stock (≤ 10)" value={count('Low Stock')} />
        <Stat label="Out of stock" value={count('Out of Stock')} />
      </div>
      <Card>
        <CardHeader
          title="Inventory"
          action={
            <div className="flex flex-wrap gap-2">
              <input aria-label="Search inventory" className={`${input} w-40 sm:w-48`} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
              <select aria-label="Category" className={`${input} w-32`} value={cat} onChange={(e) => setCat(e.target.value)}>
                {cats.map((c) => <option key={c}>{c}</option>)}
              </select>
              <button className={btnPrimary} onClick={openAdd}>Add Product</button>
            </div>
          }
        />
        {saved && <p role="status" className="border-b border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs text-emerald-700">{saved}</p>}
        {filtered.length === 0 ? <Empty text="No products match." /> : (
          <Table head={['', 'Product', 'ID', 'Category', 'Stock', 'Unit', 'Price', 'Status', 'Updated', '']}>
            {filtered.map((i) => {
              const s = statusOf(i.stockQty);
              const img = imageOf(i);
              return (
                <tr key={i.productId} className={s === 'Out of Stock' ? 'bg-red-50/40' : s === 'Low Stock' ? 'bg-amber-50/40' : ''}>
                  <td className="px-3 py-1.5">
                    {img ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" className="h-7 w-7 rounded object-cover" /> : <span className="block h-7 w-7 rounded bg-gray-100" />}
                  </td>
                  <td className={`${td} font-medium`}>{i.productName}</td>
                  <td className={td}>{i.productId}</td>
                  <td className={td}>{i.category}</td>
                  <td className={td}>{i.stockQty}</td>
                  <td className={td}>{i.unit}</td>
                  <td className={td}>
                    {i.offerPrice !== undefined && i.offerPrice > 0 && i.offerPrice < i.sellingPrice ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-[#0B3D2E]">
                          <span>{inr(i.offerPrice)}</span>
                          <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-black text-amber-900">
                            {Math.round(((i.sellingPrice - i.offerPrice) / i.sellingPrice) * 100)}% OFF
                          </span>
                        </div>
                        <span className="block line-through text-[10px] text-gray-400">{inr(i.sellingPrice)}</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-gray-900">{inr(i.sellingPrice)}</span>
                    )}
                  </td>
                  <td className={td}><Badge>{s}</Badge></td>
                  <td className={td}>{fmtDate(i.lastUpdated)}</td>
                  <td className={td}><button className={btnGhost} onClick={() => openEdit(i)} aria-label={`Edit ${i.productName}`}>Edit</button></td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
      <p className="text-[11px] text-gray-500">
        Changes are saved to the application data layer and synchronize with the customer storefront, cart, checkout, order review, and billing.
      </p>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add product' : 'Edit product'} onClose={close}>
          <form onSubmit={submit} className="space-y-3" noValidate>
            <Field label="Product name">
              <input
                className={input}
                value={form.productName}
                autoFocus
                onChange={(e) => {
                  setForm({ ...form, productName: e.target.value });
                  setError('');
                }}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select
                  className={input}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categoryChoices.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Unit">
                <select
                  className={input}
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                >
                  <option value="kg">kg</option>
                  <option value="bundle">bundle</option>
                  <option value="piece">piece</option>
                </select>
              </Field>

              <Field label="Selling Price (₹) (Regular / MRP)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={input}
                  value={form.price}
                  placeholder="e.g. 100"
                  onChange={(e) => {
                    setForm({ ...form, price: e.target.value });
                    setError('');
                  }}
                />
              </Field>

              <Field label="Offer Price (₹) (Discounted / Active)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={input}
                  value={form.offerPrice}
                  placeholder="Optional (e.g. 75)"
                  onChange={(e) => {
                    setForm({ ...form, offerPrice: e.target.value });
                    setError('');
                  }}
                />
              </Field>
            </div>

            {/* Live Discount & Payable Price Preview */}
            {(() => {
              const sp = Number(form.price);
              const op = Number(form.offerPrice);
              if (Number.isFinite(sp) && sp > 0 && form.offerPrice.trim() !== '' && Number.isFinite(op)) {
                if (op <= 0) {
                  return <p className="text-[11px] font-semibold text-red-600">Offer price must be greater than 0.</p>;
                }
                if (op > sp) {
                  return <p className="text-[11px] font-semibold text-red-600">Offer price cannot exceed selling price.</p>;
                }
                if (op === sp) {
                  return <p className="text-[11px] text-gray-500">Offer price equals selling price: no discount badge will be shown.</p>;
                }
                const pct = Math.round(((sp - op) / sp) * 100);
                return (
                  <div className="rounded-md bg-amber-50 px-3 py-1.5 border border-amber-200 text-xs flex items-center justify-between">
                    <span className="font-bold text-[#17211B] flex items-center gap-1.5">
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-black">{pct}% OFF</span>
                      <span>Customer pays ₹{op}/{form.unit}</span>
                    </span>
                    <span className="text-[11px] text-gray-500 line-through">₹{sp}/{form.unit}</span>
                  </div>
                );
              }
              return null;
            })()}

            <div className="grid grid-cols-2 gap-3 items-center">
              <Field label={modal.mode === 'add' ? 'Initial stock' : 'Stock quantity'}>
                <input
                  type="number"
                  min={0}
                  step={form.unit === 'kg' ? 0.5 : 1}
                  className={input}
                  value={form.stock}
                  onChange={(e) => {
                    setForm({ ...form, stock: e.target.value });
                    setError('');
                  }}
                />
              </Field>

              <div className="text-xs text-gray-500 pt-3">
                Stock status: {live ? <Badge>{live}</Badge> : <span className="text-gray-400">enter quantity</span>}
              </div>
            </div>
            <Field label="Image URL (optional)"><input className={input} readOnly={form.image.startsWith('data:')} value={form.image.startsWith('data:') ? '(uploaded image)' : form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://… or /assets/…" /></Field>
            <Field label="…or upload image (max 200 KB)"><input type="file" accept="image/*" className="text-xs" onChange={(e) => onFile(e.target.files?.[0])} /></Field>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={close}>Cancel</button>
              <button type="submit" className={btnPrimary}>{modal.mode === 'add' ? 'Add product' : 'Save changes'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
