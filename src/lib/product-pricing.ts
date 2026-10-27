import { Product, ProductUnit } from '@/types/product';

export interface ProductPricingInfo {
  sellingPrice: number;     // Regular / original price (MRP)
  offerPrice?: number;      // Discounted price
  activePrice: number;      // The actual price charged to customer
  discountPercent: number;  // Rounded integer discount percentage
  hasDiscount: boolean;     // True if discount is valid and > 0%
  unit: ProductUnit;        // 'kg' | 'bundle' | 'piece'
  stockQty: number;         // Current stock in inventory
  isAvailable: boolean;     // Available for ordering
}

/**
 * Calculates whole number discount percentage:
 * formula: ((sellingPrice - offerPrice) / sellingPrice) * 100
 */
export function calculateDiscountPercent(sellingPrice: number, offerPrice?: number): number {
  if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) return 0;
  if (!offerPrice || !Number.isFinite(offerPrice) || offerPrice <= 0) return 0;
  if (offerPrice >= sellingPrice) return 0;

  const pct = ((sellingPrice - offerPrice) / sellingPrice) * 100;
  return Math.round(pct);
}

/**
 * Returns the effective active price a customer pays.
 */
export function getActivePayablePrice(sellingPrice: number, offerPrice?: number): number {
  if (
    Number.isFinite(offerPrice) &&
    offerPrice !== undefined &&
    offerPrice > 0 &&
    Number.isFinite(sellingPrice) &&
    offerPrice < sellingPrice
  ) {
    return offerPrice;
  }
  return Number.isFinite(sellingPrice) && sellingPrice > 0 ? sellingPrice : 0;
}

/**
 * Resolves deterministic default pricing directly from static product definition.
 * Strictly safe for server-side rendering and initial client hydration (no localStorage access).
 */
export function getDefaultProductPricing(product: {
  id: string;
  price: number;
  sellingPrice?: number;
  offerPrice?: number;
  unit: string;
  available?: boolean;
}): ProductPricingInfo {
  const sellingPrice = product.sellingPrice ?? product.price;
  const offerPrice = product.offerPrice;
  const unit = (product.unit || 'kg') as ProductUnit;
  const stockQty = 50;
  const isAvailable = product.available !== false;
  const discountPercent = calculateDiscountPercent(sellingPrice, offerPrice);
  const hasDiscount = discountPercent > 0;
  const activePrice = getActivePayablePrice(sellingPrice, offerPrice);

  return {
    sellingPrice,
    offerPrice: hasDiscount ? offerPrice : undefined,
    activePrice,
    discountPercent,
    hasDiscount,
    unit,
    stockQty,
    isAvailable,
  };
}

/**
 * Resolves live pricing and inventory data from local admin inventory
 * falling back to product defaults.
 */
export function getLiveProductPricing(product: {
  id: string;
  price: number;
  sellingPrice?: number;
  offerPrice?: number;
  unit: string;
  available?: boolean;
}): ProductPricingInfo {
  let sellingPrice = product.sellingPrice ?? product.price;
  let offerPrice = product.offerPrice;
  let unit = (product.unit || 'kg') as ProductUnit;
  let stockQty = 50;
  let isAvailable = product.available !== false;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('sabuja_admin_inventory');
      if (raw) {
        const inventory: Array<{
          productId: string;
          sellingPrice: number;
          offerPrice?: number;
          unit: string;
          stockQty: number;
        }> = JSON.parse(raw);
        const match = inventory.find((i) => i.productId === product.id);
        if (match) {
          if (Number.isFinite(match.sellingPrice) && match.sellingPrice > 0) {
            sellingPrice = match.sellingPrice;
          }
          if (Number.isFinite(match.offerPrice) && (match.offerPrice as number) > 0) {
            offerPrice = match.offerPrice;
          } else if (match.offerPrice === undefined || match.offerPrice === null || match.offerPrice === 0) {
            offerPrice = undefined;
          }
          if (match.unit) {
            unit = match.unit as ProductUnit;
          }
          if (typeof match.stockQty === 'number') {
            stockQty = match.stockQty;
            if (stockQty <= 0) {
              isAvailable = false;
            }
          }
        }
      }
    } catch {
      // Ignore parse errors, use defaults
    }
  }

  const discountPercent = calculateDiscountPercent(sellingPrice, offerPrice);
  const hasDiscount = discountPercent > 0;
  const activePrice = getActivePayablePrice(sellingPrice, offerPrice);

  return {
    sellingPrice,
    offerPrice: hasDiscount ? offerPrice : undefined,
    activePrice,
    discountPercent,
    hasDiscount,
    unit,
    stockQty,
    isAvailable,
  };
}

/**
 * Subscribe to inventory and price updates dispatched across windows or local state.
 */
export function subscribeToInventoryUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleUpdate = () => callback();
  window.addEventListener('sabuja_inventory_updated', handleUpdate);
  window.addEventListener('storage', handleUpdate);
  return () => {
    window.removeEventListener('sabuja_inventory_updated', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}
