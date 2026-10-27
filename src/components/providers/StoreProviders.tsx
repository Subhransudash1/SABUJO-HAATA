'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Product } from '@/types/product';
import { CartItem, CartSummary } from '@/types/cart';
import {
  calculateCartSummary,
  readCartFromStorage,
  writeCartToStorage,
  readCouponFromStorage,
  writeCouponToStorage,
  validateQuantity,
  getMaxQuantity,
} from '@/lib/cart';
import { calculateLineTotalPaise } from '@/lib/currency';
import { Language, LANG_STORAGE_KEY, TRANSLATIONS } from '@/lib/i18n';
import { BulkOrderModal, BulkOrderData } from '@/components/ui/BulkOrderModal';

// 1. Language Context
interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof TRANSLATIONS)['en'];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: TRANSLATIONS.en,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

// 2. Bulk Order Context
interface BulkOrderContextType {
  openBulkOrderModal: (data: BulkOrderData) => void;
}

const BulkOrderContext = createContext<BulkOrderContextType>({
  openBulkOrderModal: () => {},
});

export function useBulkOrder() {
  return useContext(BulkOrderContext);
}

// 3. Cart Context
interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  isHydrated: boolean;
  appliedCoupon: string | null;
  couponError: string | null;
  couponSuccess: string | null;
  addItem: (product: Product, quantity?: number) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  summary: calculateCartSummary([], null),
  isHydrated: false,
  appliedCoupon: null,
  couponError: null,
  couponSuccess: null,
  addItem: () => {},
  setItemQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  applyCoupon: () => {},
  removeCoupon: () => {},
});

export function useCart() {
  return useContext(CartContext);
}

