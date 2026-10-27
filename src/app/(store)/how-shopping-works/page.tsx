'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Package, Truck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/components/providers/StoreProviders';

export default function HowShoppingWorksPage() {
  const { t } = useLanguage();

  const steps = [
    {
      id: 1,
      title: t.step1Title || 'Browse & Select',
      description: 'Explore our wide range of fresh, organic produce direct from local farms. Add your favorites to the cart.',
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 2,
      title: t.step2Title || 'Place Your Order',
      description: 'Review your items and proceed to checkout. Provide your delivery details and confirm your order.',
      icon: Package,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 3,
      title: t.step3Title || 'Farm-Fresh Delivery',
      description: 'We harvest fresh and deliver directly to your doorstep, ensuring maximum nutrition and taste.',
      icon: Truck,
      color: 'bg-green-50 text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F5] pb-20">
      {/* Header */}
      <div className="bg-[#03472E] text-white px-4 pt-5 pb-10 rounded-b-2xl sm:rounded-b-3xl shadow-xs relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <Link href="/more" className="inline-flex items-center gap-1 text-xs font-semibold text-[#8BCF45] mb-3 hover:opacity-80">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to More
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-bold leading-tight">How Shopping Works at <span className="text-[#8BCF45]">Sabuja Haata</span></h1>
          <p className="text-[#EAF6E7] text-xs sm:text-sm mt-1.5 font-medium max-w-md">Our farm-to-table process ensures you get the freshest organic produce every time.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3.5 sm:px-4 -mt-5 space-y-4 sm:space-y-5 relative z-20">
        {/* Steps Card */}
        <div className="bg-white rounded-2xl border border-[#E6EAE4] p-5 sm:p-8 shadow-xs space-y-7">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
              {idx !== steps.length - 1 && (
                <div className="absolute left-5 top-12 bottom-[-28px] w-px border-l border-dashed border-[#DDE5D9] hidden sm:block"></div>
              )}
              
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${step.color} flex items-center justify-center relative z-10`}>
                <step.icon className="h-5 w-5" />
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#03472E] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  {step.id}
                </div>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-display font-bold text-[#173D2A]">{step.title}</h2>
                <p className="text-[#697269] text-xs sm:text-sm leading-relaxed">{step.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#187641] bg-[#EAF6E7] px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> 100% Organic
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#173D2A] bg-gray-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Local Sourced
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ CTA */}
        <div className="bg-[#EAF6E7] rounded-2xl p-4 sm:p-5 border border-[#DDE5D9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-bold text-[#173D2A]">Still have questions?</h3>
            <p className="text-xs text-[#697269]">Check our detailed FAQ for more information.</p>
          </div>
          <Link 
            href="/faq"
            className="bg-[#173D2A] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#245C3A] transition-all"
          >
            Go to FAQs
          </Link>
        </div>

        <div className="pt-1 text-center">
          <Link 
            href="/shop"
            className="inline-flex items-center justify-center h-11 w-full rounded-xl bg-[#03472E] text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-[#187641] transition-all"
          >
            Start Shopping Now
          </Link>
        </div>
      </div>
    </div>
  );
}
