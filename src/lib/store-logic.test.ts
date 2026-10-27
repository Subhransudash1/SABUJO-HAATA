import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, PRICE_UPDATE_DATE } from '../data/products';
import { calculateLineTotalPaise, formatPaiseINR } from './currency';
import { validateQuantity, calculateCartSummary } from './cart';
import { filterAndSortProducts } from './product-utils';
import { validateCheckoutForm } from './validation';
import { TRANSLATIONS } from './i18n';

test('catalogue contains all records with unique IDs and slugs', () => {
  assert.equal(PRODUCTS.length, 60);
  const ids = new Set(PRODUCTS.map((p) => p.id));
  const slugs = new Set(PRODUCTS.map((p) => p.slug));
  assert.equal(ids.size, 60);
  assert.equal(slugs.size, 60);

  const veg = PRODUCTS.filter((p) => p.category === 'vegetables');
  const fruits = PRODUCTS.filter((p) => p.category === 'fruits');
  assert.equal(veg.length, 46);
  assert.equal(fruits.length, 14);
});

test('mandatory unavailable products and supplied Odia names are strictly preserved', () => {
  const greenPeas = PRODUCTS.find((p) => p.slug === 'green-peas');
  const bananaStem = PRODUCTS.find((p) => p.slug === 'banana-stem');
  const papayaVeg = PRODUCTS.find((p) => p.slug === 'papaya-vegetable');
  const papayaFruit = PRODUCTS.find((p) => p.slug === 'papaya-fruit');

  assert.ok(greenPeas && !greenPeas.available && greenPeas.price === 120);
  assert.ok(bananaStem && !bananaStem.available && bananaStem.price === 24);
  assert.ok(papayaVeg && !papayaVeg.available && papayaVeg.price === 28);
  assert.ok(papayaFruit && !papayaFruit.available && papayaFruit.price === 70);

  // Check potato Odia name
  const potato = PRODUCTS.find((p) => p.slug === 'potato');
  assert.equal(potato?.nameOr, 'ଆଳୁ');
  assert.equal(potato?.priceUpdatedAt, PRICE_UPDATE_DATE);
});

test('all Odia UI strings contain zero stray Bengali Unicode characters', () => {
  const odiaCharRegex = /[\u0B00-\u0B7F]/;
  const bengaliCharRegex = /[\u0980-\u09FF]/;

  const odiaSample = TRANSLATIONS.or.home + TRANSLATIONS.or.shopAll + TRANSLATIONS.or.vegetables;
  assert.ok(odiaCharRegex.test(odiaSample));
  assert.equal(bengaliCharRegex.test(odiaSample), false);
});

test('INR pricing and calculation examples match exact paise rules', () => {
  // 1 kg @ ₹15 = 1500 paise -> ₹15
  assert.equal(calculateLineTotalPaise(15, 1), 1500);
  assert.equal(formatPaiseINR(1500), '₹15');

  // 0.25 kg @ ₹15 = 375 paise -> ₹3.75
  assert.equal(calculateLineTotalPaise(15, 0.25), 375);
  assert.equal(formatPaiseINR(375), '₹3.75');

  // 1.25 kg @ ₹28 = 3500 paise -> ₹35
  assert.equal(calculateLineTotalPaise(28, 1.25), 3500);
  assert.equal(formatPaiseINR(3500), '₹35');
});

test('cart blocks unavailable items, fractional pieces/bundles, and corrupt storage', () => {
  // Fractional kg rounds to nearest 0.5 step
  assert.equal(validateQuantity(0.1, 'kg'), 0.5);
  assert.equal(validateQuantity(0.3, 'kg'), 0.5);
  assert.equal(validateQuantity(0.4, 'kg'), 0.5);

  // Piece must be an integer >= 1
  assert.equal(validateQuantity(0.25, 'piece'), 1);
  assert.equal(validateQuantity(2.4, 'piece'), 2);
  assert.equal(validateQuantity(0, 'bundle'), 1);
});

test('search, filter, and sort support English and Odia queries', () => {
  const searchAloo = filterAndSortProducts(PRODUCTS, { query: 'ଆଳୁ' });
  assert.ok(searchAloo.length >= 2); // Potato and Small Potato

  const sortedPriceAsc = filterAndSortProducts(PRODUCTS, { sort: 'price-asc' });
  assert.ok(sortedPriceAsc[0].price <= sortedPriceAsc[1].price);
});

test('checkout form validation checks Indian mobile, PIN code, and terms acceptance', () => {
  const invalid = validateCheckoutForm({
    fullName: '',
    mobileNumber: '12345',
    streetAddress: '',
    city: '',
    pinCode: '00000',
    deliverySlot: 'Morning',
    acceptedTerms: false,
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.mobileNumber);
  assert.ok(invalid.errors.pinCode);

  const valid = validateCheckoutForm({
    fullName: 'Priyabrata Mohanty',
    mobileNumber: '9876543210',
    streetAddress: 'Plot 42, Saheed Nagar',
    city: 'Bhubaneswar',
    pinCode: '751007',
    deliverySlot: 'Morning 7:00 AM – 10:00 AM',
    acceptedTerms: true,
  });
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});
