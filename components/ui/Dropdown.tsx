'use client';

import { useState, useRef, useEffect } from 'react';

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
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-left text-sm text-stone-900 transition-colors hover:border-stone-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-[#2A2A2A] dark:text-white dark:hover:border-white/20"
      >
        <span className={current ? '' : 'text-stone-400 dark:text-stone-500'}>
          {current ? current.label : (disabled ? (disabledPlaceholder ?? placeholder) : placeholder)}
        </span>
        <svg
          className={`shrink-0 text-stone-400 transition-transform duration-200 dark:text-stone-500 ${open ? 'rotate-180' : ''}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-300 mt-2 max-h-64 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl shadow-stone-900/10 dark:border-white/10 dark:bg-[#242424] dark:shadow-black/40">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-stone-400 transition-colors hover:bg-stone-50 dark:text-stone-500 dark:hover:bg-white/5"
          >
            {placeholder}
          </button>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                value === opt.value
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300'
                  : 'text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/5'
              }`}
            >
              {opt.label}
              {value === opt.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
