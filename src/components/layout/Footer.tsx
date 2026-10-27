'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/data/site-config';
import { useLanguage } from '@/components/providers/StoreProviders';
import { InfoPopup } from './InfoPopup';
import { usePathname } from 'next/navigation';

export function Footer() {
  const { lang, t } = useLanguage();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/more') return null;

  return (
    <footer className="bg-[#173D2A] text-[#FAF8F2] pb-24 sm:pb-10">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold tracking-tight">Sabuja Haata</h2>
            <p className="text-xs text-[#77A96B] font-medium uppercase tracking-widest">
              Fresh. Organic. From Our Farms.
            </p>
          </div>

          <p className="max-w-md text-xs text-[#E2EADF] leading-relaxed opacity-80">
            {lang === 'or' 
              ? 'ଓଡ଼ିଶାର କୃଷକଙ୍କ ପାଖରୁ ସିଧାସଳଖ ଆଣନ୍ତୁ ସତେଜ ପନିପରିବା ଏବଂ ଫଳ |' 
              : 'Directly from the farms of Odisha, we bring you the freshest organic vegetables and fruits to your doorstep.'}
          </p>

          {/* Store Information Buttons */}
          <div className="w-full max-w-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link 
                href="/about"
                className="flex h-12 items-center justify-center rounded-2xl bg-[#245C3A] border border-[#52765D] text-xs font-bold hover:bg-[#2e754a] transition-colors"
              >
                {t.aboutUs || 'About Us'}
              </Link>
              <Link 
                href="/contact"
                className="flex h-12 items-center justify-center rounded-2xl bg-[#245C3A] border border-[#52765D] text-xs font-bold hover:bg-[#2e754a] transition-colors"
              >
                {t.contactUs || 'Contact Us'}
              </Link>
              <Link 
                href="/faq"
                className="flex h-12 items-center justify-center rounded-2xl bg-[#245C3A] border border-[#52765D] text-xs font-bold hover:bg-[#2e754a] transition-colors"
              >
                {t.faq || 'FAQs'}
              </Link>
            </div>

            <button
              onClick={() => setIsPopupOpen(true)}
              className="w-full flex h-12 items-center justify-center rounded-2xl bg-[#FAF8F2] text-[#173D2A] text-xs font-black hover:bg-white transition-colors uppercase tracking-widest"
            >
              See More
            </button>
          </div>

          <div className="pt-6 border-t border-[#52765D] w-full text-[10px] text-[#E2EADF] opacity-60">
            <p>
              © 2026 {lang === 'or' ? SITE_CONFIG.brandNameOr : SITE_CONFIG.brandNameEn}. {t.footerRights}
            </p>
          </div>
        </div>
      </div>

      <InfoPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </footer>
  );
}
