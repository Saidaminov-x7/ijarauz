'use client';

import { ApartmentCard } from '@/app/[locale]/(main)/catalog/components/ApartmentCard';

interface PopularListingsProps {
  locale: string;
}

export function PopularListings({ locale }: PopularListingsProps) {
  // Mock data for popular listings
  const popularListings = [
    {
      id: '1',
      title: 'Современная квартира в центре',
      price: 1200,
      location: 'Ташкент, Юнусабадский район',
      rooms: 2,
      area: 75,
      image: '/placeholder-apartment.jpg'
    },
    {
      id: '2',
      title: 'Уютная студия рядом с метро',
      price: 800,
      location: 'Ташкент, Чиланзарский район',
      rooms: 1,
      area: 45,
      image: '/placeholder-apartment.jpg'
    },
    {
      id: '3',
      title: 'Просторная квартира с видом на парк',
      price: 1500,
      location: 'Ташкент, Мирабадский район',
      rooms: 3,
      area: 95,
      image: '/placeholder-apartment.jpg'
    }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {popularListings.map((apartment) => (
          <ApartmentCard key={apartment.id} apartment={apartment} locale={locale} />
        ))}
      </div>
    </div>
  );
}