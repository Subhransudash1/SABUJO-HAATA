'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, Heart, Star, Plus } from 'lucide-react';
import { Product } from '@/types/product';
import { formatRupeesINR } from '@/lib/currency';
import { formatSellingUnit } from '@/lib/i18n';
import { getQuantityStep, getMinQuantity } from '@/lib/cart';
import { useCart, useLanguage } from '@/components/providers/StoreProviders';
import { ProductImage } from './ProductImage';
import { isInWishlist, toggleWishlistProductId } from '@/lib/wishlist';
import { getDefaultProductPricing, getLiveProductPricing, subscribeToInventoryUpdates } from '@/lib/product-pricing';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { lang, t } = useLanguage();
  const { addItem, items, setItemQuantity } = useCart();
  
  // Safe initial state strictly derived from server props to guarantee initial HTML hydration match
  const [pricing, setPricing] = useState(() => getDefaultProductPricing(product));

  useEffect(() => {
    // Safely synchronize client-side local inventory/pricing after component mounts
    setPricing(getLiveProductPricing(product));
    return subscribeToInventoryUpdates(() => {
      setPricing(getLiveProductPricing(product));
    });
  }, [product]);

  const activeUnit = pricing.unit;
  
  // Weights for kg products: 250g to 5kg
  const kgSteps = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 5];
  // Units for piece/bundle products: 1 to 12
  const unitSteps = [1, 2, 3, 4, 5, 6, 12];
  
  const steps = activeUnit === 'kg' ? kgSteps : unitSteps;
  const initialQty = activeUnit === 'kg' ? 1 : 1;
  
  const [selectedQty, setSelectedQty] = useState(initialQty);
  const [isWished, setIsWished] = useState(false);

  // The cart is the single source of truth for the "Added" state.
  const cartItem = items.find((i) => i.product.id === product.id);
  const isAdded = Boolean(cartItem);
  const cartStep = getQuantityStep(activeUnit);
  const cartMin = getMinQuantity(activeUnit);
  // When in the cart the stepper edits the cart line; otherwise it picks the quantity to add.
  const displayQty = cartItem ? cartItem.quantity : selectedQty;

  useEffect(() => {
    setIsWished(isInWishlist(product.id));

    const handleWishlistChange = () => {
      setIsWished(isInWishlist(product.id));
    };
    window.addEventListener('sabuja_wishlist_updated', handleWishlistChange);
    return () => window.removeEventListener('sabuja_wishlist_updated', handleWishlistChange);
  }, [product.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleWishlistProductId(product.id);
    setIsWished(updated);
  };

  const handleAddToCart = () => {
    if (!product.available || isAdded) return;
    const effectiveProduct: Product = {
      ...product,
      price: pricing.activePrice,
      sellingPrice: pricing.sellingPrice,
      offerPrice: pricing.offerPrice,
      unit: pricing.unit,
    };
    addItem(effectiveProduct, selectedQty);
  };

  const handleStep = (direction: 'up' | 'down') => {
    if (cartItem) {
      // Existing cart line: update its quantity (max-limit handling lives in setItemQuantity).
      const next = Number(
        (cartItem.quantity + (direction === 'up' ? cartStep : -cartStep)).toFixed(2)
      );
      if (direction === 'down' && next < cartMin) return;
      setItemQuantity(product.id, next);
      return;
    }
    const currentIndex = steps.indexOf(selectedQty);
    if (direction === 'up' && currentIndex < steps.length - 1) {
      setSelectedQty(steps[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      setSelectedQty(steps[currentIndex - 1]);
    }
  };

  const currentPayablePrice = pricing.activePrice * displayQty;
  const originalSellingPriceTotal = pricing.sellingPrice * displayQty;
  const hasDiscount = pricing.hasDiscount;
  const discountPercent = pricing.discountPercent;
  const idNum = parseInt(product.id.split('-')[1]) || 0;
  const rating = (4.8 + (idNum % 10) / 100).toFixed(2);
  const reviews = 5 + (idNum % 6);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.2rem] sm:rounded-[1.5rem] border border-[#E6EAE4] bg-white transition-all duration-300 hover:shadow-md active:scale-[0.99] min-w-0 w-full">
      {/* Product Image Area */}
      <div className="relative aspect-[1.1/1] w-full overflow-hidden bg-white p-2">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <ProductImage
            product={product}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-block rounded-md bg-[#FFB300] px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[#17211B] uppercase tracking-wider shadow-xs">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Best Seller Badge */}
        {idNum % 3 === 0 && (
          <div className={`absolute left-2 z-10 ${hasDiscount ? 'top-8 sm:top-8' : 'top-2'}`}>
            <span className="inline-block rounded-md bg-[#E85B28] px-2 py-0.5 text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider shadow-xs">
              Best Seller
            </span>
          </div>
        )}

        {/* Heart Icon */}
        <button 
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full backdrop-blur-sm shadow-sm border transition-colors z-10 ${
            isWished 
              ? 'bg-red-50 border-red-200 text-red-500' 
              : 'bg-white/80 border-[#E6EAE4] text-[#727A73] hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4 w-4 ${isWished ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 pt-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h3 className="text-xs sm:text-sm font-black text-[#17211B] line-clamp-1 leading-tight">
            <Link href={`/product/${product.slug}`} className="hover:text-[#064E32] transition-colors">
              {product.nameEn}
            </Link>
          </h3>
          <div className="flex items-baseline gap-1.5 shrink-0 whitespace-nowrap">
            {hasDiscount && (
              <span className="text-[11px] sm:text-xs font-semibold text-gray-400 line-through">
                ₹{originalSellingPriceTotal.toFixed(0)}
              </span>
            )}
            <span className="text-sm sm:text-base font-black text-[#03472E]">
              ₹{currentPayablePrice.toFixed(0)}
            </span>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-[#F5B900] text-[#F5B900]" />
          <span className="text-[10px] sm:text-xs font-black text-[#17211B]">{rating}</span>
          <span className="text-[9px] sm:text-[10px] text-[#727A73] font-medium">({reviews})</span>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between bg-[#F7F8F5] rounded-full p-1 mb-3">
          <button 
            onClick={() => handleStep('down')}
            disabled={cartItem ? cartItem.quantity - cartStep < cartMin : steps.indexOf(selectedQty) === 0}
            aria-label="Decrease quantity"
            className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full bg-white border border-[#E6EAE4] text-[#17211B] hover:border-[#8BCF45] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span className="text-lg leading-none">-</span>
          </button>
          
          <span className="text-[10px] sm:text-xs font-black text-[#17211B]">
            {activeUnit === 'bundle'
              ? `${displayQty} bundle${displayQty > 1 ? 's' : ''}`
              : activeUnit === 'piece'
              ? `${displayQty} piece${displayQty > 1 ? 's' : ''}`
              : displayQty >= 1
              ? `${displayQty} kg`
              : `${displayQty * 1000} g`}
          </span>

          <button 
            onClick={() => handleStep('up')}
            disabled={cartItem ? false : steps.indexOf(selectedQty) === steps.length - 1}
            aria-label="Increase quantity"
            className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full bg-white border border-[#E6EAE4] text-[#17211B] hover:border-[#8BCF45] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </div>

        {/* Add Button Row */}
        <div className="mt-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            aria-pressed={isAdded}
            className={`group/btn w-full flex h-8 sm:h-10 items-center justify-between pl-3 pr-1 rounded-full border transition-all duration-200 font-black text-[10px] sm:text-xs select-none active:scale-[0.98] ${
              isAdded
                ? 'bg-[#8BCF45] border-[#8BCF45] text-[#03472E] shadow-xs cursor-default'
                : 'bg-white border-[#E6EAE4] text-[#17211B] hover:border-[#8BCF45] hover:bg-[#F7F8F5]'
            }`}
          >
            <span className="transition-opacity duration-200 ease-out">{isAdded ? 'Added' : 'Add to Cart'}</span>
            <div className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-200 ${isAdded ? 'bg-white text-[#03472E] scale-100' : 'bg-[#064E32] text-white group-hover/btn:bg-[#187641]'}`}>
              {isAdded ? <Check className="h-3.5 w-3.5 sm:h-4 w-4 stroke-[2.5]" /> : <Plus className="h-3.5 w-3.5 sm:h-4 w-4" />}
            </div>
          </button>
        </div>
      </div>
    </article>
  );
}
