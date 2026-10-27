'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MoreHorizontal, ClipboardList } from 'lucide-react';

function CategoriesGridIcon() {
  return (
    <div className="grid grid-cols-2 gap-0.5">
      <div className="w-1.5 h-1.5 rounded-sm border-2 border-current" />
      <div className="w-1.5 h-1.5 rounded-sm border-2 border-current" />
      <div className="w-1.5 h-1.5 rounded-sm border-2 border-current" />
      <div className="w-1.5 h-1.5 rounded-sm border-2 border-current" />
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    const syncSearchMode = () => {
      if (window.location.pathname !== '/shop') {
        setIsSearchActive(false);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      setIsSearchActive(
        params.get('focusSearch') === 'true' ||
        params.get('search') === 'true'
      );
    };

    syncSearchMode();
    window.addEventListener('popstate', syncSearchMode);
    window.addEventListener('sabuja_open_search', syncSearchMode);
    return () => {
      window.removeEventListener('popstate', syncSearchMode);
      window.removeEventListener('sabuja_open_search', syncSearchMode);
    };
  }, [pathname]);

  const navItems = [
    { name: 'Home', href: '/', icon: Home, active: pathname === '/' && !isSearchActive },
    {
      name: 'Categories',
      href: '/shop',
      icon: CategoriesGridIcon,
      active: (pathname === '/shop' && !isSearchActive) || Boolean(pathname?.startsWith('/category/')),
    },
    { name: 'Search', href: '/shop?focusSearch=true', icon: Search, active: pathname === '/shop' && isSearchActive },
    {
      name: 'Orders',
      href: '/orders',
      icon: ClipboardList,
      active: pathname === '/orders',
    },
    { name: 'More', href: '/more', icon: MoreHorizontal, active: pathname === '/more' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[100] bg-white/95 backdrop-blur-md border-t border-[#DDE5D9] md:hidden px-6 pb-safe-bottom h-auto shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.active;
          const IconComponent = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (item.name === 'Search') {
                  setIsSearchActive(true);
                  setTimeout(() => window.dispatchEvent(new Event('sabuja_open_search')), 20);
                } else if (item.name === 'Categories') {
                  setIsSearchActive(false);
                }
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-4 gap-1 transition-all duration-300 ${
                isActive ? 'text-[#173D2A]' : 'text-[#697269]'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                {item.name === 'Categories' ? (
                  <CategoriesGridIcon />
                ) : (
                  <IconComponent className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                )}
              </div>
              <span className={`text-[10px] font-black tracking-tight transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.name}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#173D2A]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
