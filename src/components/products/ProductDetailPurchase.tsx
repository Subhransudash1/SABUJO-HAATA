'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types/product';
import { calculateLineTotalPaise, formatPaiseINR } from '@/lib/currency';
import { useCart, useLanguage } from '@/components/providers/StoreProviders';
import { QuantityStepper } from './QuantityStepper';
import { getDefaultProductPricing, getLiveProductPricing, subscribeToInventoryUpdates } from '@/lib/product-pricing';

interface ProductDetailPurchaseProps {
  product: Product;
}

export function ProductDetailPurchase({ product }: ProductDetailPurchaseProps) {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [pricing, setPricing] = useState(() => getDefaultProductPricing(product));

  useEffect(() => {
    setPricing(getLiveProductPricing(product));
    return subscribeToInventoryUpdates(() => {
      setPricing(getLiveProductPricing(product));
    });
  }, [product]);

  const [quantity, setQuantity] = useState(pricing.unit === 'kg' ? 0.5 : 1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product.available) return;
    const effectiveProduct: Product = {
      ...product,
      price: pricing.activePrice,
      sellingPrice: pricing.sellingPrice,
      offerPrice: pricing.offerPrice,
      unit: pricing.unit,
    };
    addItem(effectiveProduct, quantity);
    setJustAdded(true);
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    setJustAdded(false);
  };

  const lineTotalPaise = calculateLineTotalPaise(pricing.activePrice, quantity);
  const formattedLineTotal = formatPaiseINR(lineTotalPaise);

  if (!product.available) {
    return (
      <div className="rounded-xl border border-[#B42318]/30 bg-white p-4 text-center">
        <p className="text-xs font-semibold text-[#B42318]">
          {product.unavailableReason || t.unavailable}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 pt-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] p-3.5">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <span className="text-[10px] sm:text-xs font-bold text-[#173D2A] uppercase tracking-wider">Quantity:</span>
          <QuantityStepper
            quantity={quantity}
            unit={pricing.unit}
            onChange={handleQuantityChange}
            productName={product.nameEn}
            compact
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#DDE5D9]">
          <span className="text-[10px] sm:text-xs font-bold text-[#697269] uppercase tracking-wider">Line Total:</span>
          <span className="font-bold text-[#173D2A] text-base sm:text-lg">{formattedLineTotal}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        aria-label={`Add to Cart: ${product.nameEn}`}
        className={`w-full inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98] ${
          justAdded
            ? 'bg-[#245C3A] text-white'
            : 'bg-[#173D2A] text-white hover:bg-[#245C3A]'
        }`}
      >
        {justAdded ? (
          <>
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>{t.addedToCart}</span>
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span>{t.addToCart}</span>
          </>
        )}
      </button>
    </div>
  );
}
