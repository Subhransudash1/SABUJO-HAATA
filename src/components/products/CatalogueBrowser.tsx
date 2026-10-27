'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Product, ProductCategory, ProductSubcategory } from '@/types/product';
import { filterAndSortProducts } from '@/lib/product-utils';
import { ProductCard } from './ProductCard';
import { SortDropdown } from './SortDropdown';

interface CatalogueBrowserProps {
  initialProducts: Product[];
  initialCategory?: ProductCategory | 'all';
  initialSubcategory?: ProductSubcategory | 'all';
  initialSearchQuery?: string;
  showSearch?: boolean;
  autoFocusSearch?: boolean;
  pageTitle?: string;
}

export function CatalogueBrowser({
  initialProducts,
  initialCategory = 'all',
  initialSubcategory = 'all',
  initialSearchQuery = '',
  showSearch = false,
  autoFocusSearch = false,
  pageTitle = 'All Fresh Produce',
}: CatalogueBrowserProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ProductSubcategory | 'all'>(initialSubcategory);
  const [sortOption, setSortOption] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc'>('default');
  const [quickFilter, setQuickFilter] = useState<'all' | 'available' | 'staples'>('all');
  const [searchActive, setSearchActive] = useState(Boolean(showSearch || initialSearchQuery));
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync initialSearchQuery when passed from URL searchParams
  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
      if (initialSearchQuery) setSearchActive(true);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (showSearch) {
      setSearchActive(true);
    }
    if (autoFocusSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 30);
    }
  }, [showSearch, autoFocusSearch]);

  useEffect(() => {
    const handleOpenSearch = () => {
      setSearchActive(true);
      setTimeout(() => searchInputRef.current?.focus(), 30);
    };
    window.addEventListener('sabuja_open_search', handleOpenSearch);
    return () => window.removeEventListener('sabuja_open_search', handleOpenSearch);
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSubcategory) {
      setSelectedSubcategory(initialSubcategory);
    }
  }, [initialSubcategory]);

  const filteredProducts = useMemo(() => {
    const base =
      quickFilter === 'staples'
        ? initialProducts.filter((p) => p.isPopularStaple)
        : initialProducts;
    return filterAndSortProducts(base, {
      query: searchQuery,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      sort: sortOption,
      onlyAvailable: quickFilter === 'available',
    });
  }, [initialProducts, searchQuery, selectedCategory, selectedSubcategory, sortOption, quickFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSortOption('default');
    setQuickFilter('all');
  };

  const bannerHeading =
    selectedSubcategory === 'leafy-greens'
      ? 'Fresh Leafy Greens'
      : selectedCategory === 'all'
      ? pageTitle
      : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-8 bg-[#F7F8F5]">
      <div className="flex flex-col lg:grid lg:grid-cols-[250px_1fr] gap-5 sm:gap-7">
        
        {/* Left Sidebar (Desktop only) */}
        <aside className="hidden lg:block space-y-5">
          <div className="bg-white rounded-2xl border border-[#E6EAE4] p-5 shadow-xs">
            <h2 className="text-base font-black text-[#17211B] mb-3">Categories</h2>
            <nav className="flex flex-col gap-1">
              {[
                { id: 'all', name: 'All Products', count: initialProducts.length, type: 'category' },
                { id: 'vegetables', name: 'Vegetables', count: initialProducts.filter(p => p.category === 'vegetables').length, type: 'category' },
                { id: 'fruits', name: 'Fruits', count: initialProducts.filter(p => p.category === 'fruits').length, type: 'category' },
                { id: 'leafy-greens', name: 'Leafy Greens', count: initialProducts.filter(p => p.subcategory === 'leafy-greens').length, type: 'subcategory' },
              ].map((cat) => {
                const isActive =
                  cat.type === 'category'
                    ? selectedCategory === cat.id && selectedSubcategory === 'all'
                    : selectedSubcategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.type === 'category') {
                        setSelectedCategory(cat.id as ProductCategory | 'all');
                        setSelectedSubcategory('all');
                      } else {
                        setSelectedCategory('all');
                        setSelectedSubcategory(cat.id as ProductSubcategory);
                      }
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#EAF6E7] text-[#064E32] border border-[#064E32]/15' 
                        : 'text-[#727A73] hover:bg-[#F7F8F5] hover:text-[#17211B]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#064E32] text-white' : 'bg-[#E6EAE4] text-[#727A73]'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-[#03472E] rounded-2xl p-5 text-white overflow-hidden relative group">
            <div className="relative z-10 space-y-1.5">
              <h3 className="text-base font-black leading-tight">Fresh From Our Farms</h3>
              <p className="text-[11px] text-[#8BCF45] font-bold">100% Organic & Chemical Free</p>
              <Link
                href="/how-shopping-works"
                className="mt-2 inline-block text-[10px] font-black uppercase tracking-widest bg-white text-[#03472E] px-3 py-1.5 rounded-lg hover:bg-[#EAF6E7] transition-colors"
              >
                Learn More
              </Link>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-[#8BCF45]/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="space-y-4 sm:space-y-5 min-w-0">
          {/* Dedicated Search Input when opened from Search tab or Homepage search */}
          {searchActive && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#727A73]" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for vegetables, fruits, leafy greens..."
                className="w-full h-10 sm:h-11 rounded-xl border border-[#DDE5D9] bg-white pl-10 pr-10 text-xs sm:text-sm font-medium text-[#17211B] placeholder:text-[#727A73] focus:outline-none focus:border-[#064E32] focus:ring-1 focus:ring-[#064E32] shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#727A73] hover:text-[#17211B] rounded-full"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Category Banner */}
          <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#03472E] min-h-[125px] sm:min-h-[175px] flex flex-col justify-center px-5 sm:px-10 py-4 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/organic-farm-poster.jpg" 
              alt="Category Banner" 
              className="absolute inset-0 h-full w-full object-cover opacity-45"
            />
            <div className="relative z-10 space-y-1.5 sm:space-y-2">
              <h1 className="text-xl sm:text-3xl font-black tracking-tight">{bannerHeading}</h1>
              <p className="text-xs sm:text-sm font-medium text-[#EAF6E7]">Directly from the local farmers of Odisha</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold">🌿 100% Organic</span>
                <span className="bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold">🚜 No Chemicals</span>
              </div>
            </div>
          </section>

          {/* Filters & Sorting Row */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Mobile Category Scroll */}
            <div className="lg:hidden w-full overflow-x-auto no-scrollbar flex gap-2 pb-0.5">
              {[
                { id: 'all', name: 'All', type: 'category' },
                { id: 'vegetables', name: 'Vegetables', type: 'category' },
                { id: 'fruits', name: 'Fruits', type: 'category' },
                { id: 'leafy-greens', name: 'Leafy Greens', type: 'subcategory' },
              ].map((cat) => {
                const isActive =
                  cat.type === 'category'
                    ? selectedCategory === cat.id && selectedSubcategory === 'all'
                    : selectedSubcategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.type === 'category') {
                        setSelectedCategory(cat.id as ProductCategory | 'all');
                        setSelectedSubcategory('all');
                      } else {
                        setSelectedCategory('all');
                        setSelectedSubcategory(cat.id as ProductSubcategory);
                      }
                    }}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#064E32] border-[#064E32] text-white' 
                        : 'bg-white border-[#E6EAE4] text-[#17211B]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-[#17211B]">Filter:</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'available', label: 'In Stock' },
                  { id: 'staples', label: 'Daily Staples' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setQuickFilter(f.id as 'all' | 'available' | 'staples')}
                    className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-colors cursor-pointer ${
                      quickFilter === f.id
                        ? 'bg-[#064E32] border-[#064E32] text-white'
                        : 'bg-white border-[#E6EAE4] text-[#727A73] hover:border-[#064E32] hover:text-[#064E32]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-[#727A73] shrink-0">{filteredProducts.length} Products</span>
              <div className="relative flex-1 sm:flex-none max-w-[190px] sm:max-w-none">
                <SortDropdown value={sortOption} onChange={setSortOption} />
              </div>
            </div>
          </section>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E6EAE4] bg-white p-8 sm:p-14 text-center">
              <h3 className="text-base font-bold text-[#17211B]">No products found</h3>
              <p className="text-xs text-[#727A73] font-medium mt-1.5">Try adjusting your filters or search query.</p>
              <button
                onClick={handleResetFilters}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#064E32] px-5 text-xs font-bold text-white hover:bg-[#187641] transition-all shadow-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="h-20 sm:h-10" />
    </div>
  );
}
