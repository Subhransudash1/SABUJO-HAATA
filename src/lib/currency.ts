/**
 * Currency and Integer-Paise Math Utilities for Shopbujo Hatto (INR / ₹)
 */

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function calculateLineTotalPaise(priceRupeesPerUnit: number, quantity: number): number {
  const pricePaise = rupeesToPaise(priceRupeesPerUnit);
  // multiply paise by quantity and round to nearest whole paise
  return Math.round(pricePaise * quantity);
}

export function formatPaiseINR(paise: number): string {
  const safePaise = Number.isFinite(paise) ? paise : 0;
  const rupees = safePaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function formatRupeesINR(rupees: number): string {
  return formatPaiseINR(rupeesToPaise(rupees));
}
