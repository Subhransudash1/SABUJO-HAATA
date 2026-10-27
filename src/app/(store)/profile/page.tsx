'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MapPin, 
  Phone, 
  Save, 
  Check, 
  ChevronRight, 
  Package, 
  Heart, 
  Bell, 
  LogOut,
  ArrowLeft, 
  Settings, 
  HelpCircle, 
  ShieldCheck, 
  CreditCard, 
  MessageCircle 
} from 'lucide-react';
import { getStoredNotifications } from '@/lib/notifications';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Load saved user profile and notifications on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sabuja_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.address) setAddress(parsed.address);
      }
    } catch {
      // Ignore localStorage read errors
    }

    const checkNotifs = () => {
      const list = getStoredNotifications();
      const unread = list.filter((n) => !n.read).length;
      setUnreadNotifs(unread);
    };

    checkNotifs();
    window.addEventListener('sabuja_notifications_updated', checkNotifs);
    return () => window.removeEventListener('sabuja_notifications_updated', checkNotifs);
  }, []);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() && !phone.trim()) {
      setError('Name and phone are required.');
      return;
    }

    try {
      localStorage.setItem(
        'sabuja_user_profile',
        JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        })
      );
      setSavedSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setError('Failed to save profile. Please try again.');
    }
  };

  const activityItems = [
    { name: 'My Orders', href: '/orders', icon: Package, color: 'bg-orange-50 text-orange-600' },
    { name: 'My Wishlist', href: '/wishlist', icon: Heart, color: 'bg-red-50 text-red-600' },
    { name: 'Payments', href: '/payments', icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
    { 
      name: 'Notifications', 
      href: '/notifications', 
      icon: Bell, 
      color: 'bg-yellow-50 text-yellow-600', 
      badge: unreadNotifs > 0 ? unreadNotifs : undefined 
    },
  ];

  const supportItems = [
    { name: 'Help Center & FAQs', href: '/faq', icon: HelpCircle, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Customer Support', href: '/contact', icon: MessageCircle, color: 'bg-cyan-50 text-cyan-600' },
    { name: 'Privacy Policy', href: '/privacy-policy', icon: ShieldCheck, color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Delivery Policy', href: '/delivery-policy', icon: Settings, color: 'bg-slate-50 text-slate-600' },
  ];

  const getInitials = (n: string) => {
    if (!n) return 'SH';
    return n.split(' ').map(i => i[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] pb-20">
      {/* Compact Header */}
      <div className="relative bg-[#03472E] text-white overflow-hidden pt-2.5 pb-3.5 sm:pt-3.5 sm:pb-4 rounded-b-2xl shadow-xs">
        <div className="max-w-xl mx-auto px-3.5 sm:px-6 relative z-10">
          <div className="flex items-center justify-between mb-2 sm:mb-2.5">
            <Link 
              href="/" 
              className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center bg-white/10 rounded-full border border-white/15 hover:bg-white/20 transition-all"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-white" />
            </Link>
            <h1 className="text-xs sm:text-sm font-bold text-white/95">My Profile</h1>
            <button 
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-semibold text-[#8BCF45] hover:opacity-80 transition-opacity cursor-pointer"
            >
              {isEditing ? 'Cancel' : 'Edit Info'}
            </button>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div 
              className="relative h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center bg-white/95 text-[#03472E] text-xs sm:text-sm font-black rounded-xl shadow-xs border border-white/20 shrink-0"
            >
              {getInitials(name)}
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-[#8BCF45] border border-[#03472E] rounded-full"></div>
            </div>
            
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-bold tracking-tight leading-tight truncate">
                {name || 'Welcome!'}
              </h2>
              <p className="text-white/75 text-[11px] sm:text-xs font-medium flex items-center gap-1.5 truncate mt-0.5">
                <Phone className="h-3 w-3 shrink-0 opacity-80" /> {phone || 'Setup your profile'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-3.5 sm:px-4 mt-3.5 sm:mt-4 space-y-3.5 sm:space-y-4 relative z-20">
        {/* Form / Success Notification */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white rounded-2xl border border-[#E6EAE4] p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <h3 className="text-[11px] font-bold text-[#03472E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5" /> Personal Details
              </h3>
              <form onSubmit={saveProfile} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#697269] uppercase ml-0.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A5ADA4]" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-[#F7F8F5] border border-[#E6EAE4] rounded-xl h-9 sm:h-10 pl-9 pr-3 text-xs sm:text-sm font-medium text-[#17211B] focus:bg-white focus:border-[#245C3A] transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#697269] uppercase ml-0.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A5ADA4]" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-[#F7F8F5] border border-[#E6EAE4] rounded-xl h-9 sm:h-10 pl-9 pr-3 text-xs sm:text-sm font-medium text-[#17211B] focus:bg-white focus:border-[#245C3A] transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#697269] uppercase ml-0.5">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A5ADA4]" />
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, Odisha"
                      className="w-full bg-[#F7F8F5] border border-[#E6EAE4] rounded-xl h-9 sm:h-10 pl-9 pr-3 text-xs sm:text-sm font-medium text-[#17211B] focus:bg-white focus:border-[#245C3A] transition-all outline-none"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 font-semibold ml-0.5">{error}</p>}

                <button 
                  type="submit"
                  className="w-full bg-[#03472E] text-white h-10 rounded-xl font-bold text-xs sm:text-sm shadow-xs hover:bg-[#187641] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" /> Save Changes
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {savedSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#EEF4E9] border border-[#DDE5D9] p-2.5 rounded-xl flex items-center gap-2.5 text-[#03472E]"
          >
            <div className="h-5 w-5 bg-[#245C3A] rounded-full flex items-center justify-center text-white shrink-0">
              <Check className="h-3 w-3" />
            </div>
            <div>
              <p className="text-xs font-bold">Profile Updated!</p>
              <p className="text-[10px] text-[#245C3A] font-medium">Your changes have been saved.</p>
            </div>
          </motion.div>
        )}

        {/* My Activity Section */}
        <section className="space-y-1.5">
          <h3 className="text-[10px] font-bold text-[#697269] uppercase tracking-wider ml-1">My Activity</h3>
          <div className="bg-white rounded-xl border border-[#E6EAE4] overflow-hidden shadow-2xs">
            {activityItems.map((item, idx) => (
              <Link 
                key={idx}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 sm:py-3 hover:bg-[#F7F8F5] transition-colors group ${
                  idx !== activityItems.length - 1 ? 'border-b border-[#F0F4EF]' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.color} shrink-0`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#17211B]">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="bg-[#E85B28] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="h-3.5 w-3.5 text-[#C2C9C1] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Support Section */}
        <section className="space-y-1.5">
          <h3 className="text-[10px] font-bold text-[#697269] uppercase tracking-wider ml-1">Support & Policies</h3>
          <div className="bg-white rounded-xl border border-[#E6EAE4] overflow-hidden shadow-2xs">
            {supportItems.map((item, idx) => (
              <Link 
                key={idx}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 sm:py-3 hover:bg-[#F7F8F5] transition-colors group ${
                  idx !== supportItems.length - 1 ? 'border-b border-[#F0F4EF]' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.color} shrink-0`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#17211B]">{item.name}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[#C2C9C1] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </section>

        {/* Logout / Reset */}
        <button 
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to log out and clear saved session details?')) {
              localStorage.removeItem('sabuja_user_profile');
              setName('');
              setPhone('');
              setAddress('');
            }
          }}
          className="w-full bg-white border border-red-100 text-red-500 h-10 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-all shadow-2xs cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" /> Logout Session
        </button>

        <p className="text-center text-[9px] sm:text-[10px] font-semibold text-[#A5ADA4] uppercase tracking-widest pt-1">
          Sabuja Haata • Fresh Organic Produce Odisha
        </p>
      </div>
    </div>
  );
}
