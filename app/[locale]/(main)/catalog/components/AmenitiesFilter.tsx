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
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AMENITY_CONFIG: Record<
  string,
  { key: string; translationKey: string; icon: React.ComponentType<{ className?: string; size?: number }> }
> = {
  WIFI: { key: 'WIFI', translationKey: 'wifi', icon: Wifi },
  PARKING: { key: 'PARKING', translationKey: 'parking', icon: Car },
  AIR_CONDITIONING: { key: 'AIR_CONDITIONING', translationKey: 'air_conditioning', icon: Snowflake },
  FURNITURE: { key: 'FURNITURE', translationKey: 'furniture', icon: Sofa },
  WASHING_MACHINE: { key: 'WASHING_MACHINE', translationKey: 'washing_machine', icon: WashingMachine },
  KITCHEN: { key: 'KITCHEN', translationKey: 'kitchen', icon: CookingPot },
  BALCONY: { key: 'BALCONY', translationKey: 'balcony', icon: LayoutPanelTop },
  HEATING: { key: 'HEATING', translationKey: 'heating', icon: Flame },
  ELEVATOR: { key: 'ELEVATOR', translationKey: 'elevator', icon: ArrowUpDown },
  PETS_ALLOWED: { key: 'PETS_ALLOWED', translationKey: 'pets_allowed', icon: PawPrint },
  SECURITY: { key: 'SECURITY', translationKey: 'security', icon: ShieldCheck },
  GYM: { key: 'GYM', translationKey: 'gym', icon: Dumbbell },
  POOL: { key: 'POOL', translationKey: 'pool', icon: Waves },
  SAUNA: { key: 'SAUNA', translationKey: 'sauna', icon: Bath },
};

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
    <div className={cn('flex flex-wrap gap-2', className)}>
      {Object.entries(AMENITY_CONFIG).map(([key, { translationKey, icon: Icon }]) => {
        const active = selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border shadow-xs',
              active
                ? 'bg-teal-600 border-teal-600 text-white shadow-teal-900/20'
                : 'bg-stone-50 hover:bg-stone-100 dark:bg-white/5 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-white/10'
            )}
          >
            <Icon size={14} className={cn(active ? 'text-white' : 'text-teal-600 dark:text-teal-400')} />
            <span>{t(translationKey as any)}</span>
            {active && <Check size={12} strokeWidth={3} className="ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
