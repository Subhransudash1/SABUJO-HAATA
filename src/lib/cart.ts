import type { Language } from './i18n';
import type { CartItem, CartSummary } from '@/types/cart';

export type { CartItem, CartSummary };

export const CART_STORAGE_KEY = 'shopbujo_hatto_cart_v1';
export const COUPON_STORAGE_KEY = 'shopbujo_hatto_coupon_v1';

export function getQuantityStep(unit: string): number {
  return unit === 'kg' ? 0.5 : 1;
}

export function getMinQuantity(unit: string): number {
  return unit === 'kg' ? 0.5 : 1;
}

export function getMaxQuantity(unit: string): number {
  return unit === 'kg' ? 10 : 20;
}

export function validateQuantity(quantity: number, unit: string): number {
  if (unit === 'kg') {
    const steps = Math.round(quantity / 0.5);
    const valid = Math.min(10, Math.max(0.5, steps * 0.5));
    return Number(valid.toFixed(2));
  }
  const valid = Math.min(20, Math.max(1, Math.round(quantity)));
  return valid;
}

export function calculateCartSummary(
  items: CartItem[],
  appliedCouponCode: string | null = null
): CartSummary {
  const subtotalPaise = items.reduce((sum, item) => sum + item.lineTotalPaise, 0);
  const subtotalRupees = subtotalPaise / 100;

  // Delivery Rule: ₹25 below ₹149, free at ₹149 or above. If subtotal is 0, delivery is 0.
  let deliveryFeePaise = 0;
  if (subtotalPaise > 0) {
    if (subtotalRupees < 149) {
      deliveryFeePaise = 2500; // ₹25 in paise
    }
  }

  // Coupon Rule: SHOP50 gives ₹50 off on ₹999 or more
  let discountPaise = 0;
  let activeCoupon: string | null = null;
  if (appliedCouponCode && appliedCouponCode.trim().toUpperCase() === 'SHOP50') {
    if (subtotalRupees >= 999) {
      discountPaise = 5000; // ₹50 in paise
      activeCoupon = 'SHOP50';
    }
  }

  const totalPaise = Math.max(0, subtotalPaise + deliveryFeePaise - discountPaise);

  const totalKg = items
    .filter((i) => i.product.unit === 'kg')
    .reduce((sum, i) => sum + i.quantity, 0);

  const totalCount = items
    .filter((i) => i.product.unit !== 'kg')
    .reduce((sum, i) => sum + i.quantity, 0);

  const unitsParts: string[] = [];
  if (totalKg > 0) {
    unitsParts.push(`${totalKg.toFixed(totalKg % 1 === 0 ? 0 : 2)} kg`);
  }
  if (totalCount > 0) {
    unitsParts.push(`${totalCount} items`);
  }

  return {
    items,
    itemCount: items.length,
    totalUnitsFormatted: unitsParts.length > 0 ? unitsParts.join(' + ') : '0 items',
    subtotalPaise,
    deliveryFeePaise,
    discountPaise,
    couponCode: activeCoupon,
    totalPaise,
  };
}

export function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    let inventoryMap: Record<string, { sellingPrice: number; offerPrice?: number; unit?: string }> = {};
    try {
      const invRaw = localStorage.getItem('sabuja_admin_inventory');
      if (invRaw) {
        const inv = JSON.parse(invRaw);
        if (Array.isArray(inv)) {
          inv.forEach((i: any) => {
            if (i && i.productId) {
              inventoryMap[i.productId] = {
                sellingPrice: i.sellingPrice,
                offerPrice: i.offerPrice,
                unit: i.unit,
              };
            }
          });
        }
      }
    } catch {
      // ignore
    }

    return parsed
      .filter((item: any) => item && item.product && item.product.id)
      .map((item: any) => {
        const inv = inventoryMap[item.product.id];
        let activePrice = item.product.price;
        let sellingPrice = item.product.sellingPrice;
        let offerPrice = item.product.offerPrice;
        let unit = item.product.unit;

        if (inv) {
          if (Number.isFinite(inv.sellingPrice) && inv.sellingPrice > 0) {
            sellingPrice = inv.sellingPrice;
            activePrice = inv.sellingPrice;
          }
          if (Number.isFinite(inv.offerPrice) && (inv.offerPrice as number) > 0 && (inv.offerPrice as number) < inv.sellingPrice) {
            offerPrice = inv.offerPrice;
            activePrice = inv.offerPrice as number;
          } else {
            offerPrice = undefined;
          }
          if (inv.unit) {
            unit = inv.unit;
          }
        }

        const validatedQty = validateQuantity(item.quantity || 1, unit);
        return {
          product: {
            ...item.product,
            price: activePrice,
            sellingPrice,
            offerPrice,
            unit,
          },
          quantity: validatedQty,
          lineTotalPaise: Math.round(activePrice * 100 * validatedQty),
        };
      });
  } catch {
    return [];
  }
}

export function writeCartToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore
  }
}

export function readCouponFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(COUPON_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeCouponToStorage(code: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (code) {
      localStorage.setItem(COUPON_STORAGE_KEY, code);
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}
