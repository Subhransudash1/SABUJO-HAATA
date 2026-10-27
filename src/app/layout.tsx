import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter, Lora, Noto_Sans_Oriya, Gloock, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Brand-name display serif (Gloock: modern, distinctive, elegant display serif)
const brandFont = Gloock({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-brand',
  display: 'swap',
});

// Brand subtitle / tagline sans face (Plus Jakarta Sans: refined, modern geometric clarity at micro sizes)
const brandSansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-brand-sans',
  display: 'swap',
});

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const displayFont = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const oriyaFont = Noto_Sans_Oriya({
  subsets: ['oriya'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oriya',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sabuja Haata (ସବୁଜ ହାଟ) — Fresh Vegetables, Greens & Fruits',
  description:
    'Local Indian grocery store in Odisha delivering fresh vegetables, leafy greens, and seasonal fruits at transparent market rates.',
  openGraph: {
    title: 'Sabuja Haata (ସବୁଜ ହାଟ)',
    description:
      'Fresh picks for everyday living. Explore our fresh produce catalogue.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${displayFont.variable} ${oriyaFont.variable} ${brandFont.variable} ${brandSansFont.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-[#FAF8F2] text-[#173D2A] antialiased selection:bg-[#77A96B]/20 selection:text-[#173D2A]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[200] focus:rounded-xl focus:bg-[#173D2A] focus:px-4 focus:py-2 focus:text-white focus:ring-2 focus:ring-[#77A96B]"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
