import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/layout/LegalPageLayout';
import { SITE_CONFIG } from '@/data/site-config';

export const metadata: Metadata = {
  title: 'Delivery Policy | Sabuja Haata',
  description: 'Delivery timelines, delivery windows, and fresh produce packing procedures at Sabuja Haata.',
};

export default function DeliveryPolicyPage() {
  return (
    <LegalPageLayout title="Delivery Policy">
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          1. Delivery Timelines (1–2 Days)
        </h2>
        <p>
          Standard delivery generally takes <strong>1–2 days</strong>. We aim to fulfill and deliver orders within one day whenever possible, while allowing up to two days to ensure careful sourcing, sorting, and packaging of fresh local produce.
        </p>
        <p className="text-xs text-[#697269] bg-[#FAF8F2] p-3 rounded-lg border border-[#DDE5D9]">
          Note: Guaranteed same-day or exact next-day delivery is not promised, as timelines depend on daily harvest availability and delivery routes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          2. Delivery Slots & Operations
        </h2>
        <p>
          To maintain the freshness of leafy greens and delicate fruits, deliveries are scheduled across local operational time slots:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-[#697269]">
          <li><strong>Morning Slot:</strong> 7:00 AM – 10:30 AM</li>
          <li><strong>Midday Slot:</strong> 11:00 AM – 2:00 PM</li>
          <li><strong>Evening Slot:</strong> 4:30 PM – 8:00 PM</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          3. Fresh Packaging & Handling
        </h2>
        <p>
          Produce is hand-inspected prior to delivery dispatch. Fragile produce like leafy spinach, coriander, and ripe tomatoes are packaged separately from heavy root tubers to prevent bruising or damage in transit.
        </p>
      </section>
    </LegalPageLayout>
  );
}
