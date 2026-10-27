/**
 * Delivery address storage + validation.
 *
 * Storage layer: the app has no backend, so this uses the same browser
 * localStorage mechanism as the existing profile (`sabuja_user_profile`).
 *  - `sabuja_delivery_address` keeps the structured address.
 *  - The flat `address` string in `sabuja_user_profile` is kept in sync so the
 *    existing Profile and Checkout prefill continue to work unchanged.
 */

export const PROFILE_KEY = 'sabuja_user_profile';
export const DELIVERY_ADDRESS_KEY = 'sabuja_delivery_address';

export interface DeliveryAddress {
  fullName: string;
  line1: string;
  line2: string;
  locality: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  /** Only present when the user used "Use My Location"; raw GPS, not a verified address. */
  coordinates?: { lat: number; lng: number };
}

export type DeliveryAddressErrors = Partial<Record<keyof Omit<DeliveryAddress, 'coordinates'>, string>>;

export function sanitizePin(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

export function sanitizePhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  // Pasted numbers like "+91 98765 43210" / "098765 43210": drop the country/trunk prefix
  if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length > 10 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

/** Indian mobile number: 10 digits starting with 6-9 (same rule as checkout validation). */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

/** Normalises a stored phone string to 10 digits, or '' if it is not a valid Indian mobile. */
export function normalizeStoredPhone(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  return isValidPhone(digits) ? digits : '';
}

export function validateDeliveryAddress(data: DeliveryAddress): DeliveryAddressErrors {
  const errors: DeliveryAddressErrors = {};
  if (data.fullName.trim().length < 2) errors.fullName = 'Please enter your full name.';
  if (data.line1.trim().length < 3) errors.line1 = 'Please enter your house number, building or street.';
  if (data.locality.trim().length < 2) errors.locality = 'Please enter your locality or area.';
  if (data.city.trim().length < 2) errors.city = 'Please enter your city.';
  if (data.state.trim().length < 2) errors.state = 'Please enter your state.';
  if (!data.pinCode) {
    errors.pinCode = 'PIN code is required.';
  } else if (!isValidPin(data.pinCode)) {
    errors.pinCode = 'Please enter a valid 6-digit PIN code (e.g. 751001).';
  }
  if (!data.phone) {
    errors.phone = 'Phone number is required.';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
  }
  return errors;
}

/** Single-line address mirrored into the legacy profile `address` field. */
export function formatFlatAddress(a: DeliveryAddress): string {
  const parts = [a.line1, a.line2, a.locality, a.city, a.state].map((p) => p.trim()).filter(Boolean);
  return `${parts.join(', ')} - ${a.pinCode}`;
}

/** Compact label for the header selector. */
export function formatHeaderLabel(a: DeliveryAddress): string {
  return `${a.locality.trim()} - ${a.pinCode}`;
}

function readProfile(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function readProfilePhone(): string {
  return normalizeStoredPhone(readProfile().phone);
}

export function readProfileName(): string {
  const n = readProfile().name;
  return typeof n === 'string' ? n : '';
}

/**
 * Returns the structured address only while it is still in sync with the profile's
 * flat address (e.g. it is ignored if the profile was reset or the address was edited
 * from the Profile page).
 */
export function readDeliveryAddress(): DeliveryAddress | null {
  try {
    const raw = localStorage.getItem(DELIVERY_ADDRESS_KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as DeliveryAddress;
    if (!a || typeof a.pinCode !== 'string' || typeof a.locality !== 'string') return null;
    const profileAddress = readProfile().address;
    if (typeof profileAddress !== 'string' || profileAddress !== formatFlatAddress(a)) return null;
    return a;
  } catch {
    return null;
  }
}

/**
 * Persists the address. Returns true only after the data has been written and read back.
 */
export function saveDeliveryAddress(a: DeliveryAddress): boolean {
  try {
    const clean: DeliveryAddress = {
      ...a,
      fullName: a.fullName.trim(),
      line1: a.line1.trim(),
      line2: a.line2.trim(),
      locality: a.locality.trim(),
      city: a.city.trim(),
      state: a.state.trim(),
    };
    const flat = formatFlatAddress(clean);
    const profile = readProfile();
    const nextProfile = {
      ...profile,
      name: typeof profile.name === 'string' && profile.name.trim() ? profile.name : clean.fullName,
      phone: typeof profile.phone === 'string' && profile.phone.trim() ? profile.phone : clean.phone,
      address: flat,
    };
    localStorage.setItem(DELIVERY_ADDRESS_KEY, JSON.stringify(clean));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    return readDeliveryAddress()?.pinCode === clean.pinCode;
  } catch {
    return false;
  }
}
