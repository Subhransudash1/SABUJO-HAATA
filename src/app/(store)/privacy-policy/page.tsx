import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | Sabuja Haata',
  description: 'How Sabuja Haata handles customer data and respects user privacy.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <div className="rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] p-4 text-xs sm:text-sm text-[#173D2A]">
        <p className="font-semibold">Notice for Review:</p>
        <p className="text-[#697269] mt-0.5">
          This privacy policy accurately reflects the website’s current client-side functionality. Full legal compliance terms remain subject to store owner review upon full backend deployment.
        </p>
      </div>

      <section className="space-y-3 pt-2">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          1. Information Handling
        </h2>
        <p>
          Sabuja Haata collects only the information necessary to prepare and deliver grocery orders, such as recipient name, phone number, and address entered during profile setup or checkout. Customer details entered on the site are stored locally in your browser (localStorage) for user convenience and are not sold or transmitted to third-party ad networks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[#173D2A]">
          2. Local Data Control
        </h2>
        <p>
          You have full control over your stored browser data. You may update or clear your stored profile information and shopping cart items at any time through the website or your browser settings.
        </p>
      </section>
    </LegalPageLayout>
  );
}
