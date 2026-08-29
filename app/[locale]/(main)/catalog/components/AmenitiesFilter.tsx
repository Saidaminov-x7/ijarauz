'use client';

import React from 'react';
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

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((a) => a !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className={cn('grid grid-cols-2 gap-1.5', className)}>
      {Object.entries(AMENITY_CONFIG).map(([key, { translationKey, icon: Icon }]) => {
        const active = selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={cn(
              'flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all text-left',
              active
                ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-600 shadow-xs'
                : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:border-stone-300 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10'
            )}
          >
            <Icon className={cn('w-3.5 h-3.5 shrink-0', active ? 'text-teal-600 dark:text-teal-400' : 'text-stone-400')} />
            <span className="truncate">{t(translationKey as any)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function QuickAmenityChips({
  selected,
  onChange,
  className,
}: {
  selected: string[];
  onChange: (amenities: string[]) => void;
  className?: string;
}) {
  const t = useTranslations('amenities');

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((a) => a !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      {TOP_AMENITIES.map((key) => {
        const item = AMENITY_CONFIG[key];
        if (!item) return null;
        const Icon = item.icon;
        const active = selected.includes(key);

        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer select-none',
              active
                ? 'border-teal-600 bg-teal-600 text-white font-semibold shadow-xs'
                : 'border-stone-200 bg-white text-stone-700 hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-[#1E1E1E] dark:text-stone-300 dark:hover:border-teal-500'
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', active ? 'text-white' : 'text-stone-400')} />
            <span>{t(item.translationKey as any)}</span>
          </button>
        );
      })}
    </div>
  );
}
