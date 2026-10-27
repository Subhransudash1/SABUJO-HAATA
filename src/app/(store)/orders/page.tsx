'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ChevronRight, 
  ArrowLeft, 
  Search, 
  Calendar, 
  Clock,
  ShoppingBag,
  XCircle,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cancelCustomerOrder } from '@/lib/admin-data';

interface OrderItem {
  id: string;
  date: string;
  status: string;
  amount: string;
  items: number;
  deliveryDate?: string;
  address?: string;
  cancellationReason?: string;
  cancelledAt?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelTarget, setCancelTarget] = useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const loadOrders = () => {
    try {
      const raw = localStorage.getItem('sabuja_user_orders');
      if (raw) {
        setOrders(JSON.parse(raw));
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    loadOrders();
    const handleUpdate = () => loadOrders();
    window.addEventListener('sabuja_orders_updated', handleUpdate);
    return () => window.removeEventListener('sabuja_orders_updated', handleUpdate);
  }, []);

  const isEligibleForCancellation = (status: string) => {
    const s = status.toLowerCase();
    return !s.includes('delivered') && !s.includes('cancel') && !s.includes('could not');
  };

  const handleOpenCancelModal = (order: OrderItem) => {
    setCancelTarget(order);
    setCancelReason('');
    setCancelError('');
  };

  const handleConfirmCancellation = () => {
    if (!cancelTarget) return;
    const trimmed = cancelReason.trim();
    if (!trimmed) {
      setCancelError('Please enter a cancellation reason.');
      return;
    }
    setIsCancelling(true);
    setCancelError('');

    const res = cancelCustomerOrder(cancelTarget.id, trimmed);
    setIsCancelling(false);

    if (res.success) {
      setToastMessage({ text: `Order #${cancelTarget.id} has been cancelled successfully.`, ok: true });
      setCancelTarget(null);
      loadOrders();
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setCancelError(res.error || 'Failed to cancel order.');
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/profile');
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F8F5] pb-20">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#03472E] px-4 py-2.5 text-xs font-bold text-white shadow-lg animate-in fade-in"
        >
          <CheckCircle2 className="h-4 w-4 text-[#8BCF45]" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#03472E] text-white px-4 pt-4 pb-8 sm:pt-6 sm:pb-10 rounded-b-2xl sm:rounded-b-3xl shadow-xs">
        <div className="max-w-xl mx-auto">
          <button 
            type="button"
            onClick={handleBack} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8BCF45] mb-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-[#8BCF45] border border-white/15 shrink-0">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-display font-bold leading-tight">Your Orders</h1>
              <p className="text-white/75 text-[11px] sm:text-xs font-medium">Track and view your farm-fresh deliveries.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-3.5 sm:px-4 -mt-4 sm:-mt-5 space-y-3.5">
        {orders.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A5ADA4]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your orders by order ID or status..."
              className="w-full bg-white border border-[#E6EAE4] rounded-xl h-10 pl-10 pr-4 text-xs sm:text-sm font-medium text-[#17211B] focus:border-[#245C3A] shadow-2xs outline-none transition-all"
            />
          </div>
        )}

        {/* Orders List */}
        {isLoaded && filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const statusLower = order.status.toLowerCase();
              const badgeStyle = statusLower.includes('delivered')
                ? 'bg-green-100 text-green-700'
                : statusLower.includes('cancel')
                ? 'bg-red-100 text-red-700'
                : statusLower.includes('ready')
                ? 'bg-sky-100 text-sky-800'
                : statusLower.includes('confirm')
                ? 'bg-blue-100 text-blue-800'
                : 'bg-emerald-100 text-emerald-800';

              return (
                <div 
                  key={order.id}
                  className="bg-white rounded-xl border border-[#E6EAE4] p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all group"
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-[#697269] uppercase tracking-wider">Order #{order.id}</p>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17211B]">
                        <Calendar className="h-3.5 w-3.5 text-[#03472E]" />
                        {order.date}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeStyle}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2.5 border-y border-dashed border-[#F0F4EF]">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-[#697269] uppercase tracking-wider">Items</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#17211B]">{order.items} {order.items === 1 ? 'item' : 'items'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-[#697269] uppercase tracking-wider">Total Amount</p>
                      <p className="text-xs sm:text-sm font-bold text-[#03472E]">{order.amount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5">
                    {order.deliveryDate ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-[#F7F8F5] flex items-center justify-center shrink-0">
                          <Clock className="h-3 w-3 text-[#03472E]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-[#697269] uppercase">Delivery Slot</p>
                          <p className="text-xs font-semibold text-[#17211B] truncate">{order.deliveryDate}</p>
                        </div>
                      </div>
                    ) : <div />}

                    {isEligibleForCancellation(order.status) && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(order)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-2.5 py-1 transition-colors cursor-pointer shrink-0"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel Order
                      </button>
                    )}
                  </div>

                  {statusLower.includes('cancel') && order.cancellationReason && (
                    <div className="mt-2.5 rounded-lg bg-red-50/80 border border-red-100 p-2.5 text-xs text-red-700">
                      <span className="font-bold">Cancellation Reason:</span> {order.cancellationReason}
                      {order.cancelledAt && (
                        <span className="block text-[10px] text-red-500 mt-0.5">
                          Cancelled on {new Date(order.cancelledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : isLoaded ? (
          <div className="bg-white rounded-2xl border border-[#E6EAE4] p-8 text-center space-y-3.5 shadow-2xs">
            <div className="h-12 w-12 bg-[#F7F8F5] rounded-full flex items-center justify-center mx-auto text-[#C2C9C1]">
              <Package className="h-6 w-6 text-[#A5ADA4]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#17211B]">You haven&apos;t placed any orders yet</h2>
              <p className="text-xs text-[#697269] max-w-xs mx-auto">
                Explore our fresh harvest of farm-fresh fruits, vegetables, and daily staples.
              </p>
            </div>
            <Link 
              href="/shop"
              className="inline-flex h-9 items-center justify-center gap-2 px-5 rounded-xl bg-[#03472E] text-white text-xs font-bold hover:bg-[#187641] transition-all"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center text-xs text-[#727A73]">
            Loading your orders...
          </div>
        )}

        {/* Need Help CTA */}
        <div className="pt-2 text-center">
          <Link 
            href="/contact"
            className="text-xs font-semibold text-[#697269] hover:text-[#03472E] transition-colors"
          >
            Need help with an order? Contact Support
          </Link>
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Cancel Order"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#17211B]">Cancel Order #{cancelTarget.id}</h3>
                <p className="text-xs text-[#697269] mt-0.5">
                  Are you sure you want to cancel this order?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#17211B]">
                Reason for cancellation <span className="text-red-500">* (mandatory)</span>
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (cancelError) setCancelError('');
                }}
                placeholder="Please enter a mandatory reason for cancellation (e.g. ordered by mistake, delivery time conflict)..."
                className="w-full rounded-xl border border-[#E6EAE4] p-3 text-xs sm:text-sm text-[#17211B] focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
              {cancelError && (
                <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {cancelError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#F0F4EF]">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="rounded-xl border border-[#E6EAE4] bg-white px-4 py-2 text-xs font-bold text-[#697269] hover:bg-[#F7F8F5] transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={!cancelReason.trim() || isCancelling}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                {isCancelling ? 'Cancelling…' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
