'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Info, CheckCircle2, Tag, Truck, Banknote, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPaiseINR } from '@/lib/currency';
import { validateCheckoutForm, CheckoutFormData, CheckoutFormErrors } from '@/lib/validation';
import { useCart, useLanguage } from '@/components/providers/StoreProviders';
import { addNotification } from '@/lib/notifications';
import { readDeliveryAddress } from '@/lib/delivery-address';
import { createStoreOrder } from '@/lib/admin-data';

export function CheckoutView() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { items, summary, isHydrated, appliedCoupon, couponError, couponSuccess, applyCoupon, removeCoupon, clearCart } = useCart();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    mobileNumber: '',
    streetAddress: '',
    city: 'Bhubaneswar',
    pinCode: '',
    deliverySlot: 'Morning (7:00 AM – 10:30 AM)',
    orderNotes: '',
    acceptedTerms: false,
  });

  const [couponInput, setCouponInput] = useState('');
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [confirmedTotalPaise, setConfirmedTotalPaise] = useState<number>(0);
  const [confirmedOrderDetails, setConfirmedOrderDetails] = useState<CheckoutFormData | null>(null);

  // Load saved profile on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('sabuja_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          fullName: parsed.name || prev.fullName,
          mobileNumber: parsed.phone || prev.mobileNumber,
          streetAddress: parsed.address || prev.streetAddress,
        }));
      }
      // Prefer the structured delivery address saved from the header location selector
      const delivery = readDeliveryAddress();
      if (delivery) {
        setFormData((prev) => ({
          ...prev,
          fullName: delivery.fullName || prev.fullName,
          mobileNumber: delivery.phone || prev.mobileNumber,
          streetAddress: [delivery.line1, delivery.line2, delivery.locality]
            .map((p) => p.trim())
            .filter(Boolean)
            .join(', '),
          city: delivery.city || prev.city,
          pinCode: delivery.pinCode || prev.pinCode,
        }));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (errors[name as keyof CheckoutFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applyCoupon(couponInput);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const result = validateCheckoutForm(formData);

    if (!result.isValid) {
      setErrors(result.errors);
      // Scroll to first error on mobile/desktop
      const firstErrorField = Object.keys(result.errors)[0];
      if (firstErrorField) {
        const el = document.getElementById(firstErrorField);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }
      return;
    }

    setIsSubmitting(true);

    // Generate genuine order reference timestamp ID
    const newOrderId = `SBH-${Date.now().toString().slice(-6)}`;
    const totalPaise = summary.totalPaise;
    const detailsSnapshot = { ...formData };

    try {
      const mappedOrderItems = items.map((it) => ({
        productId: it.product.id,
        productName: it.product.nameEn,
        quantity: it.quantity,
        unit: it.product.unit,
        unitPrice: it.product.price,
        lineTotal: Math.round((it.lineTotalPaise / 100) * 100) / 100,
      }));

      createStoreOrder({
        id: newOrderId,
        items: mappedOrderItems,
        customerName: formData.fullName || 'Customer',
        customerPhone: formData.mobileNumber || '',
        customerEmail: 'customer@sabuja.local',
        address: `${formData.streetAddress}, ${formData.city} - ${formData.pinCode}`,
        paymentMethod: 'Cash / UPI on Delivery',
        deliveryDate: formData.deliverySlot,
        amount: Math.round(totalPaise / 100),
      });
    } catch {
      // ignore
    }

    try {
      addNotification({
        title: `Order #${newOrderId} Confirmed! 🚜`,
        message: `Your fresh produce order of ${formatPaiseINR(totalPaise)} has been placed for ${formData.deliverySlot}.`,
        href: '/orders',
        type: 'order',
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setConfirmedOrderId(newOrderId);
      setConfirmedTotalPaise(totalPaise);
      setConfirmedOrderDetails(detailsSnapshot);
      clearCart();
      setIsSubmitting(false);
      setIsConfirmed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  // If confirmed state
  if (isConfirmed && confirmedOrderDetails) {
    return (
      <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8 py-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-2xl border border-[#77A96B] bg-[#FAF8F2] p-6 sm:p-10 text-center space-y-6 text-[#202820] shadow-md motion-reduce:transform-none motion-reduce:transition-none"
        >
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#245C3A] text-white shadow-md"
            >
              <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
            </motion.div>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#173D2A]">
              Order Confirmed
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#245C3A]">
              Thank you, {confirmedOrderDetails.fullName}! Your produce order has been placed successfully.
            </p>
          </div>

          <div className="rounded-xl border border-[#DDE5D9] bg-white p-4 sm:p-6 text-left text-xs sm:text-sm text-[#202820] space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5E8DF] pb-3">
              <span className="font-semibold text-[#173D2A]">Order Reference:</span>
              <span className="font-mono text-xs font-bold bg-[#EEF4E9] text-[#245C3A] px-2.5 py-1 rounded-md border border-[#77A96B]/30">
                {confirmedOrderId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-[#697269] text-[11px]">Payment Method</p>
                <p className="font-bold text-[#173D2A]">Cash on Delivery (COD)</p>
              </div>
              <div>
                <p className="text-[#697269] text-[11px]">Amount Due at Delivery</p>
                <p className="font-bold text-[#173D2A] text-base">{formatPaiseINR(confirmedTotalPaise)}</p>
              </div>
            </div>

            <div className="border-t border-[#E5E8DF] pt-3 space-y-1.5 text-xs text-[#202820]">
              <p><strong>Customer Name:</strong> {confirmedOrderDetails.fullName}</p>
              <p><strong>Mobile Number:</strong> +91 {confirmedOrderDetails.mobileNumber}</p>
              <p><strong>Delivery Location:</strong> {confirmedOrderDetails.streetAddress}, {confirmedOrderDetails.city} - {confirmedOrderDetails.pinCode}</p>
              <p><strong>Preferred Window:</strong> {confirmedOrderDetails.deliverySlot}</p>
              {confirmedOrderDetails.orderNotes && (
                <p><strong>Notes:</strong> {confirmedOrderDetails.orderNotes}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-[#EEF4E9] border border-[#77A96B]/50 p-4 text-xs text-[#173D2A] text-center space-y-1">
            <p className="font-bold text-sm">Payment Method: Cash on Delivery (COD)</p>
            <p className="font-semibold text-[#245C3A]">Pay the final order amount at the time of delivery.</p>
            <p className="text-[11px] text-[#697269]">
              Please keep {formatPaiseINR(confirmedTotalPaise)} ready in cash or UPI scan upon arrival of your order.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#245C3A] px-6 text-xs sm:text-sm font-semibold text-white hover:bg-[#173D2A] transition-colors cursor-pointer shadow-xs"
            >
              <span>Continue Shopping</span>
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#DDE5D9] bg-white px-5 text-xs sm:text-sm font-semibold text-[#202820] hover:bg-[#EEF4E9] transition-colors cursor-pointer"
            >
              Return Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isHydrated && !isConfirmed) {
    return (
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-40 rounded bg-[#E6EAE4] animate-pulse" />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 h-96 rounded-2xl border border-[#DDE5D9] bg-white animate-pulse" />
          <div className="lg:col-span-4 h-64 rounded-2xl border border-[#DDE5D9] bg-white animate-pulse" />
        </div>
      </div>
    );
  }

  // If cart is empty
  if (summary.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-[#DDE5D9] bg-[#FAF8F2] p-8 sm:p-12 text-[#202820] shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-[#173D2A]">
            Your shopping cart is empty
          </h1>
          <p className="mt-2 text-sm text-[#697269]">
            Add fresh vegetables or fruits before checking out.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#245C3A] px-6 text-xs font-semibold text-white hover:bg-[#173D2A]"
          >
            Explore Produce
          </Link>
        </div>
      </div>
    );
  }

  const deliveryText =
    summary.deliveryFeePaise === 0
      ? t.freeDelivery
      : formatPaiseINR(summary.deliveryFeePaise);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-10 pb-36 sm:pb-24 bg-[#FAF8F2]">
      <div className="mb-4 sm:mb-6 border-b border-[#DDE5D9] pb-3 sm:pb-5 flex items-center justify-between flex-wrap gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-[#173D2A] truncate">
            Checkout
          </h1>
          <p className="mt-0.5 text-[11px] sm:text-xs text-[#697269] font-semibold truncate">
            Doorstep delivery in Odisha
          </p>
        </div>

        <Link
          href="/cart"
          className="inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-xl border border-[#DDE5D9] bg-white px-3 sm:px-3.5 text-[11px] sm:text-xs font-semibold text-[#173D2A] hover:border-[#245C3A] transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Cart</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:items-start">
        {/* Checkout Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-8 rounded-2xl border border-[#DDE5D9] bg-white p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6 text-[#202820]"
        >
          {/* Contact Details */}
          <div className="space-y-3.5">
            <h2 className="text-xs sm:text-sm font-bold text-[#173D2A] uppercase tracking-wider border-b border-[#EEF4E9] pb-2">
              1. Customer Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="min-w-0">
                <label htmlFor="fullName" className="block text-[10px] font-bold text-[#173D2A] mb-1 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Chandra Behera"
                  className="h-10 w-full rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] px-3 text-xs sm:text-sm font-semibold text-[#202820] placeholder:text-[#9AA29A] focus:outline-none focus:border-[#245C3A] focus:bg-white"
                />
                {errors.fullName && (
                  <p className="mt-1 text-[10px] text-[#B42318] font-semibold">{errors.fullName}</p>
                )}
              </div>

              <div className="min-w-0">
                <label htmlFor="mobileNumber" className="block text-[10px] font-bold text-[#173D2A] mb-1 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <div className="flex">
                  <span className="inline-flex h-10 items-center rounded-l-xl border border-r-0 border-[#DDE5D9] bg-[#EEF4E9] px-3 text-xs font-bold text-[#173D2A]">
                    +91
                  </span>
                  <input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="h-10 flex-1 rounded-r-xl border border-[#DDE5D9] bg-[#FAF8F2] px-3 text-xs sm:text-sm font-semibold text-[#202820] placeholder:text-[#9AA29A] focus:outline-none focus:border-[#245C3A] focus:bg-white"
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="mt-1 text-[10px] text-[#B42318] font-semibold">{errors.mobileNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3.5">
            <h2 className="text-xs sm:text-sm font-bold text-[#173D2A] uppercase tracking-wider border-b border-[#EEF4E9] pb-2">
              2. Delivery Address
            </h2>

            <div className="min-w-0">
              <label htmlFor="streetAddress" className="block text-[10px] font-bold text-[#173D2A] mb-1 uppercase tracking-wider">
                Full Address *
              </label>
              <textarea
                id="streetAddress"
                name="streetAddress"
                rows={3}
                required
                value={formData.streetAddress}
                onChange={handleChange}
                placeholder="Plot 45, Near Daily Market, Station Road..."
                className="w-full rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] p-3 text-xs sm:text-sm font-semibold text-[#202820] placeholder:text-[#9AA29A] focus:outline-none focus:border-[#245C3A] focus:bg-white resize-none"
              />
              {errors.streetAddress && (
                <p className="mt-1 text-[10px] text-[#B42318] font-semibold">{errors.streetAddress}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="min-w-0">
                <label htmlFor="city" className="block text-[10px] font-bold text-[#173D2A] mb-1 uppercase tracking-wider">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className="h-10 w-full rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] px-3 text-xs sm:text-sm font-semibold text-[#202820] focus:outline-none focus:border-[#245C3A] focus:bg-white"
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="pinCode" className="block text-[10px] font-bold text-[#173D2A] mb-1 uppercase tracking-wider">
                  PIN Code *
                </label>
                <input
                  id="pinCode"
                  name="pinCode"
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="751001"
                  className="h-10 w-full rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] px-3 text-xs sm:text-sm font-semibold text-[#202820] placeholder:text-[#9AA29A] focus:outline-none focus:border-[#245C3A] focus:bg-white"
                />
                {errors.pinCode && (
                  <p className="mt-1 text-[10px] text-[#B42318] font-semibold">{errors.pinCode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Slot */}
          <div className="space-y-3.5">
            <h2 className="text-xs sm:text-sm font-bold text-[#173D2A] uppercase tracking-wider border-b border-[#EEF4E9] pb-2">
              3. Delivery Slot
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="min-w-0">
                <label htmlFor="deliverySlot" className="block text-[10px] font-bold text-[#173D2A] mb-1 uppercase tracking-wider">
                  Preferred Time
                </label>
                <select
                  id="deliverySlot"
                  name="deliverySlot"
                  value={formData.deliverySlot}
                  onChange={handleChange}
                  className="h-10 w-full rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] px-3 text-xs sm:text-sm font-semibold text-[#202820] focus:outline-none focus:border-[#245C3A] focus:bg-white"
                >
                  <option value="Morning (7:00 AM – 10:30 AM)">Morning (7:00 AM – 10:30 AM)</option>
                  <option value="Afternoon (1:00 PM – 3:30 PM)">Afternoon (1:00 PM – 3:30 PM)</option>
                  <option value="Evening (5:00 PM – 8:30 PM)">Evening (5:00 PM – 8:30 PM)</option>
                </select>
              </div>

              <div className="min-w-0">
                <label htmlFor="orderNotes" className="block text-[10px] font-bold text-[#173D2A] mb-1 uppercase tracking-wider">
                  Order Notes
                </label>
                <input
                  id="orderNotes"
                  name="orderNotes"
                  type="text"
                  value={formData.orderNotes}
                  onChange={handleChange}
                  placeholder="e.g. Please ring the bell"
                  className="h-10 w-full rounded-xl border border-[#DDE5D9] bg-[#FAF8F2] px-3 text-xs sm:text-sm font-semibold text-[#202820] placeholder:text-[#9AA29A] focus:outline-none focus:border-[#245C3A] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3.5">
            <h2 className="text-xs sm:text-sm font-bold text-[#173D2A] uppercase tracking-wider border-b border-[#EEF4E9] pb-2">
              4. Payment Method
            </h2>

            <div className="rounded-xl border border-[#245C3A]/30 bg-[#EEF4E9]/40 p-3.5 sm:p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-4 w-4 rounded-full border border-[#173D2A] flex items-center justify-center bg-[#173D2A]">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                  <label className="text-xs sm:text-sm font-bold text-[#173D2A]">
                    Cash on Delivery (COD)
                  </label>
                </div>
                <span className="bg-[#173D2A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Active
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-[#245C3A] leading-relaxed">
                Pay <span className="font-bold text-[#173D2A]">{formatPaiseINR(summary.totalPaise)}</span> directly to our delivery executive via cash or UPI scan. No advance payment needed.
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <div className="relative flex items-center shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  id="acceptedTerms"
                  name="acceptedTerms"
                  checked={formData.acceptedTerms}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border border-[#DDE5D9] text-[#173D2A] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </div>
              <span className="text-[11px] sm:text-xs text-[#697269] font-medium leading-relaxed group-hover:text-[#173D2A] transition-colors">
                I agree to pay the total amount on delivery and confirm the details above are correct.
              </span>
            </label>
            {errors.acceptedTerms && (
              <p className="mt-1 text-[10px] text-[#B42318] font-semibold">{errors.acceptedTerms}</p>
            )}
          </div>

          {/* Form Submit Button - Large screen only */}
          <div className="hidden sm:block pt-4 border-t border-[#EEF4E9]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#173D2A] px-8 text-xs sm:text-sm font-bold text-white hover:bg-[#245C3A] disabled:opacity-50 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Processing...' : 'Place Order (COD)'}</span>
            </button>
          </div>
        </form>

        {/* Sidebar Summary */}
        <section
          aria-label="Order summary breakdown"
          className="lg:col-span-4 rounded-2xl border border-[#DDE5D9] bg-white p-4 sm:p-5 shadow-xs space-y-4 text-[#202820]"
        >
          <h3 className="text-xs sm:text-sm font-bold text-[#173D2A] uppercase tracking-wider">
            Order Summary ({summary.itemCount})
          </h3>

          <div className="divide-y divide-[#EEF4E9] max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {summary.items.map((item) => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div className="min-w-0 pr-3">
                  <p className="font-bold text-[#173D2A] truncate">{item.product.nameEn}</p>
                  <p className="text-[10px] sm:text-xs text-[#697269] font-medium">
                    {item.quantity} {item.product.unit} @ ₹{item.product.price}
                  </p>
                </div>
                <span className="font-bold text-[#173D2A] shrink-0">
                  {formatPaiseINR(item.lineTotalPaise)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3.5 border-t border-[#EEF4E9] space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-[#697269] font-medium">Subtotal</span>
              <span className="font-bold text-[#173D2A]">{formatPaiseINR(summary.subtotalPaise)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#697269] font-medium">Delivery Fee</span>
              <span className={`font-bold ${summary.deliveryFeePaise === 0 ? 'text-[#245C3A]' : 'text-[#173D2A]'}`}>
                {summary.deliveryFeePaise === 0 ? 'FREE' : formatPaiseINR(summary.deliveryFeePaise)}
              </span>
            </div>
            {summary.discountPaise > 0 && (
              <div className="flex justify-between items-center text-xs sm:text-sm text-[#245C3A]">
                <span className="font-medium">Discount</span>
                <span className="font-bold">-{formatPaiseINR(summary.discountPaise)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2.5 border-t border-[#EEF4E9] text-sm sm:text-base font-bold text-[#173D2A]">
              <span>To Pay</span>
              <span>{formatPaiseINR(summary.totalPaise)}</span>
            </div>
          </div>

          {/* Coupon */}
          <div className="rounded-xl border border-dashed border-[#DDE5D9] bg-[#FAF8F2] p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#173D2A] uppercase tracking-wider">
              <Tag className="h-3.5 w-3.5 text-[#245C3A]" />
              Apply Coupon
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between text-xs font-bold text-[#245C3A]">
                <span>{appliedCoupon} applied!</span>
                <button type="button" onClick={removeCoupon} className="text-[#E64A19] hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                  className="h-9 flex-1 rounded-lg border border-[#DDE5D9] bg-white px-2.5 text-xs font-medium text-[#173D2A] focus:outline-none focus:border-[#245C3A]"
                />
                <button type="submit" className="h-9 bg-[#173D2A] px-3.5 text-[10px] font-bold text-white rounded-lg hover:bg-[#245C3A] active:scale-95 transition-all cursor-pointer">
                  APPLY
                </button>
              </form>
            )}
            {couponError && <p className="text-[10px] text-[#E64A19] font-semibold">{couponError}</p>}
          </div>

          <div className="rounded-xl bg-[#EEF4E9]/40 border border-[#DDE5D9] p-3 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-[#245C3A] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[#173D2A]">Safe & Secure Payments</p>
              <p className="text-[10px] font-medium text-[#697269]">Verify produce before paying on delivery.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Persistent Fixed Bottom Bar for Mobile Checkout */}
      <div className="fixed bottom-16 inset-x-0 z-40 sm:hidden border-t border-[#DDE5D9] bg-white/95 backdrop-blur-lg p-2.5 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe-bottom">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-[9px] font-bold text-[#697269] uppercase tracking-wider">
              Total to Pay
            </span>
            <span className="font-bold text-base text-[#173D2A] block leading-tight">
              {formatPaiseINR(summary.totalPaise)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 max-w-[190px] inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#173D2A] px-4 text-xs font-bold text-white shadow-sm active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{isSubmitting ? 'Confirming...' : 'Place Order (COD)'}</span>
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
