'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';

interface ProductImageProps {
  product: Product;
  className?: string;
  compact?: boolean;
}

export function ProductImage({ product, className = '', compact = false }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  const hasValidImage =
    !hasError &&
    product.image &&
    product.hasLocalPhoto !== false &&
    (product.image.startsWith('http') ||
      product.image.startsWith('/assets/') ||
      product.image.startsWith('/images/') ||
      product.image.startsWith('data:'));

  if (hasValidImage) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <Image
          src={product.image}
          alt={`${product.nameEn} (${product.nameOr}) — fresh produce at Sabuja Haata`}
          fill
          sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain transition-transform duration-500 group-hover:scale-105"
          priority={product.id === 'veg-01' || product.id === 'veg-31'}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          unoptimized={product.image.startsWith('http')}
        />
      </div>
    );
  }

  // Bespoke botanical studio illustration fallback
  return (
    <div
      role="img"
      aria-label={`${product.nameEn} (${product.nameOr}) — fresh produce at Shopbujo Hatto`}
      className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#EEF4E9] to-[#FAF8F2] border border-[#E5E8DF] p-3 text-center select-none ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(#77A96B_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none" />
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center rounded-full bg-[#245C3A]/10 text-[#245C3A] mb-1.5 ${
          compact ? 'h-7 w-7' : 'h-11 w-11'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={compact ? 'h-4 w-4' : 'h-6 w-6'}
        >
          {product.category === 'fruits' ? (
            <>
              <path d="M12 2a5 5 0 0 0-5 5c0 4 5 12 5 12s5-8 5-12a5 5 0 0 0-5-5Z" />
              <path d="M12 2v4" />
            </>
          ) : (
            <>
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </>
          )}
        </svg>
      </span>
      <p
        className={`font-display font-semibold text-[#173D2A] line-clamp-1 leading-tight ${
          compact ? 'text-[11px]' : 'text-sm'
        }`}
      >
        {product.nameEn}
      </p>
      {!compact && (
        <p className="mt-0.5 text-xs text-[#245C3A] font-medium font-sans">
          {product.nameOr}
        </p>
      )}
    </div>
  );
}
