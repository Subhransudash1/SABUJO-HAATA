import React from 'react';

export const inr = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const fmtDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const TONES: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  gray: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

const STATUS_TONE: Record<string, string> = {
  Pending: 'amber', Confirmed: 'blue', Ready: 'blue', 'Out for Delivery': 'purple', Delivered: 'green',
  Cancelled: 'red', 'Could Not Deliver': 'red', Paid: 'green', Unpaid: 'amber', COD: 'gray',
  Finalized: 'green', Draft: 'gray', Active: 'green', Inactive: 'gray',
  'In Stock': 'green', 'Low Stock': 'amber', 'Out of Stock': 'red',
};

/** Display labels for internal order status values. */
export const STATUS_LABEL: Record<string, string> = {
  Confirmed: 'Confirmed / Processing',
  Ready: 'Ready to Ship',
  'Could Not Deliver': 'Could Not Be Delivered',
};

export function Badge({ children, tone }: { children: string; tone?: keyof typeof TONES }) {
  const t = tone ?? STATUS_TONE[children] ?? 'gray';
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${TONES[t]}`}>
      {STATUS_LABEL[children] ?? children}
    </span>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3.5 py-2.5 sm:px-4 sm:py-3">
      <h2 className="text-sm font-semibold text-[#0B3D2E]">{title}</h2>
      {action}
    </div>
  );
}

export function Stat({ label, value, icon, hint }: { label: string; value: React.ReactNode; icon?: React.ReactNode; hint?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2.5 sm:p-3 shadow-sm">
      <div className="flex items-center justify-between gap-1.5 text-xs text-gray-500">
        <span className="truncate">{label}</span>
        {icon}
      </div>
      <div className="mt-1 truncate text-lg sm:text-xl font-semibold text-[#0B3D2E]">{value}</div>
      {hint && <div className="mt-0.5 truncate text-[11px] text-gray-400">{hint}</div>}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="px-4 py-8 text-center text-sm text-gray-400">{text}</div>;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
            {head.map((h, i) => (
              <th key={`${h}-${i}`} scope="col" className="whitespace-nowrap px-2.5 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}

export const td = 'px-2.5 py-2 whitespace-nowrap text-xs text-gray-700 align-middle';

export const btnPrimary =
  'inline-flex items-center gap-1 rounded-md bg-[#2F8F4E] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#257a40] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6BBF59] focus-visible:ring-offset-1 disabled:opacity-50';
export const btnGhost =
  'inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6BBF59] disabled:opacity-50';
export const btnDanger =
  'inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300';
export const input =
  'w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 focus:border-[#2F8F4E] focus:outline-none focus:ring-1 focus:ring-[#2F8F4E]';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-gray-600">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#0B3D2E]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Confirm({ message, onYes, onNo }: { message: string; onYes: () => void; onNo: () => void }) {
  return (
    <Modal title="Please confirm" onClose={onNo}>
      <p className="text-sm text-gray-600">{message}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button className={btnGhost} onClick={onNo}>Cancel</button>
        <button className={btnPrimary} onClick={onYes} autoFocus>Confirm</button>
      </div>
    </Modal>
  );
}
