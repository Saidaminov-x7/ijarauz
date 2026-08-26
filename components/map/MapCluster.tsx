'use client';

import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getDefaultMarkerIcon } from '@/lib/leaflet-icon';

interface Apartment {
  id: string;
  title: string;
  price: number;
  location: string;
  latitude: number;
  longitude: number;
}

interface MapClusterProps {
  apartments: Apartment[];
  onMarkerClick?: (id: string) => void;
  className?: string;
}

export default function MapCluster({ apartments, onMarkerClick, className = '' }: MapClusterProps) {
  const [ready] = useState(true);
  const tashkentCenter = useMemo(() => ({ lat: 41.2995, lng: 69.2401 }), []);

  const icon = useMemo(() => (ready ? getDefaultMarkerIcon() : null), [ready]);

  if (!ready || !icon) {
    return <div className={`h-full min-h-64 w-full rounded-lg bg-stone-100 dark:bg-white/5 ${className}`} />;
  }

  const points = apartments.filter(
    (a) => Number.isFinite(a.latitude) && Number.isFinite(a.longitude)
  );

  return (
    <MapContainer
      center={tashkentCenter}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', minHeight: 256 }}
      className={`rounded-lg ${className}`}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {points.map((apartment) => (
        <Marker
          key={apartment.id}
          position={[apartment.latitude, apartment.longitude]}
          icon={icon}
          eventHandlers={
            onMarkerClick
              ? { click: () => onMarkerClick(apartment.id) }
              : undefined
          }
        >
          <Popup>
            <div className="min-w-45">
              <h3 className="font-semibold">{apartment.title}</h3>
              <p className="text-sm text-stone-600">{apartment.location}</p>
              <p className="mt-1 font-bold text-teal-600">${apartment.price}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
