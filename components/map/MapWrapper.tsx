'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

interface Apartment {
  id: string;
  title: string;
  price: number;
  location: string;
  latitude: number;
  longitude: number;
}

interface MapWrapperProps {
  apartments: Apartment[];
  onMarkerClick?: (id: string) => void;
  className?: string;
}

const MapCluster = dynamic(() => import('./MapCluster'), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-[16rem] w-full rounded-lg" />,
});

export function MapWrapper({ apartments, onMarkerClick, className = '' }: MapWrapperProps) {
  return (
    <MapCluster apartments={apartments} onMarkerClick={onMarkerClick} className={className} />
  );
}
