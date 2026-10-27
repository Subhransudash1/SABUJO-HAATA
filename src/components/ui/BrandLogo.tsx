'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/StoreProviders';
import { SITE_CONFIG } from '@/data/site-config';
import Image from 'next/image';

interface BrandLogoProps {
  compact?: boolean;
  showOdiaSubmark?: boolean;
  className?: string;
  asDiv?: boolean;
}

export function BrandLogo({
  compact = false,
  showOdiaSubmark = false,
  className = '',
  asDiv = false,
}: BrandLogoProps) {
  const { lang } = useLanguage();
  const brandName = lang === 'or' ? SITE_CONFIG.brandNameOr : SITE_CONFIG.brandNameEn;

  const content = (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <div
        aria-hidden="true"
        className={`relative inline-flex ${
          compact ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-10 w-10 sm:h-11 sm:w-11'
        } ${className} items-center justify-center overflow-hidden shrink-0 rounded-lg`}
      >
        <Image
          src="/assets/aistudio/WhatsApp_Image_2026-10-23_at_6.24.03_PM_2ece6f14.jpeg"
          alt="Sabuja Haata Logo"
          fill
          sizes="36px"
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col justify-center">
        <span
          style={{ fontFamily: "var(--font-brand, 'Gloock'), var(--font-oriya, 'Noto Sans Oriya'), Georgia, 'Times New Roman', serif" }}
          className={`font-normal tracking-[0.015em] leading-[1.05] text-white antialiased ${
            compact ? 'text-[16px] sm:text-[18px]' : 'text-base sm:text-lg'
          }`}
        >
          {brandName}
        </span>
        <span
          style={{ fontFamily: "var(--font-brand-sans), var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          className={`mt-[3px] sm:mt-1 flex items-center gap-[3px] sm:gap-1 text-[#A9DB73] font-semibold leading-none tracking-[0.04em] whitespace-nowrap ${
            compact ? 'text-[7.5px] sm:text-[9px]' : 'text-[8.5px] sm:text-[10px]'
          }`}
        >
          <span>Fresh.</span>
          <span>Organic.</span>
          <span>From Our Farms.</span>
        </span>
      </div>
    </div>
  );

  const wrapperClass = `inline-flex items-center text-white hover:text-[#8BCF45] transition-colors whitespace-nowrap shrink-0`;

  if (asDiv) {
    return (
      <div className={wrapperClass}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href="/"
      className={wrapperClass}
      aria-label={`${brandName} Home`}
    >
      {content}
    </Link>
  );
}
