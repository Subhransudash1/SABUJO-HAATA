import { Metadata } from 'next';
import { SITE_CONFIG } from '@/data/site-config';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Sabuja Haata',
  description: 'Common questions about produce pricing, weights, delivery, and shopping at Sabuja Haata.',
};

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 space-y-5 sm:space-y-6">
      <header className="border-b border-[#DDE5D9] pb-4 sm:pb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#173D2A]">
          Frequently Asked Questions
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#697269]">
          Clear answers regarding our produce catalogue, fractional weights, and store procedures.
        </p>
      </header>

      <div className="space-y-4">
        {SITE_CONFIG.faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] p-5 sm:p-6 shadow-xs space-y-2 text-[#202820]"
          >
            <h2 className="font-display text-base sm:text-lg font-semibold text-[#173D2A]">
              {faq.qEn}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-[#697269]">
              {faq.aEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
