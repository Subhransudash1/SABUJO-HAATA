'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'sabuja_cookie_consent';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setShowBanner(true);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    } catch {
      // Ignore
    }
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected_optional');
    } catch {
      // Ignore
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-16 sm:bottom-0 inset-x-0 z-[1000] border-t-2 border-[#52765D] bg-[#173D2A] p-4 sm:p-6 text-[#FAF8F2] shadow-[0_-10px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-500"
    >
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4 max-w-3xl">
          <div className="h-10 w-10 rounded-full bg-[#77A96B]/20 flex items-center justify-center shrink-0">
            <Cookie className="h-5 w-5 text-[#77A96B]" aria-hidden="true" />
          </div>
          <div className="text-[13px] sm:text-sm leading-relaxed text-[#E2EADF] font-medium">
            <p>
              We use essential storage to keep your shopping cart and experience active. Read our <Link href="/cookie-policy" className="text-[#77A96B] font-black underline underline-offset-4 decoration-2">Cookie Policy</Link> for more details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleRejectOptional}
            className="flex-1 sm:flex-none h-11 rounded-2xl border-2 border-[#52765D] bg-transparent px-5 text-xs font-black text-[#E2EADF] hover:bg-[#245C3A] active:scale-95 transition-all"
          >
            REJECT
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 sm:flex-none h-11 rounded-2xl bg-[#77A96B] px-8 text-xs font-black text-[#173D2A] hover:bg-white active:scale-95 transition-all shadow-lg"
          >
            ACCEPT
          </button>
        </div>
      </div>
    </div>
  );
}