export function StoreProviders({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Bulk Order Modal state
  const [bulkModalData, setBulkModalData] = useState<BulkOrderData | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const openBulkOrderModal = (data: BulkOrderData) => {
    setBulkModalData(data);
    setIsBulkModalOpen(true);
  };

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (savedLang === 'en' || savedLang === 'or') {
        setLangState(savedLang);
      }
      const initialCart = readCartFromStorage();
      setItems(initialCart);
      const savedCoupon = readCouponFromStorage();
      if (savedCoupon) {
        setAppliedCoupon(savedCoupon);
      }
    } catch {
      // Ignore initial storage read errors
    } finally {
      setIsHydrated(true);
    }

    const handleInventoryChange = () => {
      try {
        const refreshed = readCartFromStorage();
        setItems(refreshed);
      } catch {
        // ignore
      }
    };
    window.addEventListener('sabuja_inventory_updated', handleInventoryChange);
    return () => window.removeEventListener('sabuja_inventory_updated', handleInventoryChange);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {
      // Ignore
    }
  };

  const addItem = (product: Product, quantity = product.unit === 'kg' ? 0.5 : 1) => {
    if (!product.available) return;

    const maxLimit = getMaxQuantity(product.unit);
    const existing = items.find((i) => i.product.id === product.id);
    const existingQty = existing ? existing.quantity : 0;
    const requestedTotal = existingQty + quantity;

    if (requestedTotal > maxLimit) {
      openBulkOrderModal({
        productName: product.nameEn,
        attemptedQty: Number(requestedTotal.toFixed(2)),
        unit: product.unit,
        maxLimit,
      });
    }

    const newQty = validateQuantity(requestedTotal, product.unit);
    let updated: CartItem[];

    if (existing) {
      updated = items.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: newQty,
              lineTotalPaise: Math.round(product.price * 100 * newQty),
            }
          : item
      );
    } else {
      updated = [
        ...items,
        {
          product,
          quantity: newQty,
          lineTotalPaise: Math.round(product.price * 100 * newQty),
        },
      ];
    }

    setItems(updated);
    writeCartToStorage(updated);
  };

  const setItemQuantity = (productId: string, quantity: number) => {
    const target = items.find((i) => i.product.id === productId);
    if (!target) return;

    if (quantity <= 0) {
      const updated = items.filter((i) => i.product.id !== productId);
      setItems(updated);
      writeCartToStorage(updated);
      return;
    }

    const maxLimit = getMaxQuantity(target.product.unit);
    if (quantity > maxLimit) {
      openBulkOrderModal({
        productName: target.product.nameEn,
        attemptedQty: Number(quantity.toFixed(2)),
        unit: target.product.unit,
        maxLimit,
      });
    }

    const validQty = validateQuantity(quantity, target.product.unit);
    const updated = items.map((i) =>
      i.product.id === productId
        ? {
            ...i,
            quantity: validQty,
            lineTotalPaise: Math.round(i.product.price * 100 * validQty),
          }
        : i
    );

    setItems(updated);
    writeCartToStorage(updated);
  };

  const removeItem = (productId: string) => {
    const updated = items.filter((i) => i.product.id !== productId);
    setItems(updated);
    writeCartToStorage(updated);
  };

  const clearCart = () => {
    setItems([]);
    writeCartToStorage([]);
    setAppliedCoupon(null);
    writeCouponToStorage(null);
    setCouponError(null);
    setCouponSuccess(null);
  };

  const applyCoupon = (code: string) => {
    setCouponError(null);
    setCouponSuccess(null);
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      setCouponError(lang === 'or' ? 'ଅବୈଧ କୂପନ୍ କୋଡ୍' : 'Please enter a valid coupon code.');
      return;
    }

    if (trimmed !== 'SHOP50') {
      setCouponError(lang === 'or' ? 'ଏହି କୂପନ୍ କୋଡ୍ଟି ଅବୈଧ ଅଟେ।' : 'This coupon code is invalid.');
      return;
    }

    const subtotalRupees = items.reduce((sum, item) => sum + item.lineTotalPaise, 0) / 100;
    if (subtotalRupees < 999) {
      setCouponError(
        lang === 'or'
          ? 'ଏହି କୂପନ୍ ବ୍ୟବହାର କରିବାକୁ ଅତିକମ୍ରେ ₹୯୯୯ ର ସାମଗ୍ରୀ ଯୋଡ଼ନ୍ତୁ।'
          : 'Add items worth ₹999 to use this coupon.'
      );
      return;
    }

    setAppliedCoupon('SHOP50');
    writeCouponToStorage('SHOP50');
    setCouponSuccess(lang === 'or' ? 'କୂପନ୍ ପ୍ରୟୋଗ ହେଲା! ଆପଣ ₹୫୦ ସଞ୍ଚୟ କଲେ।' : 'Coupon applied! You saved ₹50.');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    writeCouponToStorage(null);
    setCouponError(null);
    setCouponSuccess(null);
  };

  // Re-verify coupon eligibility if subtotal changes
  const summary = useMemo(() => {
    const subtotalRupees = items.reduce((sum, i) => sum + i.lineTotalPaise, 0) / 100;
    let activeCode = appliedCoupon;
    if (activeCode === 'SHOP50' && subtotalRupees < 999) {
      activeCode = null;
    }
    return calculateCartSummary(items, activeCode);
  }, [items, appliedCoupon]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      <BulkOrderContext.Provider value={{ openBulkOrderModal }}>
        <CartContext.Provider
          value={{
            items,
            summary,
            isHydrated,
            appliedCoupon: summary.couponCode,
            couponError,
            couponSuccess,
            addItem,
            setItemQuantity,
            removeItem,
            clearCart,
            applyCoupon,
            removeCoupon,
          }}
        >
          {children}
          <BulkOrderModal
            isOpen={isBulkModalOpen}
            data={bulkModalData}
            onClose={() => setIsBulkModalOpen(false)}
          />
        </CartContext.Provider>
      </BulkOrderContext.Provider>
    </LanguageContext.Provider>
  );
}

