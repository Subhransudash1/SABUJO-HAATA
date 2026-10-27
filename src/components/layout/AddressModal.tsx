'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Save, Navigation, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DeliveryAddress,
  DeliveryAddressErrors,
  sanitizePin,
  sanitizePhone,
  validateDeliveryAddress,
} from '@/lib/delivery-address';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Saved structured address, if any. */
  savedAddress: DeliveryAddress | null;
  /** Legacy single-line address (from profile) used only to help prefill Address Line 1. */
  legacyAddress: string;
  /** A real, valid 10-digit phone from the saved profile; '' if none. */
  profilePhone: string;
  profileName: string;
  /** Must return true only if the address was actually persisted. */
  onSave: (address: DeliveryAddress) => boolean;
}

type PhoneMode = 'existing' | 'different';
type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

const EMPTY: DeliveryAddress = {
  fullName: '',
  line1: '',
  line2: '',
  locality: '',
  city: 'Bhubaneswar',
  state: 'Odisha',
  pinCode: '',
  phone: '',
};

const inputClass =
  'w-full h-10 rounded-xl border border-[#DDE5D9] bg-white px-3 text-sm font-medium text-[#202820] placeholder:text-[#A5ADA4] focus:border-[#245C3A] focus:outline-none focus:ring-2 focus:ring-[#245C3A]/15 transition-colors';
const labelClass = 'block text-[11px] font-bold text-[#173D2A] mb-1';

