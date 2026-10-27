import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Sabuja Haata',
  description: 'Store terms, pricing integrity, and order fulfillment policies at Sabuja Haata.',
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout title="Terms and Conditions">
      <div className="rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] p-4 text-xs sm:text-sm text-[#173D2A]">
        <p className="font-semibold">Notice for Review:</p>
        <p className="text-[#697269] mt-0.5">
          These terms describe current store operational rules and interface functionality. Comprehensive commercial legal terms are pending formal confirmation from the store owner.
        </p>
      </div>

      <section className="space-y-3 pt-2">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          1. Catalogue Rates & Pricing Integrity
        </h2>
        <p>
          Produce prices displayed in Indian Rupees (INR / ₹) reflect current local market catalogue rates. Fractional weights for vegetables sold by kilogram are calculated precisely in exact integer paise.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          2. Produce Availability
        </h2>
        <p>
          Agricultural produce availability is subject to seasonal harvests and supply conditions. Items marked as unavailable in the catalogue cannot be added to the cart until new stock arrives.
        </p>
      </section>
    </LegalPageLayout>
  );
}
