'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Trash2, Tag, CheckCircle2 } from 'lucide-react';
import { formatPaiseINR } from '@/lib/currency';
import { formatSellingUnit } from '@/lib/i18n';
import {
  useCart,
  useLanguage,
} from '@/components/providers/StoreProviders';
import { ProductImage } from '@/components/products/ProductImage';
import { QuantityStepper } from '@/components/products/QuantityStepper';

export function CartView() {
  const { lang, t } = useLanguage();
  const {
    summary,
    isHydrated,
    setItemQuantity,
    removeItem,
    appliedCoupon,
    couponError,
    couponSuccess,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applyCoupon(couponInput);
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-9 w-48 rounded bg-[#173D2A] animate-pulse" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-32 rounded-xl border border-[#52765D] bg-[#173D2A] animate-pulse" />
            <div className="h-32 rounded-xl border border-[#52765D] bg-[#173D2A] animate-pulse" />
          </div>
          <div className="lg:col-span-4 h-64 rounded-xl border border-[#52765D] bg-[#173D2A] animate-pulse" />
        </div>
      </div>
    );
  }

  // 1. Empty Cart State: ONLY "Your shopping cart is empty" and "Explore Items" button underneath
  if (summary.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl border border-[#DDE5D9] bg-[#FAF8F2] px-6 py-14 sm:px-12 shadow-sm text-[#202820]">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#173D2A]">
            Your shopping cart is empty
          </h1>
          <div className="mt-6 flex justify-center">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#245C3A] px-6 text-sm font-semibold text-white hover:bg-[#173D2A] transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <span>Explore Items</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const deliveryText =
    summary.deliveryFeePaise === 0
      ? t.freeDelivery
      : formatPaiseINR(summary.deliveryFeePaise);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-32 sm:pb-28">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DDE5D9] pb-4 sm:pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#173D2A]">
            {t.cart}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#697269] font-medium tabular-nums">
            {summary.itemCount}{' '}
            {summary.itemCount === 1 ? 'item' : 'items'} in your basket
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:items-start">
        {/* Line Items List */}
        <section
          aria-label="Shopping cart items"
          className="lg:col-span-8 space-y-2.5 sm:space-y-3"
        >
          {summary.items.map((item) => {
            const formattedLineTotal = formatPaiseINR(item.lineTotalPaise);
            const formattedUnitPrice = formatPaiseINR(item.product.price * 100);
            const unitLabel = formatSellingUnit(item.product.unit, lang);

            return (
              <div
                key={item.product.id}
                className="flex items-center gap-3 sm:gap-4 rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] p-3 sm:p-3.5 shadow-xs text-[#202820]"
              >
                {/* Left side: Product Image */}
                <Link
                  href={`/product/${item.product.slug}`}
                  className="relative block h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-white border border-[#DDE5D9] p-1"
                >
                  <ProductImage
                    product={item.product}
                    compact
                    className="h-full w-full object-contain"
                  />
                </Link>

                {/* Right side: Info, Unit Price, Delete Icon & Compact Controls Row */}
                <div className="flex flex-1 min-w-0 flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
                        <h3 className="font-display text-sm sm:text-base font-bold text-[#173D2A] leading-tight truncate">
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="hover:underline"
                          >
                            {item.product.nameEn}
                          </Link>
                        </h3>
                        {item.product.nameOr && (
                          <span className="text-xs text-[#245C3A] font-medium font-sans truncate">
                            ({item.product.nameOr})
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xs sm:text-sm font-bold text-[#03472E] tabular-nums">
                          {formattedUnitPrice}
                          <span className="text-[#697269] font-medium">/{unitLabel}</span>
                        </span>
                        {item.product.sellingPrice && item.product.sellingPrice > item.product.price && (
                          <span className="text-[11px] font-semibold text-gray-400 line-through">
                            ₹{item.product.sellingPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      aria-label={`Remove ${item.product.nameEn} from cart`}
                      className="inline-flex h-7 w-7 sm:h-8 sm:w-8 -mr-1 -mt-0.5 shrink-0 items-center justify-center rounded-lg text-[#697269] hover:bg-white hover:text-[#B42318] transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    <QuantityStepper
                      quantity={item.quantity}
                      unit={item.product.unit}
                      onChange={(newQty) => setItemQuantity(item.product.id, newQty)}
                      productName={item.product.nameEn}
                      compact
                    />

                    <span className="font-display text-sm sm:text-base font-bold text-[#173D2A] tabular-nums whitespace-nowrap">
                      {formattedLineTotal}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Order Summary Card */}
        <section
          aria-label="Order summary"
          className="lg:col-span-4 rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] p-5 sm:p-6 shadow-sm space-y-4 sm:space-y-5 text-[#202820]"
        >
          <h2 className="font-display text-base sm:text-lg font-semibold text-[#173D2A]">
            Order Summary
          </h2>

          <div className="space-y-2.5 text-xs sm:text-sm border-b border-[#DDE5D9] pb-4 text-[#202820]">
            <div className="flex justify-between">
              <span className="text-[#697269]">{t.subtotal}</span>
              <span className="font-semibold text-[#173D2A]">
                {formatPaiseINR(summary.subtotalPaise)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-[#697269]">
                {summary.deliveryFeePaise === 0 ? t.freeDelivery : t.deliveryCharge}
              </span>
              <span className={`font-semibold ${summary.deliveryFeePaise === 0 ? 'text-[#245C3A]' : 'text-[#173D2A]'}`}>
                {deliveryText}
              </span>
            </div>
            {summary.subtotalPaise > 0 && summary.subtotalPaise < 14900 && (
              <p className="text-[11px] text-[#697269] italic">
                Add {formatPaiseINR(14900 - summary.subtotalPaise)} more for free delivery (orders ≥ ₹149).
              </p>
            )}

            {summary.discountPaise > 0 && (
              <div className="flex justify-between items-center text-xs text-[#245C3A]">
                <span>{t.discount} (SHOP50)</span>
                <span className="font-semibold">-{formatPaiseINR(summary.discountPaise)}</span>
              </div>
            )}
          </div>

          {/* Coupon Code Section */}
          <div className="rounded-lg border border-[#DDE5D9] bg-white p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#173D2A] flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-[#245C3A]" />
                {t.applyCoupon}
              </span>
              <span className="text-[10px] bg-[#E8EFE5] text-[#245C3A] px-2 py-0.5 rounded font-medium">
                SHOP50: ₹50 off ≥ ₹999
              </span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded bg-[#E8EFE5] px-3 py-2 text-xs text-[#245C3A]">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  SHOP50 applied (-₹50)
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-semibold text-[#B42318] hover:underline"
                >
                  {t.removeCoupon}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t.couponPlaceholder}
                  className="h-9 flex-1 rounded-md border border-[#DDE5D9] bg-[#FAF8F2] px-2.5 text-xs text-[#202820] placeholder:text-[#697269] focus:outline-none focus:ring-1 focus:ring-[#245C3A]"
                />
                <button
                  type="submit"
                  className="h-9 rounded-md bg-[#245C3A] px-3 text-xs font-semibold text-white hover:bg-[#173D2A] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {t.apply}
                </button>
              </form>
            )}

            {couponError && <p className="text-[11px] text-[#B42318]">{couponError}</p>}
            {couponSuccess && !appliedCoupon && (
              <p className="text-[11px] text-[#245C3A]">{couponSuccess}</p>
            )}
            {summary.subtotalPaise < 99900 && !appliedCoupon && (
              <p className="text-[10px] text-[#697269]">
                Add {formatPaiseINR(99900 - summary.subtotalPaise)} more to unlock SHOP50 coupon.
              </p>
            )}
          </div>

          <div className="flex justify-between items-baseline pt-2">
            <span className="font-display text-sm sm:text-base font-semibold text-[#173D2A]">
              {t.estimatedTotal}
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-[#173D2A]">
              {formatPaiseINR(summary.totalPaise)}
            </span>
          </div>

          <p className="text-[11px] text-[#697269] leading-relaxed">
            {t.previewCheckoutDisclaimer}
          </p>

          <Link
            href="/checkout"
            className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#245C3A] px-6 text-sm font-semibold text-white hover:bg-[#173D2A] transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <span>{t.proceedToCheckout}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <div className="pt-1 text-center">
            <Link
              href="/shop"
              className="text-xs font-semibold text-[#245C3A] hover:underline"
            >
              ← {t.continueShopping}
            </Link>
          </div>
        </section>
      </div>

      {/* Persistent Fixed Bottom Checkout Bar */}
      <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-40 border-t border-[#DDE5D9] bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 px-1 sm:px-4">
          <div className="min-w-0">
            <span className="block text-[10px] sm:text-xs font-medium text-[#697269] truncate">
              Estimated Total ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
            </span>
            <span className="font-display text-base sm:text-xl font-bold text-[#173D2A] truncate block">
              {formatPaiseINR(summary.totalPaise)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="inline-flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl bg-[#245C3A] px-5 sm:px-8 text-xs sm:text-sm font-semibold text-white hover:bg-[#173D2A] active:scale-95 transition-all duration-150 cursor-pointer shadow-xs whitespace-nowrap motion-reduce:transition-none"
          >
            <span>{t.proceedToCheckout}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
