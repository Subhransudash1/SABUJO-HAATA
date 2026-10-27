import { Product, ProductCategory, ProductSubcategory } from '@/types/product';
import { PRODUCTS } from '@/data/products';

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getAvailableProducts(): Product[] {
  return PRODUCTS.filter((p) => p.available);
}

export function getPopularStaples(): Product[] {
  return PRODUCTS.filter((p) => p.isPopularStaple && p.available);
}

export function filterAndSortProducts(
  products: Product[],
  options: {
    query?: string;
    category?: ProductCategory | 'all';
    subcategory?: ProductSubcategory | 'all';
    sort?: 'default' | 'price-asc' | 'price-desc' | 'name-asc';
    onlyAvailable?: boolean;
  }
): Product[] {
  const { query, category, subcategory, sort = 'default', onlyAvailable } = options;

  let result = [...products];

  if (onlyAvailable) {
    result = result.filter((p) => p.available);
  }

  if (category && category !== 'all') {
    result = result.filter((p) => p.category === category);
  }

  if (subcategory && subcategory !== 'all') {
    result = result.filter((p) => p.subcategory === subcategory);
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter((p) => {
      return (
        p.nameEn.toLowerCase().includes(q) ||
        p.nameOr.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.descriptionEn.toLowerCase().includes(q) ||
        p.subCategoryLabelEn.toLowerCase().includes(q) ||
        p.subCategoryLabelOr.toLowerCase().includes(q)
      );
    });
  }

  if (sort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'name-asc') {
    result.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }

  return result;
}