export function AddressModal({
  isOpen,
  onClose,
  savedAddress,
  legacyAddress,
  profilePhone,
  profileName,
  onSave,
}: AddressModalProps) {
  const [form, setForm] = useState<DeliveryAddress>(EMPTY);
  const [phoneMode, setPhoneMode] = useState<PhoneMode>('different');
  const [errors, setErrors] = useState<DeliveryAddressErrors>({});
  const [saveError, setSaveError] = useState('');
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [geoMessage, setGeoMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Initialise the form every time the modal opens
  useEffect(() => {
    if (!isOpen) return;
    const base: DeliveryAddress = savedAddress
      ? { ...EMPTY, ...savedAddress }
      : { ...EMPTY, fullName: profileName, line1: legacyAddress };
    if (savedAddress) {
      setPhoneMode(profilePhone && savedAddress.phone === profilePhone ? 'existing' : 'different');
    } else {
      setPhoneMode(profilePhone ? 'existing' : 'different');
      if (profilePhone) base.phone = profilePhone;
    }
    setForm(base);
    setErrors({});
    setSaveError('');
    setGeoStatus('idle');
    setGeoMessage('');
  }, [isOpen, savedAddress, legacyAddress, profilePhone, profileName]);

  const setField = (name: keyof DeliveryAddress, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof DeliveryAddressErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const choosePhoneMode = (mode: PhoneMode) => {
    setPhoneMode(mode);
    setErrors((prev) => ({ ...prev, phone: undefined }));
    setForm((prev) => ({
      ...prev,
      phone: mode === 'existing' ? profilePhone : prev.phone === profilePhone ? '' : prev.phone,
    }));
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGeoStatus('error');
      setGeoMessage('Location is not supported on this device or browser. Please enter your address manually.');
      return;
    }
    setGeoStatus('loading');
    setGeoMessage('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setForm((prev) => ({
          ...prev,
          coordinates: { lat: Number(latitude.toFixed(6)), lng: Number(longitude.toFixed(6)) },
        }));
        setGeoStatus('success');
        // No reverse-geocoding service is configured in this project, so we never guess an address.
        setGeoMessage(
          `Location detected (accuracy about ${Math.round(accuracy)} m). Automatic address lookup isn't available yet, so please fill in your address details and PIN code below.`
        );
      },
      (err) => {
        setGeoStatus('error');
        if (err.code === err.PERMISSION_DENIED) {
          setGeoMessage('Location permission was denied. You can allow it in your browser settings, or enter your address manually.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoMessage('Your location is currently unavailable. Please check GPS/network or enter your address manually.');
        } else if (err.code === err.TIMEOUT) {
          setGeoMessage('Finding your location took too long. Please try again or enter your address manually.');
        } else {
          setGeoMessage('Could not get your location. Please enter your address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    const data: DeliveryAddress = {
      ...form,
      phone: phoneMode === 'existing' ? profilePhone : form.phone,
    };
    const found = validateDeliveryAddress(data);
    setErrors(found);
    const firstKey = (Object.keys(found) as (keyof DeliveryAddressErrors)[])[0];
    if (firstKey) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }
    if (onSave(data)) {
      onClose();
    } else {
      setSaveError('We could not save your address on this device. Please check your browser storage settings and try again.');
    }
  };

  const fieldError = (name: keyof DeliveryAddressErrors) =>
    errors[name] ? (
      <p id={`${name}-error`} role="alert" className="mt-1 text-[11px] font-semibold text-[#B42318]">
        {errors[name]}
      </p>
    ) : null;

  const describe = (name: keyof DeliveryAddressErrors) => (errors[name] ? `${name}-error` : undefined);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
          />

          {/* Modal Content */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-address-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] bg-[#FAF8F2] p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92dvh]"
          >
            {/* Drag Handle for Mobile */}
            <div className="w-12 h-1 bg-[#DDE5D9] rounded-full mx-auto mb-3 sm:hidden shrink-0" />

            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#173D2A] text-white">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h2 id="delivery-address-title" className="text-base sm:text-xl font-black text-[#173D2A]">Delivery Address</h2>
                  <p className="text-[10px] sm:text-xs text-[#697269] font-bold">Where should we deliver?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close delivery address"
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-[#173D2A] shadow-sm border border-[#DDE5D9] hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 space-y-4"
            >
              {/* Use My Location */}
              <div>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={geoStatus === 'loading'}
                  className="flex w-full items-center justify-center gap-2 h-10 rounded-xl border border-[#245C3A] bg-white text-sm font-bold text-[#245C3A] hover:bg-[#EEF4E9] disabled:opacity-70 disabled:cursor-wait transition-colors"
                >
                  {geoStatus === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Detecting your location…</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      <span>Use My Location</span>
                    </>
                  )}
                </button>
                {geoMessage && (
                  <p
                    role={geoStatus === 'error' ? 'alert' : 'status'}
                    className={`mt-2 rounded-lg px-3 py-2 text-[11px] font-semibold leading-relaxed ${
                      geoStatus === 'error' ? 'bg-red-50 text-[#B42318]' : 'bg-[#EEF4E9] text-[#245C3A]'
                    }`}
                  >
                    {geoMessage}
                  </p>
                )}
              </div>

              {/* Contact */}
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-black uppercase tracking-wider text-[#697269] mb-1">Contact</legend>
                <div>
                  <label htmlFor="addr-fullName" className={labelClass}>Full Name</label>
                  <input
                    id="addr-fullName" name="fullName" type="text" autoComplete="name"
                    value={form.fullName} onChange={(e) => setField('fullName', e.target.value)}
                    placeholder="e.g. Anita Mohanty" className={inputClass}
                    aria-invalid={Boolean(errors.fullName)} aria-describedby={describe('fullName')}
                  />
                  {fieldError('fullName')}
                </div>

                <div>
                  <span className={labelClass}>Phone Number</span>
                  {profilePhone && (
                    <div role="radiogroup" aria-label="Phone number option" className="space-y-1.5 mb-2">
                      <label className="flex items-center gap-2 rounded-xl border border-[#DDE5D9] bg-white px-3 py-2 text-xs font-semibold text-[#202820] cursor-pointer has-[:checked]:border-[#245C3A] has-[:checked]:bg-[#EEF4E9]">
                        <input
                          type="radio" name="phoneMode" value="existing"
                          checked={phoneMode === 'existing'} onChange={() => choosePhoneMode('existing')}
                          className="accent-[#245C3A]"
                        />
                        <span>Use my existing phone number <span className="text-[#697269] font-medium">(+91 {profilePhone})</span></span>
                      </label>
                      <label className="flex items-center gap-2 rounded-xl border border-[#DDE5D9] bg-white px-3 py-2 text-xs font-semibold text-[#202820] cursor-pointer has-[:checked]:border-[#245C3A] has-[:checked]:bg-[#EEF4E9]">
                        <input
                          type="radio" name="phoneMode" value="different"
                          checked={phoneMode === 'different'} onChange={() => choosePhoneMode('different')}
                          className="accent-[#245C3A]"
                        />
                        <span>Use a different phone number</span>
                      </label>
                    </div>
                  )}
                  {(phoneMode === 'different' || !profilePhone) && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="flex h-10 items-center rounded-xl border border-[#DDE5D9] bg-[#F3F6F0] px-3 text-sm font-semibold text-[#697269]">+91</span>
                        <input
                          id="addr-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national"
                          value={form.phone}
                          onChange={(e) => setField('phone', sanitizePhone(e.target.value))}
                          placeholder="10-digit mobile number" className={inputClass}
                          aria-label="Phone number"
                          aria-invalid={Boolean(errors.phone)} aria-describedby={describe('phone')}
                        />
                      </div>
                      {fieldError('phone')}
                    </>
                  )}
                </div>
              </fieldset>

              {/* Address */}
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-black uppercase tracking-wider text-[#697269] mb-1">Address</legend>
                <div>
                  <label htmlFor="addr-line1" className={labelClass}>Address Line 1</label>
                  <input
                    id="addr-line1" name="line1" type="text" autoComplete="address-line1"
                    value={form.line1} onChange={(e) => setField('line1', e.target.value)}
                    placeholder="House no., building, street" className={inputClass}
                    aria-invalid={Boolean(errors.line1)} aria-describedby={describe('line1')}
                  />
                  {fieldError('line1')}
                </div>
                <div>
                  <label htmlFor="addr-line2" className={labelClass}>
                    Address Line 2 <span className="font-medium text-[#697269]">(optional)</span>
                  </label>
                  <input
                    id="addr-line2" name="line2" type="text" autoComplete="address-line2"
                    value={form.line2} onChange={(e) => setField('line2', e.target.value)}
                    placeholder="Apartment, landmark, other details" className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="addr-locality" className={labelClass}>Locality / Area</label>
                  <input
                    id="addr-locality" name="locality" type="text" autoComplete="address-level3"
                    value={form.locality} onChange={(e) => setField('locality', e.target.value)}
                    placeholder="e.g. Patia, Ghatikia" className={inputClass}
                    aria-invalid={Boolean(errors.locality)} aria-describedby={describe('locality')}
                  />
                  {fieldError('locality')}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label htmlFor="addr-city" className={labelClass}>City</label>
                    <input
                      id="addr-city" name="city" type="text" autoComplete="address-level2"
                      value={form.city} onChange={(e) => setField('city', e.target.value)}
                      placeholder="City" className={inputClass}
                      aria-invalid={Boolean(errors.city)} aria-describedby={describe('city')}
                    />
                    {fieldError('city')}
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="addr-state" className={labelClass}>State</label>
                    <input
                      id="addr-state" name="state" type="text" autoComplete="address-level1"
                      value={form.state} onChange={(e) => setField('state', e.target.value)}
                      placeholder="State" className={inputClass}
                      aria-invalid={Boolean(errors.state)} aria-describedby={describe('state')}
                    />
                    {fieldError('state')}
                  </div>
                </div>
                <div>
                  <label htmlFor="addr-pin" className={labelClass}>PIN Code</label>
                  <input
                    id="addr-pin" name="pinCode" type="text" inputMode="numeric" autoComplete="postal-code"
                    maxLength={6} value={form.pinCode}
                    onChange={(e) => setField('pinCode', sanitizePin(e.target.value))}
                    placeholder="6-digit PIN code" className={inputClass}
                    aria-invalid={Boolean(errors.pinCode)} aria-describedby={describe('pinCode')}
                  />
                  {fieldError('pinCode')}
                </div>
              </fieldset>

              {saveError && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-[#B42318]">{saveError}</p>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 h-12 rounded-2xl bg-[#173D2A] text-sm font-black text-white shadow-lg hover:bg-[#245C3A] active:scale-[0.98] transition-all"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                <span>Save Address</span>
              </button>
            </form>

            <div className="border-t border-[#DDE5D9] pt-3 mt-3 shrink-0">
              <p className="text-center text-[9px] sm:text-[10px] font-bold text-[#697269]">
                Deliveries limited to Bhubaneswar area only.
              </p>
              {/* Bottom Safe Area for Mobile Nav */}
              <div className="h-2 sm:hidden" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
