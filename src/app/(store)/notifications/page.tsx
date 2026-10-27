'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  ArrowLeft, 
  CheckCheck, 
  ChevronRight, 
  Sparkles,
  ShoppingBag,
  Info
} from 'lucide-react';
import { 
  AppNotification, 
  getStoredNotifications, 
  markAsRead, 
  markAllAsRead 
} from '@/lib/notifications';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadNotifications = () => {
    const list = getStoredNotifications();
    setNotifications(list);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener('sabuja_notifications_updated', handleUpdate);
    return () => window.removeEventListener('sabuja_notifications_updated', handleUpdate);
  }, []);

  const handleMarkAllRead = () => {
    markAllAsRead();
    loadNotifications();
  };

  const handleNotificationClick = (item: AppNotification) => {
    markAsRead(item.id);
    loadNotifications();
    if (item.href) {
      router.push(item.href);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F7F8F5] pb-20">
      {/* Header */}
      <div className="bg-[#03472E] text-white px-4 pt-4 pb-8 sm:pt-6 sm:pb-10 rounded-b-2xl sm:rounded-b-3xl shadow-xs">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Link 
              href="/profile" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8BCF45] hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
            </Link>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-[#8BCF45] transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-[#8BCF45] border border-white/15 shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-display font-bold leading-tight">Notifications</h1>
              <p className="text-white/75 text-[11px] sm:text-xs font-medium">
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`
                  : 'All notifications are up to date.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-3.5 sm:px-4 -mt-4 sm:-mt-5 space-y-2.5">
        {isLoaded && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer flex items-start gap-3 shadow-2xs ${
                  item.read
                    ? 'bg-white border-[#E6EAE4] hover:border-[#245C3A]/40'
                    : 'bg-[#F2F8EE] border-[#77A96B]/60'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    item.type === 'order'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.type === 'promo'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.type === 'order' ? (
                    <ShoppingBag className="h-4 w-4" />
                  ) : item.type === 'promo' ? (
                    <Sparkles className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className={`text-xs font-bold truncate ${item.read ? 'text-[#17211B]' : 'text-[#03472E]'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-[#727A73] font-medium shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#525B51] font-medium leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {item.href && (
                  <ChevronRight className="h-3.5 w-3.5 text-[#A5ADA4] shrink-0 self-center" />
                )}
              </div>
            ))}
          </div>
        ) : isLoaded ? (
          <div className="bg-white rounded-2xl border border-[#E6EAE4] p-8 text-center space-y-3.5 shadow-2xs">
            <div className="h-12 w-12 bg-[#F7F8F5] rounded-full flex items-center justify-center mx-auto text-xl">
              🌿
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#17211B]">You&apos;re all caught up</h2>
              <p className="text-xs text-[#697269] max-w-xs mx-auto">
                No new notifications at this time. Check back later for farm updates and seasonal offers.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex h-9 items-center justify-center px-5 rounded-xl bg-[#03472E] text-white text-xs font-bold hover:bg-[#187641] transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center text-xs text-[#727A73]">
            Loading notifications...
          </div>
        )}
      </div>
    </div>
  );
}
