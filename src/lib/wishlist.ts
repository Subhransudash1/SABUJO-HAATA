import { Product } from '@/types/product';
import { getAllProducts } from '@/lib/product-utils';

const WISHLIST_STORAGE_KEY = 'sabuja_user_wishlist';

export function getWishlistProductIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWishlistProductIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event('sabuja_wishlist_updated'));
  } catch {
    // ignore
  }
}

export function toggleWishlistProductId(id: string): boolean {
  const current = getWishlistProductIds();
  const exists = current.includes(id);
  const updated = exists ? current.filter((x) => x !== id) : [...current, id];
  saveWishlistProductIds(updated);
  return !exists;
}

export function getWishlistProducts(): Product[] {
  const ids = getWishlistProductIds();
  if (!ids.length) return [];
  const all = getAllProducts();
  return all.filter((p) => ids.includes(p.id) || ids.includes(p.slug));
}

export function isInWishlist(id: string): boolean {
  const ids = getWishlistProductIds();
  return ids.includes(id);
}
