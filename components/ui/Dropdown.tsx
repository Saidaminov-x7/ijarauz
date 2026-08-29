'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  disabledPlaceholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Проверяем положение: если снизу недостаточно места (выступает за экран), открываем вверх
  useLayoutEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Если снизу меньше 260px и сверху места больше, открываем вверх
      if (spaceBelow < 260 && spaceAbove > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-left text-xs font-semibold text-stone-900 transition-all hover:border-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-[#1E1E1E] dark:text-white dark:hover:border-teal-500 cursor-pointer"
      >
        <span className={current ? 'truncate' : 'truncate text-stone-400 dark:text-stone-400'}>
          {current ? current.label : disabled ? disabledPlaceholder ?? placeholder : placeholder}
        </span>
        <svg
          className={`shrink-0 text-stone-400 transition-transform duration-200 dark:text-stone-400 ${open ? 'rotate-180' : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && !disabled && (
        <div
          ref={menuRef}
          className={`absolute left-0 right-0 z-50 max-h-64 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-[#1E1E1E] dark:shadow-black/60 ${
            openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs text-stone-400 transition-colors hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5 cursor-pointer font-medium"
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                value === opt.value
                  ? 'bg-teal-50 text-teal-700 font-bold dark:bg-teal-950/60 dark:text-teal-300'
                  : 'text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/10 font-medium'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0 text-teal-600 dark:text-teal-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
