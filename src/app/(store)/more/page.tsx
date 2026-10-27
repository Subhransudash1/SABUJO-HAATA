'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Info, 
  HelpCircle, 
  Phone, 
  ShieldCheck, 
  FileText, 
  Truck, 
  RefreshCcw, 
  Cookie,
  ShoppingCart,
  User,
  Package,
  Heart,
  CreditCard
} from 'lucide-react';
import { useLanguage } from '@/components/providers/StoreProviders';

export default function MorePage() {
  const { t } = useLanguage();

  const menuGroups = [
    {
      title: 'Support & Information',
      items: [
        { name: 'How Shopping Works', href: '/how-shopping-works', icon: ShoppingCart, color: 'text-blue-500' },
        { name: 'About Sabuja Haata', href: '/about', icon: Info, color: 'text-green-600' },
        { name: 'Frequently Asked Questions', href: '/faq', icon: HelpCircle, color: 'text-purple-500' },
        { name: 'Contact Us', href: '/contact', icon: Phone, color: 'text-orange-500' },
      ]
    },
    {
      title: 'Policies',
      items: [
        { name: 'Delivery Policy', href: '/delivery-policy', icon: Truck, color: 'text-blue-600' },
        { name: 'Return & Refund Policy', href: '/return-refund-policy', icon: RefreshCcw, color: 'text-red-500' },
        { name: 'Privacy Policy', href: '/privacy-policy', icon: ShieldCheck, color: 'text-green-500' },
        { name: 'Terms & Conditions', href: '/terms-and-conditions', icon: FileText, color: 'text-gray-600' },
        { name: 'Cookie Policy', href: '/cookie-policy', icon: Cookie, color: 'text-amber-600' },
      ]
    },
    {
      title: 'Your Account',
      items: [
        { name: 'Your Profile', href: '/profile', icon: User, color: 'text-indigo-500' },
        { name: 'Your Orders', href: '/orders', icon: Package, color: 'text-rose-500' },
        { name: 'My Wishlist', href: '/wishlist', icon: Heart, color: 'text-red-500' },
        { name: 'Payments', href: '/payments', icon: CreditCard, color: 'text-blue-500' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F5] pb-20">
      {/* Header */}
      <div className="bg-[#03472E] text-white px-4 py-5 sm:py-6 rounded-b-2xl sm:rounded-b-3xl shadow-xs">
        <h1 className="text-lg sm:text-xl font-display font-bold text-center">More Information</h1>
        <p className="text-center text-[#8BCF45] text-xs mt-0.5 font-medium">Everything you need to know about us</p>
      </div>

      <div className="max-w-xl mx-auto px-3.5 sm:px-4 mt-4 sm:mt-5 space-y-4 sm:space-y-5">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            <h2 className="text-[10px] font-bold text-[#697269] uppercase tracking-wider px-1">
              {group.title}
            </h2>
            <div className="bg-white rounded-xl border border-[#E6EAE4] overflow-hidden shadow-2xs">
              {group.items.map((item, iIdx) => (
                <Link 
                  key={iIdx}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 sm:py-3 hover:bg-[#F7F8F5] transition-colors ${
                    iIdx !== group.items.length - 1 ? 'border-b border-[#F0F4EF]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-lg bg-[#F7F8F5] flex items-center justify-center ${item.color} shrink-0`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[#17211B]">{item.name}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#C2C9C1]" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Brand Footer in More Page */}
        <div className="pt-4 pb-2 text-center">
          <p className="text-[10px] font-bold text-[#697269] uppercase tracking-[0.18em]">
            Sabuja Haata &copy; 2026
          </p>
          <p className="text-[10px] text-[#A5ADA4] mt-0.5 italic">
            Fresh. Organic. Direct from Farms.
          </p>
        </div>
      </div>
    </div>
  );
}
