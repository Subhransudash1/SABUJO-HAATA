'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { adminLogin } from '@/lib/admin-data';

export default function AdminLoginPage() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(id.trim(), password)) {
      router.replace('/admin');
    } else {
      setError('Invalid Admin ID or password.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B3D2E] p-4 font-sans">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl" noValidate>
        <div className="mb-5 flex items-center gap-2">
          <Leaf className="h-6 w-6 text-[#2F8F4E]" />
          <div>
            <div className="text-sm font-semibold text-[#0B3D2E]">Sabuja Haata</div>
            <div className="text-xs text-gray-500">Admin sign in</div>
          </div>
        </div>
        <label className="mb-3 block text-xs font-medium text-gray-600">
          Admin ID
          <input value={id} onChange={(e) => { setId(e.target.value); setError(''); }} autoComplete="username"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#2F8F4E] focus:outline-none focus:ring-1 focus:ring-[#2F8F4E]" />
        </label>
        <label className="mb-3 block text-xs font-medium text-gray-600">
          Password
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#2F8F4E] focus:outline-none focus:ring-1 focus:ring-[#2F8F4E]" />
        </label>
        {error && <p role="alert" className="mb-3 text-xs text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded-md bg-[#2F8F4E] py-2 text-sm font-medium text-white hover:bg-[#257a40] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6BBF59] focus-visible:ring-offset-2">
          Sign in
        </button>
        <p className="mt-4 text-[11px] text-gray-400">Development-only client-side check. Replace with server-side authentication before production.</p>
      </form>
    </div>
  );
}
