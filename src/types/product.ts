export type ProductCategory = 'vegetables' | 'fruits';

export type ProductSubcategory =
  | 'roots-tubers'
  | 'ginger-garlic-lemon-chilli'
  | 'gourds-squash'
  | 'everyday-vegetables'
  | 'plantain-regional'
  | 'pods-beans'
  | 'leafy-greens'
  | 'apples-pomegranate-grapes'
  | 'banana-melon-tropical'
  | 'citrus-amla';

export type ProductUnit = 'kg' | 'piece' | 'bundle' | 'unit unconfirmed';

export interface Product {
  id: string;
  slug: string;
  nameEn: string;
  nameOr: string;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  subCategoryLabelEn: string;
  subCategoryLabelOr: string;
  price: number; // in Indian Rupees (INR) - active payable price
  sellingPrice?: number; // regular / original price (MRP)
  offerPrice?: number; // active discounted price if configured
  unit: ProductUnit;
  available: boolean;
  unavailableReason?: string;
  unavailableReasonOr?: string;
  image: string;
  hasLocalPhoto: boolean;
  priceUpdatedAt: string; // "23 October 2026"
  descriptionEn: string;
  descriptionOr: string;
  storageTipsEn: string;
  storageTipsOr: string;
  isPopularStaple?: boolean;
}
