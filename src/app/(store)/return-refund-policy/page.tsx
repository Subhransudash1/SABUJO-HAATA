import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/layout/LegalPageLayout';
import { SITE_CONFIG } from '@/data/site-config';

export const metadata: Metadata = {
  title: 'Return and Refund Policy | Sabuja Haata',
  description: 'Return and refund policies for perishable grocery items at Sabuja Haata.',
};

export default function ReturnRefundPolicyPage() {
  return (
    <LegalPageLayout title="Return and Refund Policy">
      <div className="rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] p-4 text-xs sm:text-sm text-[#173D2A] space-y-1">
        <p className="font-semibold">Store Owner Confirmation Pending:</p>
        <p className="text-[#697269]">
          Return and refund terms are pending final formal confirmation from the store owner. The guidelines below outline our operational procedure for inspecting perishable items upon delivery.
        </p>
      </div>

      <section className="space-y-3 pt-2">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          1. Perishable Item Inspection
        </h2>
        <p>
          Because vegetables, greens, and seasonal fruits are perishable natural products, customers are encouraged to inspect produce upon arrival.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          2. Reporting Quality Issues
        </h2>
        <p>
          If any item is received damaged or wilted, please report the issue to our store desk at <strong>{SITE_CONFIG.storePhone}</strong> or email <strong>{SITE_CONFIG.storeEmail}</strong> with your order details.
        </p>
      </section>
    </LegalPageLayout>
  );
}
