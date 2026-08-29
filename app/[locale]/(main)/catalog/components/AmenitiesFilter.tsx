'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Wifi,
  Car,
  ArrowUpDown,
  Snowflake,
  Flame,
  LayoutPanelTop,
  PawPrint,
  ShieldCheck,
  Sofa,
  CookingPot,
  WashingMachine,
  Dumbbell,
  Waves,
  Bath,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AMENITY_CONFIG: Record<
  string,
  { key: string; translationKey: string; icon: React.ComponentType<{ className?: string; size?: number }> }
> = {
  WIFI: { key: 'WIFI', translationKey: 'wifi', icon: Wifi },
  PARKING: { key: 'PARKING', translationKey: 'parking', icon: Car },
  ELEVATOR: { key: 'ELEVATOR', translationKey: 'elevator', icon: ArrowUpDown },
  AIR_CONDITIONING: { key: 'AIR_CONDITIONING', translationKey: 'air_conditioning', icon: Snowflake },
  HEATING: { key: 'HEATING', translationKey: 'heating', icon: Flame },
  BALCONY: { key: 'BALCONY', translationKey: 'balcony', icon: LayoutPanelTop },
  PETS_ALLOWED: { key: 'PETS_ALLOWED', translationKey: 'pets_allowed', icon: PawPrint },
  SECURITY: { key: 'SECURITY', translationKey: 'security', icon: ShieldCheck },
  FURNITURE: { key: 'FURNITURE', translationKey: 'furniture', icon: Sofa },
  KITCHEN: { key: 'KITCHEN', translationKey: 'kitchen', icon: CookingPot },
  WASHING_MACHINE: { key: 'WASHING_MACHINE', translationKey: 'washing_machine', icon: WashingMachine },
  GYM: { key: 'GYM', translationKey: 'gym', icon: Dumbbell },
  POOL: { key: 'POOL', translationKey: 'pool', icon: Waves },
  SAUNA: { key: 'SAUNA', translationKey: 'sauna', icon: Bath },
};

export const TOP_AMENITIES = ['WIFI', 'PARKING', 'AIR_CONDITIONING', 'FURNITURE'];

interface AmenitiesFilterProps {
  selected: string[];
  onChange: (amenities: string[]) => void;
  className?: string;
}

export function AmenitiesFilter({ selected, onChange, className }: AmenitiesFilterProps) {
  const t = useTranslations('amenities');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((a) => a !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Кнопка-дропдаун для удобств */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs text-stone-900 outline-none transition-all hover:border-teal-500 focus:border-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-white cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <Sparkles size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="truncate">
            {selected.length === 0
              ? 'Выберите удобства...'
              : `Выбрано: ${selected.length} удобств`}
          </span>
        </div>
        <ChevronDown size={14} className={cn('text-stone-400 transition-transform duration-200 shrink-0', isOpen && 'rotate-180')} />
      </button>

      {/* Выпадающий список с кастомными стильными чекбоксами */}
      {isOpen && (
        <div className="absolute left-0 top-full z-40 mt-1.5 w-full rounded-2xl border border-stone-200 bg-white p-2.5 shadow-2xl dark:border-white/10 dark:bg-[#1E1E1E] max-h-64 overflow-y-auto space-y-1">
          {Object.entries(AMENITY_CONFIG).map(([key, { translationKey, icon: Icon }]) => {
            const active = selected.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer',
                  active
                    ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-semibold'
                    : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10'
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-teal-600 dark:text-teal-400' : 'text-stone-400')} />
                  <span className="truncate">{t(translationKey as any)}</span>
                </div>
                <div
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                    active
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-stone-300 dark:border-stone-600 bg-transparent'
                  )}
                >
                  {active && <Check size={11} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Быстрые выбранные теги под дропдауном */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2.5">
          {selected.map((key) => {
            const item = AMENITY_CONFIG[key];
            if (!item) return null;
            return (
              <span
                key={key}
                onClick={() => toggle(key)}
                className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-500/20 cursor-pointer hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-colors"
                title="Нажмите чтобы удалить"
              >
                {t(item.translationKey as any)} ✕
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
