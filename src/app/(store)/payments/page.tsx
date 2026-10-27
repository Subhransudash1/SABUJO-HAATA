'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  ArrowLeft, 
  Banknote, 
  QrCode, 
  ShieldCheck, 
  Check, 
  HelpCircle 
} from 'lucide-react';
import { formatPaiseINR } from '@/lib/currency';

interface StoredOrder {
  id: string;
  date: string;
  status: string;
  totalPaise: number;
  itemCount: number;
  paymentMethod: string;
}

export default function PaymentsPage() {
  const [preferredMode, setPreferredMode] = useState<'cod' | 'upi'>('cod');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    try {
      const pref = localStorage.getItem('sabuja_payment_preference');
      if (pref === 'upi' || pref === 'cod') setPreferredMode(pref);

      const rawOrders = localStorage.getItem('sabuja_user_orders');
      if (rawOrders) {
        setOrders(JSON.parse(rawOrders));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectMode = (mode: 'cod' | 'upi') => {
    setPreferredMode(mode);
    try {
      localStorage.setItem('sabuja_payment_preference', mode);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] pb-20">
      {/* Header */}
      <div className="bg-[#03472E] text-white px-4 pt-4 pb-8 sm:pt-6 sm:pb-10 rounded-b-2xl sm:rounded-b-3xl shadow-xs">
        <div className="max-w-xl mx-auto">
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8BCF45] mb-3 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-[#8BCF45] border border-white/15 shrink-0">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-display font-bold leading-tight">Payments & Settlement</h1>
              <p className="text-white/75 text-[11px] sm:text-xs font-medium">
                Manage your doorstep payment preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-3.5 sm:px-4 -mt-4 sm:-mt-5 space-y-3.5">
        {savedSuccess && (
          <div className="bg-[#EEF4E9] border border-[#DDE5D9] p-2.5 rounded-xl flex items-center gap-2 text-[#03472E] text-xs font-semibold">
            <Check className="h-3.5 w-3.5 text-[#03472E]" />
            <span>Default payment preference saved successfully!</span>
          </div>
        )}

        {/* Supported Payment Modes */}
        <section className="bg-white rounded-2xl border border-[#E6EAE4] p-4 sm:p-5 shadow-2xs space-y-3.5">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-[#17211B] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#03472E]" /> Supported Payment Modes
            </h2>
            <p className="text-xs text-[#697269] mt-0.5">
              Sabuja Haata uses safe doorstep settlement. No advance credit card payment is required.
            </p>
          </div>

          <div className="space-y-2.5">
            {/* COD Option */}
            <div 
              onClick={() => handleSelectMode('cod')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                preferredMode === 'cod' 
                  ? 'border-[#03472E]/50 bg-[#F2F8EE]' 
                  : 'border-[#E6EAE4] hover:bg-[#F7F8F5]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Banknote className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#17211B]">Cash on Delivery (COD)</p>
                    {preferredMode === 'cod' && (
                      <span className="text-[9px] bg-[#03472E] text-white px-2 py-0.5 rounded-full font-semibold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#697269]">
                    Pay cash directly to our delivery executive upon receiving produce.
                  </p>
                </div>
              </div>
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                preferredMode === 'cod' ? 'border-[#03472E] bg-[#03472E]' : 'border-[#C2C9C1]'
              }`}>
                {preferredMode === 'cod' && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
            </div>

            {/* UPI on Delivery Option */}
            <div 
              onClick={() => handleSelectMode('upi')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                preferredMode === 'upi' 
                  ? 'border-[#03472E]/50 bg-[#F2F8EE]' 
                  : 'border-[#E6EAE4] hover:bg-[#F7F8F5]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#17211B]">UPI QR Scan on Delivery</p>
                    {preferredMode === 'upi' && (
                      <span className="text-[9px] bg-[#03472E] text-white px-2 py-0.5 rounded-full font-semibold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#697269]">
                    Scan QR code with GPay, PhonePe, Paytm, or BHIM upon doorstep delivery.
                  </p>
                </div>
              </div>
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                preferredMode === 'upi' ? 'border-[#03472E] bg-[#03472E]' : 'border-[#C2C9C1]'
              }`}>
                {preferredMode === 'upi' && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
            </div>
          </div>
        </section>

        {/* Saved Cards / Sensitive Info Empty State */}
        <section className="bg-white rounded-2xl border border-[#E6EAE4] p-4 sm:p-5 shadow-2xs space-y-2.5">
          <h2 className="text-xs sm:text-sm font-bold text-[#17211B] flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-[#697269]" /> Saved Cards & Net Banking
          </h2>
          <div className="bg-[#FAF8F2] border border-[#E6EAE4] rounded-xl p-3.5 text-center space-y-1">
            <p className="text-xs font-semibold text-[#17211B]">No saved payment cards</p>
            <p className="text-[11px] text-[#697269] max-w-sm mx-auto">
              Sabuja Haata never asks for or stores sensitive credit/debit card numbers. All orders are settled at your doorstep for maximum security.
            </p>
          </div>
        </section>

        {/* Payment History */}
        <section className="bg-white rounded-2xl border border-[#E6EAE4] p-4 sm:p-5 shadow-2xs space-y-2.5">
          <h2 className="text-xs sm:text-sm font-bold text-[#17211B]">Payment History</h2>
          {orders.length > 0 ? (
            <div className="divide-y divide-[#F0F2EE]">
              {orders.map((ord) => (
                <div key={ord.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#17211B]">Order #{ord.id}</p>
                    <p className="text-[10px] text-[#697269]">
                      {ord.date} • {ord.paymentMethod || 'Doorstep Settlement'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#03472E]">
                      {formatPaiseINR(ord.totalPaise)}
                    </p>
                    <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-5 text-center space-y-1">
              <p className="text-xs font-semibold text-[#697269]">No payment records yet</p>
              <p className="text-[11px] text-[#A5ADA4]">
                Completed deliveries will list settlement receipts here.
              </p>
            </div>
          )}
        </section>

        {/* Help Link */}
        <div className="text-center pt-1">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#697269] hover:text-[#03472E] transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" /> Have questions about payments? Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
