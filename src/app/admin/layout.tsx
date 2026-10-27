'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Users, Wallet, Truck, Boxes, HeartHandshake, SearchCheck, BarChart3, Receipt,
  Menu, X, ChevronLeft, ChevronRight, LogOut, Leaf,
} from 'lucide-react';
import { adminLogout, ensureDemoData, isAdminLoggedIn } from '@/lib/admin-data';

const NAV = [
  { name: 'Home', href: '/admin', icon: Home },
  { name: 'Details of Customer', href: '/admin/customers', icon: Users },
  { name: 'Finance', href: '/admin/finance', icon: Wallet },
  { name: 'Delivery Management', href: '/admin/delivery', icon: Truck },
  { name: 'Inventory', href: '/admin/inventory', icon: Boxes },
  { name: 'CRM', href: '/admin/crm', icon: HeartHandshake },
  { name: 'Analysis', href: '/admin/analysis', icon: SearchCheck },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/admin/billing', icon: Receipt },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) { setReady(true); return; }
    if (!isAdminLoggedIn()) {
      router.replace('/admin/login');
      return;
    }
    ensureDemoData();
    setReady(true);
  }, [isLogin, router, pathname]);

  useEffect(() => { setDrawer(false); }, [pathname]);

  if (isLogin) return <>{children}</>;

  if (!ready) {
    return <div className="min-h-screen bg-[#FAFAF7]" aria-busy="true" />;
  }

  const current = NAV.find((n) => (n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href)));

  const sidebar = (compact: boolean) => (
    <div className="flex h-full flex-col bg-[#0B3D2E] text-white">
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
        <Leaf className="h-5 w-5 shrink-0 text-[#6BBF59]" />
        {!compact && <span className="text-sm font-semibold tracking-wide">Sabuja Haata <span className="text-[#6BBF59]">Admin</span></span>}
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Admin navigation">
        {NAV.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6BBF59] ${
                active ? 'bg-[#6BBF59]/20 font-medium text-[#B9F0A8]' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!compact && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => { adminLogout(); router.replace('/admin/login'); }}
        className="m-2 flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-white/70 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6BBF59]"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!compact && 'Log out'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-gray-800 font-sans">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 md:block ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebar(collapsed)}
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar(false)}</div>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${collapsed ? 'md:pl-16' : 'md:pl-60'}`}>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur">
          <button className="md:hidden" onClick={() => setDrawer((d) => !d)} aria-label="Toggle menu">
            {drawer ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <button className="hidden md:block text-gray-500 hover:text-gray-800" onClick={() => setCollapsed((c) => !c)} aria-label="Collapse sidebar">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400">Admin / {current?.name ?? 'Page'}</div>
            <h1 className="truncate text-sm font-semibold text-[#0B3D2E]">{current?.name ?? 'Admin'}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">Admin</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B3D2E] text-[11px] font-semibold text-[#B9F0A8]">A</span>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
