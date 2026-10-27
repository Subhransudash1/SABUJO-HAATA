export interface CheckoutFormData {
  fullName: string;
  mobileNumber: string;
  streetAddress: string;
  city: string;
  pinCode: string;
  deliverySlot: string;
  orderNotes?: string;
  acceptedTerms: boolean;
}

export interface CheckoutFormErrors {
  fullName?: string;
  mobileNumber?: string;
  streetAddress?: string;
  city?: string;
  pinCode?: string;
  acceptedTerms?: string;
}

export function validateCheckoutForm(data: CheckoutFormData): {
  isValid: boolean;
  errors: CheckoutFormErrors;
} {
  const errors: CheckoutFormErrors = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }

  // Indian mobile numbers: 10 digits, starts with 6, 7, 8, or 9
  const cleanMobile = data.mobileNumber.replace(/[\s-+()]/g, '');
  if (!cleanMobile) {
    errors.mobileNumber = 'Mobile number is required.';
  } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
    errors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number.';
  }

  if (!data.streetAddress || data.streetAddress.trim().length < 5) {
    errors.streetAddress = 'Please enter a complete delivery address (street/locality).';
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'Please enter your town or city.';
  }

  // Indian Postal PIN Code: 6 digits, non-zero first digit
  const cleanPin = data.pinCode.trim();
  if (!cleanPin) {
    errors.pinCode = '6-digit PIN code is required.';
  } else if (!/^[1-9]\d{5}$/.test(cleanPin)) {
    errors.pinCode = 'Please enter a valid 6-digit Indian PIN code (e.g. 751001).';
  }

  if (!data.acceptedTerms) {
    errors.acceptedTerms = 'You must acknowledge the terms and conditions.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
