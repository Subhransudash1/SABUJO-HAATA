'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SITE_CONFIG } from '@/data/site-config';

export function OrderConfirmationView() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-2xl border border-[#77A96B] bg-[#FAF8F2] p-6 sm:p-10 shadow-md space-y-6 text-[#202820] motion-reduce:transform-none motion-reduce:transition-none"
      >
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#245C3A] text-white shadow-md"
          >
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </motion.div>
        </div>

        <div className="space-y-1.5">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#173D2A]">
            Order Confirmed
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#245C3A]">
            Your fresh produce order has been placed with Cash on Delivery (COD).
          </p>
        </div>

        <div className="rounded-xl border border-[#DDE5D9] bg-white p-5 text-left text-xs sm:text-sm text-[#202820] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E8DF] pb-2">
            <span className="font-semibold text-[#173D2A]">Sample Order Reference:</span>
            <span className="font-mono text-xs font-bold bg-[#EEF4E9] text-[#245C3A] px-2.5 py-0.5 rounded">
              SBH-DEMO-2026
            </span>
          </div>
          <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
          <p><strong>Payment Due:</strong> At the time of delivery</p>
          <p><strong>Delivery Window:</strong> Morning Slot (7:00 AM – 10:30 AM)</p>
          <p><strong>Customer Service:</strong> {SITE_CONFIG.storePhone}</p>
        </div>

        <div className="rounded-xl bg-[#EEF4E9] border border-[#77A96B]/50 p-4 text-xs text-[#173D2A] text-center space-y-1">
          <p className="font-bold text-sm">Payment Method: Cash on Delivery (COD)</p>
          <p className="font-semibold text-[#245C3A]">Pay the final order amount at the time of delivery.</p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#245C3A] px-6 text-xs sm:text-sm font-semibold text-white hover:bg-[#173D2A] transition-colors cursor-pointer shadow-xs"
          >
            <span>Continue Browsing</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#DDE5D9] bg-white px-5 text-xs sm:text-sm font-semibold text-[#202820] hover:bg-[#EEF4E9] transition-colors cursor-pointer"
          >
            Return to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
