import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number; // kg can be 0.25, 0.5, 0.75, etc.; piece/bundle must be integers >= 1
  lineTotalPaise: number; // integer paise
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number; // total number of distinct products
  totalUnitsFormatted: string;
  subtotalPaise: number; // integer paise
  deliveryFeePaise: number;
  discountPaise: number;
  couponCode: string | null;
  totalPaise: number; // integer paise
}

