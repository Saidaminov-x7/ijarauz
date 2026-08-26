'use client';

import { useTranslations } from 'next-intl';
import { MapWrapper } from '@/components/map/MapWrapper';

interface Apartment {
  id: string;
  title: string;
  price: number;
  location: string;
  latitude: number;
  longitude: number;
}

interface CatalogMapProps {
  locale: string;
  query?: string;
}

export function CatalogMap({ locale, query }: CatalogMapProps) {
  const t = useTranslations('catalog');

  // Mock data for apartments with coordinates
  const mockApartments: Apartment[] = [
    {
      id: '1',
      title: 'Современная квартира в центре',
      price: 1200,
      location: 'Ташкент, Юнусабадский район',
      latitude: 41.3112,
      longitude: 69.2797
    },
    {
      id: '2',
      title: 'Уютная студия рядом с метро',
      price: 800,
      location: 'Ташкент, Чиланзарский район',
      latitude: 41.2857,
      longitude: 69.2037
    },
    {
      id: '3',
      title: 'Просторная квартира с видом на парк',
      price: 1500,
      location: 'Ташкент, Мирабадский район',
      latitude: 41.3056,
      longitude: 69.2456
    },
    {
      id: '4',
      title: 'Квартира рядом с университетом',
      price: 950,
      location: 'Ташкент, Яккасарайский район',
      latitude: 41.3012,
      longitude: 69.2612
    },
    {
      id: '5',
      title: 'Квартира с евроремонтом',
      price: 1100,
      location: 'Ташкент, Шайхантахурский район',
      latitude: 41.3215,
      longitude: 69.2587
    }
  ];

  const filteredApartments = query
    ? mockApartments.filter(apt =>
        apt.title.toLowerCase().includes(query.toLowerCase()) ||
        apt.location.toLowerCase().includes(query.toLowerCase())
      )
    : mockApartments;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="hidden px-4 pt-3 pb-2 xl:block">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
          {t('mapTitle')}
        </h3>
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
          {t('mapSubtitle')}
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <MapWrapper
          apartments={filteredApartments}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}