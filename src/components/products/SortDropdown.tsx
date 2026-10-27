'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export type SortValue = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

const OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'default', label: 'Sort: Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'A to Z' },
];

interface SortDropdownProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selectedIndex = Math.max(
    0,
    OPTIONS.findIndex((o) => o.value === value)
  );
  const selected = OPTIONS[selectedIndex];

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      // Flip upward when there is not enough room below (menu ≈ 176px)
      setOpenUp(window.innerHeight - rect.bottom < 190 && rect.top > 190);
    }
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const choose = (index: number) => {
    onChange(OPTIONS[index].value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % OPTIONS.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + OPTIONS.length) % OPTIONS.length);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(OPTIONS.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative w-full sm:w-44" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-label="Sort products"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-[#DDE5D9] bg-white pl-3 pr-2.5 text-[11px] font-bold text-[#173D2A] shadow-xs transition-colors hover:border-[#245C3A]/50 focus-visible:outline-none focus-visible:border-[#245C3A] focus-visible:ring-2 focus-visible:ring-[#245C3A]/20 cursor-pointer"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#697269] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sort products"
          className={`absolute right-0 z-30 w-full min-w-[11.5rem] overflow-hidden rounded-xl border border-[#DDE5D9] bg-white p-1 shadow-[0_8px_24px_-6px_rgba(23,61,42,0.22)] animate-in fade-in duration-100 ${
            openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {OPTIONS.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isActive = idx === activeIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => choose(idx)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#EAF6E7] font-bold text-[#064E32]'
                    : isActive
                    ? 'bg-[#F3F6F0] font-semibold text-[#173D2A]'
                    : 'font-medium text-[#3F4A42]'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#245C3A]" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
