import React from 'react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8 py-6 sm:py-12 bg-[#FAF8F2]">
      <article className="rounded-2xl border border-[#DDE5D9] bg-white p-5 sm:p-10 shadow-xs text-[#202820]">
        <header className="border-b border-[#EEF4E9] pb-4 sm:pb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#173D2A] leading-tight">
            {title}
          </h1>
          {lastUpdated && (
            <p className="mt-1.5 text-[10px] sm:text-xs text-[#697269] font-semibold uppercase tracking-wider">
              Last Updated: {lastUpdated}
            </p>
          )}
        </header>
        <div className="mt-5 sm:mt-8 space-y-5 sm:space-y-6 text-xs sm:text-base leading-relaxed text-[#202820] font-medium">
          {children}
        </div>
      </article>
      <div className="h-20 sm:hidden" />
    </div>
  );
}
