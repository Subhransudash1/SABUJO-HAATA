import { Metadata } from 'next';
import { getAvailableProducts, getPopularStaples } from '@/lib/product-utils';
import { HomeContent } from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: 'Sabuja Haata (ସବୁଜ ହାଟ) — Fresh Vegetables, Leafy Greens & Seasonal Fruits',
  description:
    'Explore fresh vegetables, local leafy greens, and seasonal fruits at Sabuja Haata. Fresh picks for everyday living.',
};

export default function HomePage() {
  const available = getAvailableProducts();
  const featured = available.filter(p => p.isPopularStaple || parseInt(p.id) % 3 === 0).slice(0, 10);
  const staples = available.filter(p => !featured.some(f => f.id === p.id));

  return <HomeContent featuredProducts={featured} popularStaples={staples} />;
}
