import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy | Sabuja Haata',
  description: 'How Sabuja Haata uses client-side storage for essential store functionality.',
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy">
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          1. Use of Browser Storage
        </h2>
        <p>
          Sabuja Haata uses modern HTML5 client-side storage (localStorage) and essential cookies to provide core shopping functionality. We do not use advertising tracking pixels or third-party tracking networks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          2. Essential Functional Keys
        </h2>
        <p>Our website utilizes essential browser keys to operate:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-[#697269]">
          <li><strong>shopbujo_hatto_cart_v1:</strong> Remembers your selected produce items and quantities across reloads.</li>
          <li><strong>shopbujo_hatto_lang_v1:</strong> Stores your interface language preference (English / Odia).</li>
          <li><strong>sabuja_user_profile:</strong> Stores your name, phone number, and address entered in your profile for convenience.</li>
          <li><strong>sabuja_cookie_consent:</strong> Stores your cookie consent preference choice.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          3. Managing Storage Choices
        </h2>
        <p>
          You can clear stored browser keys anytime using the &quot;Clear Cart&quot; option in your basket or by clearing site storage in your browser settings.
        </p>
      </section>
    </LegalPageLayout>
  );
}
