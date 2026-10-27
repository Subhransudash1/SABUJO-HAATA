'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '@/types/product';
import { getWishlistProducts } from '@/lib/wishlist';
import { ProductCard } from '@/components/products/ProductCard';

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadWishlist = () => {
    const list = getWishlistProducts();
    setProducts(list);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadWishlist();

    const handleUpdate = () => loadWishlist();
    window.addEventListener('sabuja_wishlist_updated', handleUpdate);
    return () => window.removeEventListener('sabuja_wishlist_updated', handleUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8F5] pb-20">
      {/* Header */}
      <div className="bg-[#03472E] text-white px-4 pt-4 pb-8 sm:pt-6 sm:pb-10 rounded-b-2xl sm:rounded-b-3xl shadow-xs">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8BCF45] mb-3 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-red-400 border border-white/15 shrink-0">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-display font-bold leading-tight">My Wishlist</h1>
              <p className="text-white/75 text-[11px] sm:text-xs font-medium">
                {products.length > 0
                  ? `${products.length} saved product${products.length === 1 ? '' : 's'}`
                  : 'Items saved for later purchases.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3.5 sm:px-4 -mt-4 sm:-mt-5">
        {isLoaded && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : isLoaded ? (
          <div className="bg-white rounded-2xl border border-[#E6EAE4] p-8 text-center space-y-3.5 shadow-2xs max-w-xl mx-auto">
            <div className="h-12 w-12 bg-[#FFF2F2] text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#17211B]">Your wishlist is empty</h2>
              <p className="text-xs text-[#697269] max-w-xs mx-auto">
                Save fresh fruits, vegetables, and kitchen staples to your wishlist to easily order them anytime.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex h-9 items-center justify-center gap-2 px-5 rounded-xl bg-[#03472E] text-white text-xs font-bold hover:bg-[#187641] transition-colors"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center text-xs text-[#727A73] max-w-xl mx-auto">
            Loading wishlist...
          </div>
        )}
      </div>
    </div>
  );
}
