'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, PhoneCall, X, AlertCircle } from 'lucide-react';

export interface BulkOrderData {
  productName: string;
  attemptedQty: number;
  unit: string;
  maxLimit: number;
}

interface BulkOrderModalProps {
  isOpen: boolean;
  data: BulkOrderData | null;
  onClose: () => void;
}

export function BulkOrderModal({ isOpen, data, onClose }: BulkOrderModalProps) {
  const router = useRouter();

  if (!isOpen || !data) return null;

  const unitDisplay =
    data.unit === 'kg'
      ? 'kg'
      : data.unit === 'piece'
      ? 'pieces'
      : 'bundles';

  const handleContactClick = () => {
    onClose();
    const query = new URLSearchParams({
      product: data.productName,
      qty: String(data.attemptedQty),
      unit: data.unit,
    }).toString();
    router.push(`/contact?${query}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-order-title"
        className="relative w-full max-w-[400px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-[#E3E8DF] bg-[#FFFEFB] p-5 sm:p-6 shadow-[0_12px_32px_-8px_rgba(23,61,42,0.28)] text-[#202820]"
      >
        {/* Close Icon Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close bulk order modal"
          className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#697269] hover:bg-[#EEF4E9] hover:text-[#202820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C3A] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 pr-9">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF4D8] text-[#B7791F] ring-1 ring-[#F1DFAE]">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 id="bulk-order-title" className="font-display text-[17px] sm:text-lg font-semibold leading-snug text-[#173D2A]">
              Bulk Quantity Reached
            </h3>
            <p className="mt-0.5 text-xs font-medium text-[#697269]">
              Maximum limit: <span className="font-semibold text-[#245C3A]">{data.maxLimit} {unitDisplay}</span> per item online.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="mt-4 rounded-xl border border-[#E3E8DF] bg-[#F7F9F4] p-3.5 sm:p-4">
          <p className="text-[13px] font-semibold text-[#173D2A]">
            For bulk orders, please contact us directly.
          </p>
          <dl className="mt-3 divide-y divide-[#E3E8DF] rounded-lg border border-[#E3E8DF] bg-white text-xs">
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <dt className="text-[#697269]">Product</dt>
              <dd className="min-w-0 truncate text-right font-semibold text-[#202820]">{data.productName}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <dt className="text-[#697269]">You requested</dt>
              <dd className="font-semibold text-[#B42318] tabular-nums">{data.attemptedQty} {unitDisplay}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <dt className="text-[#697269]">Online maximum</dt>
              <dd className="font-semibold text-[#245C3A] tabular-nums">{data.maxLimit} {unitDisplay}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-[#697269]">
            Standard online ordering is capped at {data.maxLimit} {unitDisplay} to ensure fresh daily availability for all customers.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleContactClick}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#245C3A] px-4 text-sm font-semibold text-white shadow-xs hover:bg-[#173D2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#245C3A] transition-colors cursor-pointer"
          >
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            <span>Contact Us for Bulk Order</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#DDE5D9] bg-white px-4 text-sm font-semibold text-[#202820] hover:bg-[#EEF4E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C3A] transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
