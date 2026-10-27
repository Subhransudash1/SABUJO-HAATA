'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { ProductUnit } from '@/types/product';
import { getQuantityStep, getMinQuantity, getMaxQuantity } from '@/lib/cart';
import { useBulkOrder } from '@/components/providers/StoreProviders';

interface QuantityStepperProps {
  quantity: number;
  unit: ProductUnit;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
  productName?: string;
  compact?: boolean;
}

export function QuantityStepper({
  quantity,
  unit,
  onChange,
  disabled = false,
  productName = 'product',
  compact = false,
}: QuantityStepperProps) {
  const { openBulkOrderModal } = useBulkOrder();
  const step = getQuantityStep(unit);
  const min = getMinQuantity(unit);
  const max = getMaxQuantity(unit);

  const handleDecrease = () => {
    if (disabled) return;
    const next = quantity - step;
    if (next >= min) {
      onChange(Number(next.toFixed(2)));
    }
  };

  const handleIncrease = () => {
    if (disabled) return;
    const next = Number((quantity + step).toFixed(2));
    if (next > max) {
      openBulkOrderModal({
        productName,
        attemptedQty: next,
        unit,
        maxLimit: max,
      });
      if (quantity < max) {
        onChange(max);
      }
      return;
    }
    onChange(next);
  };

  const displayQuantity =
    unit === 'kg'
      ? `${quantity.toFixed(quantity % 1 === 0 ? 0 : (quantity % 0.5 === 0 ? 1 : 2))} kg`
      : `${quantity} ${unit === 'piece' ? (quantity === 1 ? 'pc' : 'pcs') : quantity === 1 ? 'bdl' : 'bdls'}`;

  return (
    <div
      className={`inline-flex items-center justify-between rounded-xl border border-[#DDE5D9] bg-white p-1 ${
        compact ? 'w-[116px] sm:w-[132px]' : 'w-full sm:w-[152px]'
      }`}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        aria-label={`Decrease quantity of ${productName}`}
        className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-[#173D2A] hover:bg-[#EEF4E9] active:bg-[#DDE5D9] disabled:opacity-20 transition-all cursor-pointer"
      >
        <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
      </button>

      <span
        aria-live="polite"
        className="flex-1 text-center text-[11px] sm:text-xs font-bold text-[#173D2A] tabular-nums select-none"
      >
        {displayQuantity}
      </span>

      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled}
        aria-label={`Increase quantity of ${productName}`}
        className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#173D2A] text-white hover:bg-[#245C3A] active:scale-90 disabled:opacity-50 transition-all cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
