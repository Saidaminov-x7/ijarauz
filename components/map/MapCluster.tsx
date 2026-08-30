'use client';

import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTheme } from 'next-themes';
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
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
      key={resolvedTheme}
      center={tashkentCenter}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', minHeight: 256 }}
      className={`rounded-lg ${className}`}
    >
      <TileLayer
        url={
          isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
        attribution={
          isDark
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
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
              <p className="mt-1 font-bold text-primary-600">${apartment.price}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
