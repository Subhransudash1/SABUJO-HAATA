import { Metadata } from 'next';
import { getAllProducts } from '@/lib/product-utils';
import { CatalogueBrowser } from '@/components/products/CatalogueBrowser';

export const metadata: Metadata = {
  title: 'All Fresh Produce | Sabuja Haata',
  description:
    'Browse our complete catalogue of fresh vegetables, leafy greens, and seasonal fruits at Sabuja Haata.',
};

interface ShopPageProps {
  searchParams: Promise<{ q?: string; category?: string; focusSearch?: string; search?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { q, category, focusSearch, search } = await searchParams;
  const products = getAllProducts();
  const isSearchMode = focusSearch === 'true' || search === 'true' || Boolean(q);

  return (
    <CatalogueBrowser
      initialProducts={products}
      initialCategory={(category as any) || 'all'}
      initialSearchQuery={q || ''}
      showSearch={isSearchMode}
      autoFocusSearch={focusSearch === 'true' || search === 'true'}
      pageTitle="All Fresh Produce"
    />
  );
}
