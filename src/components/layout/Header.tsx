'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Mic, X, Bell, MapPin, ChevronDown } from 'lucide-react';
import {
  useCart,
} from '@/components/providers/StoreProviders';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { AddressModal } from './AddressModal';
import {
  DeliveryAddress,
  readDeliveryAddress,
  readProfilePhone,
  readProfileName,
  saveDeliveryAddress,
  formatHeaderLabel,
} from '@/lib/delivery-address';
import { getAllProducts } from '@/lib/product-utils';
import { Product } from '@/types/product';
import { getStoredNotifications } from '@/lib/notifications';

/**
 * Centralized route-aware visibility rule for the floating Cart button.
 * Visible on shopping/discovery routes; hidden on Profile, Notifications, Cart,
 * Checkout, Order Confirmation, Orders, Payments, and informational pages.
 */
function shouldShowFloatingCart(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === '/' ||
    pathname === '/shop' ||
    pathname.startsWith('/category/') ||
    pathname.startsWith('/product/')
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { summary, isHydrated } = useCart();

  const isHomePage = pathname === '/';
  const isCartPage = pathname === '/cart' || Boolean(pathname?.startsWith('/cart/'));

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [address, setAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [profilePhone, setProfilePhone] = useState('');
  const [profileName, setProfileName] = useState('');
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Voice Search states
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // All catalog products cached
  const allProducts = useMemo(() => getAllProducts(), []);

  // Filter and rank matching products for dropdown
  const matchingProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];

    const matches = allProducts.filter((p) => {
      return (
        p.nameEn.toLowerCase().includes(q) ||
        p.nameOr.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategoryLabelEn.toLowerCase().includes(q) ||
        p.subCategoryLabelOr.toLowerCase().includes(q) ||
        p.descriptionEn.toLowerCase().includes(q)
      );
    });

    // Rank prefix matches higher
    matches.sort((a, b) => {
      const aStarts = a.nameEn.toLowerCase().startsWith(q);
      const bStarts = b.nameEn.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aWord = a.nameEn.toLowerCase().split(' ').some((w) => w.startsWith(q));
      const bWord = b.nameEn.toLowerCase().split(' ').some((w) => w.startsWith(q));
      if (aWord && !bWord) return -1;
      if (!aWord && bWord) return 1;

      return 0;
    });

    return matches;
  }, [allProducts, searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  // Load saved address and notifications on mount
  useEffect(() => {
    refreshAddressState();

    const checkNotifs = () => {
      const list = getStoredNotifications();
      setUnreadNotifs(list.filter((n) => !n.read).length);
    };

    checkNotifs();
    window.addEventListener('sabuja_notifications_updated', checkNotifs);
    return () => window.removeEventListener('sabuja_notifications_updated', checkNotifs);
  }, []);

  // Re-read stored profile/address (it may have been edited on the Profile page)
  function refreshAddressState() {
    try {
      const saved = localStorage.getItem('sabuja_user_profile');
      const parsed = saved ? JSON.parse(saved) : {};
      setAddress(typeof parsed.address === 'string' ? parsed.address : '');
    } catch {
      setAddress('');
    }
    setDeliveryAddress(readDeliveryAddress());
    setProfilePhone(readProfilePhone());
    setProfileName(readProfileName());
  }

  const openAddressModal = () => {
    refreshAddressState();
    setIsAddressModalOpen(true);
  };

  const handleAddressSave = (newAddress: DeliveryAddress): boolean => {
    const ok = saveDeliveryAddress(newAddress);
    if (ok) refreshAddressState();
    return ok;
  };

  const locationLabel = deliveryAddress ? formatHeaderLabel(deliveryAddress) : address;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsDropdownOpen(false);
    const trimmed = searchTerm.trim();
    if (trimmed) {
      router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/shop');
    }
  };

  const handleSelectProduct = (product: Product) => {
    setIsDropdownOpen(false);
    router.push(`/product/${product.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || matchingProducts.length === 0) {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
      return;
    }

    const maxItems = Math.min(matchingProducts.length, 7);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < maxItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxItems - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < maxItems) {
        e.preventDefault();
        handleSelectProduct(matchingProducts[selectedIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Voice search via Web Speech API
  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceFeedback('Voice search is not supported in this browser.');
      setTimeout(() => setVoiceFeedback(null), 3500);
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop error
      }
      setIsListening(false);
      setVoiceFeedback(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback('Listening... Speak now');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          const cleaned = transcript.trim();
          setSearchTerm(cleaned);
          setIsDropdownOpen(true);
          setVoiceFeedback(null);
          searchInputRef.current?.focus();
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setVoiceFeedback('Microphone permission denied. Please allow access.');
        } else if (event.error === 'no-speech') {
          setVoiceFeedback('No speech detected. Please try again.');
        } else {
          setVoiceFeedback('Could not recognize voice. Please try again.');
        }
        setIsListening(false);
        setTimeout(() => setVoiceFeedback(null), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => {
          setVoiceFeedback((prev) => (prev === 'Listening... Speak now' ? null : prev));
        }, 1000);
      };

      recognition.start();
    } catch (err) {
      setVoiceFeedback('Voice search could not start. Please try again.');
      setIsListening(false);
      setTimeout(() => setVoiceFeedback(null), 3500);
    }
  };

  const cartCount = isHydrated ? summary.itemCount : 0;
  const isCartVisibleFloating = isHydrated && cartCount > 0 && shouldShowFloatingCart(pathname);

  return (
    <div className="w-full">
      <header className="sticky top-0 z-50 bg-[#03472E] text-white shadow-sm px-3 sm:px-6 py-2 sm:py-3 space-y-1.5 sm:space-y-2.5">
        {/* Row 1: Logo & Actions */}
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandLogo compact={true} />
          
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link 
              href="/profile" 
              aria-label="Profile" 
              className="relative p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>

            <Link 
              href="/notifications" 
              aria-label="Notifications" 
              className="relative p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              {unreadNotifs > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#E85B28] text-[7px] sm:text-[8px] font-bold text-white ring-1 ring-[#03472E]">
                  {unreadNotifs}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:top-0.5 sm:right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#8BCF45] text-[7px] sm:text-[8px] font-bold text-[#03472E]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Row 2: Delivery Address Bar (hidden on Cart page) */}
        {!isCartPage && (
          <div className="mx-auto max-w-7xl">
            <button 
              type="button"
              onClick={openAddressModal}
              aria-label={`Change delivery location. Currently ${locationLabel || 'Patia, Bhubaneswar - 751024'}`}
              className="group inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 py-0.5 pl-1 pr-2.5 text-left transition-colors hover:bg-white/15 hover:border-[#8BCF45]/50 active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BCF45]"
            >
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-[#8BCF45]/20 text-[#8BCF45]">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <span className="flex min-w-0 items-baseline gap-1.5 text-[10px] sm:text-xs leading-none">
                <span className="shrink-0 font-medium text-white/65">Deliver to</span>
                <span className="truncate font-bold text-white">{locationLabel || 'Patia, Bhubaneswar - 751024'}</span>
              </span>
              <ChevronDown className="h-3 w-3 shrink-0 text-white/60 transition-transform group-hover:text-[#8BCF45]" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Row 3: Search Bar with Autocomplete Dropdown and Voice Search (Homepage Only) */}
        {isHomePage && (
        <div className="mx-auto max-w-7xl" ref={searchContainerRef}>
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727A73]">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <input
                ref={searchInputRef}
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(e.target.value.trim().length > 0);
                  setSelectedIndex(-1);
                }}
                onFocus={() => {
                  if (searchTerm.trim().length > 0) {
                    setIsDropdownOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search for vegetables, fruits, etc..."
                className="w-full h-9 sm:h-11 rounded-xl sm:rounded-2xl border-none bg-white pl-10 pr-20 text-sm font-medium text-[#17211B] placeholder:text-[#727A73] focus:ring-2 focus:ring-[#8BCF45] transition-all shadow-sm"
              />
              
              {/* Action buttons inside input: Clear & Mic */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setIsDropdownOpen(false);
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="p-1 text-[#727A73] hover:text-[#17211B] hover:bg-[#F7F8F5] rounded-full transition-colors"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  aria-label={isListening ? 'Stop voice recognition' : 'Search by voice'}
                  title={isListening ? 'Stop listening' : 'Search by voice'}
                  className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-300'
                      : 'text-[#17211B] hover:text-[#03472E] hover:bg-[#F7F8F5]'
                  }`}
                >
                  <Mic className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>
              </div>
            </form>

            {/* Voice Feedback Toast / Tooltip */}
            {voiceFeedback && (
              <div className="absolute right-0 top-full mt-2 z-50 rounded-xl bg-[#03472E] text-white px-3.5 py-2 text-xs font-semibold shadow-xl border border-[#8BCF45]/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                {isListening ? (
                  <span className="flex h-2 w-2 rounded-full bg-red-400 animate-ping" />
                ) : (
                  <span className="text-[#8BCF45]">🌿</span>
                )}
                <span>{voiceFeedback}</span>
              </div>
            )}

            {/* Live Autocomplete Dropdown */}
            {isDropdownOpen && searchTerm.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white border border-[#E6EAE4] shadow-2xl overflow-hidden text-[#17211B] animate-in fade-in slide-in-from-top-1 duration-150">
                {matchingProducts.length > 0 ? (
                  <>
                    <div className="px-3.5 py-2 bg-[#F7F8F5] border-b border-[#E6EAE4] flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-bold text-[#697269] uppercase tracking-wider">
                        Matching Products ({matchingProducts.length})
                      </span>
                      <span className="text-[10px] text-[#8A9289] hidden xs:inline">
                        Press ↑↓ to navigate, ↵ to select
                      </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#F0F2EE]">
                      {matchingProducts.slice(0, 7).map((prod, idx) => (
                        <div
                          key={prod.id}
                          onClick={() => handleSelectProduct(prod)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 transition-colors cursor-pointer ${
                            selectedIndex === idx ? 'bg-[#EAF6E7]' : 'hover:bg-[#F7F8F5]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white border border-[#E6EAE4] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                              <img
                                src={prod.image}
                                alt={prod.nameEn}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-black text-[#17211B] truncate">
                                {prod.nameEn}
                              </p>
                              <p className="text-[10px] sm:text-xs text-[#697269] font-medium truncate">
                                {prod.nameOr} • <span className="capitalize">{prod.subCategoryLabelEn || prod.category}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-black text-[#03472E]">
                              ₹{prod.price}
                            </span>
                            <span className="text-[10px] text-[#697269] font-medium block">
                              /{prod.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 bg-[#FAF8F2] border-t border-[#E6EAE4] text-center">
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="text-xs font-black text-[#03472E] hover:text-[#187641] transition-colors py-1 px-3"
                      >
                        See all results for &ldquo;{searchTerm.trim()}&rdquo; →
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF8F2] text-xl">
                      🔍
                    </div>
                    <p className="text-sm font-black text-[#17211B]">
                      No products found. Try another search.
                    </p>
                    <p className="text-xs text-[#697269] max-w-xs mx-auto">
                      We couldn&apos;t find anything matching &ldquo;{searchTerm}&rdquo;. Try searching for &ldquo;Potato&rdquo;, &ldquo;Tomato&rdquo;, &ldquo;Banana&rdquo;, or &ldquo;Greens&rdquo;.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Address Modal */}
        <AddressModal 
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          savedAddress={deliveryAddress}
          legacyAddress={address}
          profilePhone={profilePhone}
          profileName={profileName}
          onSave={handleAddressSave}
        />
      </header>
      {/* Route-Aware Floating Cart Button */}
      {isCartVisibleFloating && (
        <Link
          href="/cart"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 rounded-full bg-[#173D2A] border-2 border-[#77A96B] px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-[#FAF8F2] shadow-xl hover:bg-[#245C3A] active:scale-95 transition-all cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Cart</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#77A96B] text-[10px] font-bold text-[#173D2A]">
            {cartCount}
          </span>
        </Link>
      )}
    </div>
  );
}
