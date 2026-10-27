import { Metadata } from 'next';
import { getProductsByCategory } from '@/lib/product-utils';
import { CatalogueBrowser } from '@/components/products/CatalogueBrowser';

export const metadata: Metadata = {
  title: 'Fresh Vegetables & Leafy Greens | Sabuja Haata',
  description:
    'Browse fresh local vegetables, tubers, and leafy greens at Sabuja Haata.',
};

export default function VegetablesPage() {
  const products = getProductsByCategory('vegetables');

  return (
    <CatalogueBrowser
      initialProducts={products}
      initialCategory="vegetables"
      pageTitle="Fresh Vegetables & Greens"
    />
  );
}
