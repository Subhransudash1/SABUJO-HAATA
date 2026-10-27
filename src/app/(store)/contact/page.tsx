import { Suspense } from 'react';
import { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { SITE_CONFIG } from '@/data/site-config';
import { ContactPreviewForm } from '@/components/contact/ContactPreviewForm';

export const metadata: Metadata = {
  title: 'Contact Us | Sabuja Haata',
  description: 'Get in touch with Sabuja Haata for produce enquiries, wholesale orders, and local deliveries.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 space-y-5 sm:space-y-6">
      <header className="border-b border-[#DDE5D9] pb-4 sm:pb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#173D2A]">
          Contact Sabuja Haata
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#697269]">
          Have a question about our catalogue rates or fresh arrivals? Reach out to our store team.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-12">
        {/* Contact Information Cards */}
        <div className="md:col-span-5 space-y-4 sm:space-y-5">
          <div className="rounded-2xl border border-[#DDE5D9] bg-[#FAF8F2] p-5 sm:p-6 shadow-sm space-y-4 text-xs sm:text-sm text-[#202820]">
            <h2 className="font-display text-base sm:text-lg font-semibold text-[#173D2A]">
              Store Information
            </h2>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#245C3A] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-[#202820]">Address</p>
                <p className="text-[#697269] mt-0.5">{SITE_CONFIG.storeAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-[#245C3A] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-[#202820]">Customer Helpdesk</p>
                <p className="text-[#697269] mt-0.5">{SITE_CONFIG.storePhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-[#245C3A] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-[#202820]">Email Enquiries</p>
                <p className="text-[#697269] mt-0.5">{SITE_CONFIG.storeEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-[#245C3A] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-[#202820]">Market Timings</p>
                <p className="text-[#697269] mt-0.5">{SITE_CONFIG.operatingHours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="rounded-2xl border border-[#DDE5D9] bg-[#FAF8F2] p-5 sm:p-8 shadow-sm text-[#202820]">
            <h2 className="font-display text-base sm:text-lg font-semibold text-[#173D2A] mb-1">
              Send an Enquiry
            </h2>
            <p className="text-xs text-[#697269] mb-5">
              Leave your contact details and message below.
            </p>
            <Suspense fallback={<div className="h-48 animate-pulse bg-[#EEF4E9]/40 rounded-xl" />}>
              <ContactPreviewForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
