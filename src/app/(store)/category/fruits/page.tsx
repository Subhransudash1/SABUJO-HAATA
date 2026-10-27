import { Metadata } from 'next';
import { getProductsByCategory } from '@/lib/product-utils';
import { CatalogueBrowser } from '@/components/products/CatalogueBrowser';

export const metadata: Metadata = {
  title: 'Seasonal & Everyday Fruits | Sabuja Haata',
  description:
    'Explore fresh apples, bananas, pomegranates, citrus, and seasonal fruits at Sabuja Haata.',
};

export default function FruitsPage() {
  const products = getProductsByCategory('fruits');

  return (
    <CatalogueBrowser
      initialProducts={products}
      initialCategory="fruits"
      pageTitle="Seasonal & Everyday Fruits"
    />
  );
}
