'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import organicFarmHero from '@/assets/images/organic_farm_hero_1792758060821.jpg';
import farmHarvestingHero from '@/assets/images/farm_harvesting_hero_1792759214594.jpg';
import handsHarvestingHero from '@/assets/images/hands_harvesting_closeup_1792759234435.jpg';

interface HomeContentProps {
  featuredProducts: Product[];
  popularStaples: Product[];
}

const HERO_SLIDES = [
  {
    id: 'produce-basket',
    src: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
    alt: 'Fresh Organic Produce at Sabuja Haata',
    badge: 'Farm-to-Kitchen Daily Harvest',
  },
  {
    id: 'odisha-organic-farm',
    src: organicFarmHero.src,
    alt: 'Lush green organic vegetable fields in Odisha',
    badge: '100% Chemical-Free Local Farms',
  },
  {
    id: 'morning-harvest',
    src: farmHarvestingHero.src,
    alt: 'Farmers harvesting fresh seasonal greens at dawn',
    badge: 'Picked Fresh Every Morning',
  },
  {
    id: 'handpicked-quality',
    src: handsHarvestingHero.src,
    alt: 'Handpicked ripe produce and leafy greens',
    badge: 'Transparent Local Market Rates',
  },
];

export function HomeContent({
  featuredProducts,
  popularStaples,
}: HomeContentProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="space-y-4 sm:space-y-7 pb-20 bg-[#F7F8F5]">
      <section className="mx-auto max-w-7xl px-3 sm:px-6 pt-2 sm:pt-4">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-[#03472E] aspect-[21/9] xs:aspect-[21/8.5] sm:aspect-[24/7.5] lg:aspect-[28/7.5] min-h-[168px] sm:min-h-[200px] shadow-sm ring-1 ring-black/5"
        >
          {/* Animated Background Slides */}
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={slide.id}
                src={slide.src}
                alt={slide.alt}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out motion-reduce:transition-none ${
                  isActive ? 'opacity-85 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                }`}
              />
            );
          })}

          {/* Readability Gradient Scrims (left for text, bottom for indicators) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#03472E]/95 via-[#03472E]/65 to-[#03472E]/5 pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"
          />

          {/* Text Overlay */}
          <div className="relative z-10 h-full flex flex-col justify-center items-start px-5 sm:px-12 pt-3 pb-6 sm:py-4 gap-2 sm:gap-3 animate-hero-fade-up">
            <span className="hidden xs:inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 px-2.5 py-0.5 text-[9px] sm:text-[11px] font-semibold tracking-wide text-[#EAF6E7] transition-all duration-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8BCF45]" />
              {HERO_SLIDES[activeSlide].badge}
            </span>
            <h1 className="font-display text-[17px] xs:text-xl sm:text-[1.85rem] lg:text-[2.2rem] font-bold text-white leading-[1.2] tracking-tight max-w-[230px] xs:max-w-md [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
              Fresh <br />
              Organic Produce <br />
              for a Healthier Life
            </h1>
            <Link
              href="/shop"
              className="inline-flex h-8 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-[#8BCF45] px-4 sm:px-6 text-[11px] sm:text-sm font-bold text-[#03472E] shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)] hover:bg-[#9BDB57] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#03472E] transition-all duration-200"
            >
              <span>Shop Now</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </div>

          {/* Interactive Carousel Dots */}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === activeSlide;
              return (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show banner slide ${idx + 1}: ${slide.badge}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? 'w-4 sm:w-6 bg-[#8BCF45]' : 'w-1.5 bg-white/45 hover:bg-white/75'
                  }`}
                />
              );
            })}
          </div>

          {/* Trust Labels (Overlay) */}
          <div className="absolute bottom-3 right-6 z-10 hidden lg:flex items-center gap-5 bg-black/35 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-[11px] font-bold text-white">
            <span className="flex items-center gap-1.5">🌿 100% Organic</span>
            <span className="h-3.5 w-px bg-white/20" />
            <span className="flex items-center gap-1.5">🚜 Farm Fresh</span>
            <span className="h-3.5 w-px bg-white/20" />
            <span className="flex items-center gap-1.5">💚 Support Local</span>
          </div>
        </div>
      </section>

      {/* 2. Categories Row (5 Categories — Seasonal removed, evenly balanced) */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="grid grid-cols-5 gap-2 sm:gap-6 max-w-2xl mx-auto py-1">
          {[
            { id: 'vegetables', name: 'Vegetables', icon: 'https://cdn-icons-png.flaticon.com/128/2329/2329865.png', href: '/category/vegetables' },
            { id: 'fruits', name: 'Fruits', icon: 'https://cdn-icons-png.flaticon.com/128/3194/3194591.png', href: '/category/fruits' },
            { id: 'leafy', name: 'Leafy Greens', icon: 'https://cdn-icons-png.flaticon.com/128/2329/2329903.png', href: '/category/leafy-greens' },
            { id: 'kitchen', name: 'Kitchen Essentials', icon: 'https://cdn-icons-png.flaticon.com/128/2153/2153788.png', href: '/category/staples' },
            { id: 'all', name: 'All Categories', icon: 'https://cdn-icons-png.flaticon.com/128/2311/2311524.png', href: '/shop' },
          ].map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform duration-200"
            >
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white shadow-xs border border-[#E6EAE4] group-hover:border-[#8BCF45] group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200 p-2 sm:p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.icon} alt={cat.name} className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200" />
              </div>
              <span className="text-[9px] sm:text-[11px] font-bold text-[#17211B] text-center leading-tight max-w-full break-words group-hover:text-[#03472E] transition-colors duration-200">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Trust Grid Icons */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="grid grid-cols-4 gap-1 sm:gap-3 bg-[#EAF6E7]/60 rounded-2xl sm:rounded-3xl px-1.5 py-2 sm:p-3 border border-[#064E32]/5 shadow-xs animate-trust-fade-in">
          {[
            { label: '100% Organic', sub: 'No chemicals', icon: '🌿' },
            { label: 'Farm Fresh', sub: 'Direct from farms', icon: '🚜' },
            { label: 'Safe Delivery', sub: 'Guaranteed', icon: '🚚' },
            { label: 'Support Local', sub: 'Empower farmers', icon: '💚' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-2.5 px-0.5 py-0.5 sm:p-1.5 min-w-0"
            >
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full bg-white shadow-xs text-xs sm:text-base shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9.5px] min-[390px]:text-[10px] sm:text-xs font-extrabold text-[#17211B] leading-[1.15] break-words">
                  {item.label}
                </p>
                <p className="text-[8px] min-[390px]:text-[8.5px] sm:text-[10px] text-[#697269] font-medium leading-[1.15] mt-0.5 break-words">
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Promotional Offer Banner */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6">
        <Link
          href="/shop"
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#FFF4D8] border border-[#E6EAE4] px-2.5 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 group cursor-pointer hover:shadow-md transition-all shadow-xs"
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden shrink-0 border border-white shadow-xs bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/products/apple.jpg" alt="Offer" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[11px] min-[380px]:text-xs sm:text-sm font-extrabold text-[#17211B] uppercase tracking-tight leading-tight">
                Get ₹50 OFF (Code: SHOP50)
              </h2>
              <p className="text-[9.5px] sm:text-[11px] font-semibold text-[#727A73] leading-tight mt-0.5">
                On fresh produce orders above ₹999
              </p>
            </div>
          </div>
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-[#03472E] flex items-center justify-center text-white group-hover:translate-x-0.5 transition-transform shrink-0">
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </Link>
      </section>

      {/* 5. Bestsellers Carousel Section */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl sm:text-2xl font-black text-[#17211B]">Bestsellers</h2>
          <Link href="/shop" className="text-xs sm:text-sm font-bold text-[#064E32] flex items-center gap-1 hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-4 no-scrollbar -mx-3 px-3 scroll-smooth">
          {featuredProducts.map((p) => (
            <div key={p.id} className="min-w-[140px] sm:min-w-[200px] w-[140px] sm:w-[200px] shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* 9. Main Product Grid (Naturally continuing) */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mb-4 sm:mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-black text-[#17211B]">Our Fresh Catalogue</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
          {popularStaples.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 10. New to Sabuja Haata? Callout */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 pt-6">
        <Link 
          href="/how-shopping-works"
          className="block rounded-2xl border border-[#DDE5D9] bg-white p-4 sm:p-6 text-[#202820] shadow-sm hover:border-[#8BCF45] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#EAF6E7] flex items-center justify-center text-[#03472E] group-hover:scale-110 transition-transform shrink-0">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-black text-[#173D2A] truncate">
                  New to Sabuja Haata?
                </h2>
                <p className="text-[10px] sm:text-xs text-[#697269] font-medium line-clamp-1">
                  Learn how we deliver farm-fresh goodness to you.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-[#03472E] shrink-0">
              See how it works <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </div>
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6 border-t border-[#DDE5D9]/50 mt-8">
        <p className="text-center text-[10px] sm:text-xs font-bold text-[#697269]">
          &copy; 2026 Sabuja Haata. All rights reserved.
        </p>
      </section>
    </div>
  );
}
