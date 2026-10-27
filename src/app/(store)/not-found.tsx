import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="rounded-2xl border border-[#E5E8DF] bg-white p-8 sm:p-12 shadow-sm space-y-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF4E9] text-[#245C3A] font-bold text-lg">
          404
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#173D2A]">
          Produce Item or Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#697269] leading-relaxed">
          The produce item or page you are looking for is not in our 54-item catalogue or has moved.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#245C3A] px-5 text-xs font-semibold text-white hover:bg-[#173D2A]"
          >
            Browse Full Catalogue
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E5E8DF] bg-white px-5 text-xs font-semibold text-[#202820] hover:bg-[#FAF8F2]"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
