import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h2 className="text-lg font-semibold text-[#0B3D2E]">Admin page not found</h2>
      <p className="text-sm text-gray-500">This admin route doesn’t exist.</p>
      <Link href="/admin" className="rounded-md bg-[#2F8F4E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#257a40]">
        Back to dashboard
      </Link>
    </div>
  );
}
