import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProducts, getPopularStaples } from '@/lib/product-utils';
import { CatalogueBrowser } from '@/components/products/CatalogueBrowser';
import { ProductSubcategory } from '@/types/product';

interface CategorySlugPageProps {
  params: Promise<{ slug: string }>;
}

const SLUG_CONFIG: Record<
  string,
  {
    title: string;
    description: string;
    pageTitle: string;
    subcategory?: ProductSubcategory;
    filterType?: 'staples' | 'seasonal';
  }
> = {
  'leafy-greens': {
    title: 'Fresh Leafy Greens (ଶାଗ) | Sabuja Haata',
    description: 'Explore fresh local leafy greens, spinach, amaranth, water spinach, mint, and coriander at Sabuja Haata.',
    pageTitle: 'Fresh Leafy Greens (ଶାଗ)',
    subcategory: 'leafy-greens',
  },
  staples: {
    title: 'Kitchen Essentials & Daily Staples | Sabuja Haata',
    description: 'Stock up on everyday kitchen essentials including potatoes, onions, ginger, garlic, lemons, and cooking staples.',
    pageTitle: 'Kitchen Essentials & Staples',
    filterType: 'staples',
  },
  seasonal: {
    title: 'Seasonal Picks & Fresh Harvest | Sabuja Haata',
    description: 'Explore seasonal fruits and vegetables harvested fresh from Odisha farms.',
    pageTitle: 'Seasonal Fresh Harvest',
    filterType: 'seasonal',
  },
};

export async function generateStaticParams() {
  return Object.keys(SLUG_CONFIG).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CategorySlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cfg = SLUG_CONFIG[slug];
  if (!cfg) {
    return {
      title: 'Category | Sabuja Haata',
    };
  }
  return {
    title: cfg.title,
    description: cfg.description,
  };
}

export default async function CategorySlugPage({ params }: CategorySlugPageProps) {
  const { slug } = await params;
  const cfg = SLUG_CONFIG[slug];

  if (!cfg) {
    notFound();
  }

  const allProducts = getAllProducts();

  if (cfg.subcategory) {
    return (
      <CatalogueBrowser
        initialProducts={allProducts}
        initialCategory="all"
        initialSubcategory={cfg.subcategory}
        pageTitle={cfg.pageTitle}
      />
    );
  }

  if (cfg.filterType === 'staples') {
    const staples = getPopularStaples();
    return (
      <CatalogueBrowser
        initialProducts={staples.length > 0 ? staples : allProducts}
        initialCategory="all"
        pageTitle={cfg.pageTitle}
      />
    );
  }

  return (
    <CatalogueBrowser
      initialProducts={allProducts}
      initialCategory="all"
      pageTitle={cfg.pageTitle}
    />
  );
}
