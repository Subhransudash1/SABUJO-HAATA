'use client';

import React from 'react';
import { X, ChevronRight, Info, Phone, HelpCircle, Truck, RefreshCw, Shield, FileText, Cookie } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/components/providers/StoreProviders';

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoPopup({ isOpen, onClose }: InfoPopupProps) {
  const { t } = useLanguage();

  const links = [
    { name: t.aboutUs || 'About Us', href: '/about', icon: Info },
    { name: t.contactUs || 'Contact Us', href: '/contact', icon: Phone },
    { name: t.faq || 'FAQs', href: '/faq', icon: HelpCircle },
    { name: t.footerDeliveryPolicy || 'Delivery Policies', href: '/delivery-policy', icon: Truck },
    { name: t.footerReturnPolicy || 'Refund Policies', href: '/return-refund-policy', icon: RefreshCw },
    { name: t.footerPrivacyPolicy || 'Privacy Policies', href: '/privacy-policy', icon: Shield },
    { name: t.footerTermsConditions || 'Terms and Conditions', href: '/terms-and-conditions', icon: FileText },
    { name: t.footerCookiePolicy || 'Cookie Policies', href: '/cookie-policy', icon: Cookie },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
          />

          {/* Popup Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] bg-[#FAF8F2] shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Drag Handle for Mobile */}
            <div className="w-12 h-1 bg-[#DDE5D9] rounded-full mx-auto mb-4 sm:hidden shrink-0 mt-3" />

            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#DDE5D9] shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#173D2A]">Store Information</h2>
                <p className="text-[10px] sm:text-xs text-[#697269] font-bold">All our policies and contact details</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-[#173D2A] shadow-sm border border-[#DDE5D9] hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Links List */}
            <div className="overflow-y-auto p-3 sm:p-4 space-y-2 pb-10">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#DDE5D9] hover:border-[#77A96B] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-[#EEF4E9] text-[#173D2A] group-hover:bg-[#77A96B] group-hover:text-white transition-colors shrink-0">
                      <link.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-[13px] sm:text-sm font-black text-[#173D2A]">{link.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#697269] group-hover:text-[#173D2A] transition-colors" />
                </Link>
              ))}
            </div>

            {/* Bottom Safe Area Padding for Mobile Nav */}
            <div className="h-8 sm:hidden shrink-0" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
