import { MetadataRoute } from 'next';
import { PRODUCTS } from '@/data/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://shopbujohatto.local';

  const staticRoutes = [
    '',
    '/shop',
    '/category/vegetables',
    '/category/fruits',
    '/category/leafy-greens',
    '/category/staples',
    '/cart',
    '/about',
    '/contact',
    '/faq',
    '/delivery-policy',
    '/return-refund-policy',
    '/privacy-policy',
    '/terms-and-conditions',
    '/cookie-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date('2026-10-23'),
  }));

  const productRoutes = PRODUCTS.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date('2026-10-23'),
  }));

  return [...staticRoutes, ...productRoutes];
}
