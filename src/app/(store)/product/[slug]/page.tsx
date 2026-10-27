import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getAllProducts } from '@/lib/product-utils';
import { formatRupeesINR } from '@/lib/currency';
import { ProductImage } from '@/components/products/ProductImage';
import { ProductDetailPurchase } from '@/components/products/ProductDetailPurchase';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Sabuja Haata',
    };
  }

  return {
    title: `${product.nameEn} (${product.nameOr}) — ${formatRupeesINR(product.price)} / ${product.unit} | Sabuja Haata`,
    description: product.descriptionEn,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = getAllProducts()
    .filter((p) => p.category === product.category && p.id !== product.id && p.available)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-5 sm:py-8 pb-24 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#697269]">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link href="/" className="hover:text-[#173D2A] underline transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/category/${product.category}`}
              className="capitalize hover:text-[#173D2A] underline transition-colors"
            >
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-[#173D2A] truncate">
            {product.nameEn}
          </li>
        </ol>
      </nav>

      {/* Main product card container */}
      <div className="rounded-2xl border border-[#DDE5D9] bg-white p-4 sm:p-6 shadow-xs space-y-4 text-[#202820]">
        {/* 1. Product Image Area */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#E6EAE4] bg-white">
          <ProductImage product={product} className="h-full w-full object-cover" />
        </div>

        {/* 2. Compact Name and Price Row */}
        <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[#E6EAE4]">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-[#173D2A] truncate">
              {product.nameEn}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm font-medium font-sans text-[#245C3A] truncate">
              {product.nameOr}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="font-display text-xl sm:text-2xl font-bold text-[#173D2A]">
              {formatRupeesINR(product.price)}
            </span>
            <span className="text-xs text-[#697269] ml-1 font-sans">
              / {product.unit}
            </span>
          </div>
        </div>

        {/* Purchase Controls */}
        <ProductDetailPurchase product={product} />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-5 border-t border-[#DDE5D9]">
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#173D2A] mb-3.5">
            You might also need
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
