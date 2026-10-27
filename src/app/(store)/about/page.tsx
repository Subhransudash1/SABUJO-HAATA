import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE_CONFIG } from '@/data/site-config';

export const metadata: Metadata = {
  title: 'About Us | Sabuja Haata',
  description: 'Learn about Sabuja Haata, our local fresh grocery roots, and transparent produce pricing in Odisha.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 space-y-5 sm:space-y-6">
      <header className="border-b border-[#DDE5D9] pb-4 sm:pb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#173D2A]">
          About Sabuja Haata (ସବୁଜ ହାଟ)
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#697269]">
          Fresh local produce and transparent daily rates in Odisha.
        </p>
      </header>

      <section className="rounded-2xl border border-[#DDE5D9] bg-[#FAF8F2] p-5 sm:p-8 shadow-sm text-xs sm:text-base leading-relaxed text-[#202820] space-y-4 sm:space-y-5">
        <p>
          <strong>Sabuja Haata (ସବୁଜ ହାଟ)</strong> connects local households with fresh everyday vegetables, authentic leafy greens, and seasonal fruits. We focus on simple, transparent grocery shopping grounded in the genuine produce traditions of Odisha.
        </p>
        <p>
          Whether you need everyday cooking essentials like potatoes (ଆଳୁ), pointed gourd (ପୋଟଳ), and ridge gourd (ଜହ୍ନି) for your daily curries and dalma, or crisp apples and regional Patkapura bananas, our catalogue reflects fresh produce available for your home kitchen.
        </p>

        <div className="rounded-xl border border-[#DDE5D9] bg-white p-4 sm:p-6 space-y-3">
          <h2 className="font-display text-base sm:text-lg font-semibold text-[#173D2A]">
            Our Core Principles
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#697269]">
            <li>
              <strong>Transparent Daily Rates:</strong> Rates reflect current market conditions with clear itemized pricing.
            </li>
            <li>
              <strong>Authentic Local Produce:</strong> From banana blossoms (କଦଳୀ ଭଣ୍ଡା) to taro root (ସାରୁ) and leafy greens (ଶାଗ), we offer authentic regional staples.
            </li>
            <li>
              <strong>Flexible Fractional Weights:</strong> Support for 0.25 kg increments on bulk produce so you can order exactly what your kitchen needs.
            </li>
          </ul>
        </div>

        <div className="pt-2 text-xs text-[#697269] space-y-1">
          <p><strong>Store Address:</strong> {SITE_CONFIG.storeAddress}</p>
          <p><strong>Operating Hours:</strong> {SITE_CONFIG.operatingHours}</p>
          <p><strong>Phone:</strong> {SITE_CONFIG.storePhone}</p>
        </div>

        <div className="pt-4 border-t border-[#DDE5D9]">
          <Link
            href="/shop"
            className="inline-flex h-10 sm:h-11 items-center gap-2 rounded-lg bg-[#245C3A] px-6 text-xs sm:text-sm font-semibold text-white hover:bg-[#173D2A] transition-colors"
          >
            <span>Browse Fresh Produce</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
