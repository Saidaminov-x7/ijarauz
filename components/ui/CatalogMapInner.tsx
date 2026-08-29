'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { getDefaultMarkerIcon, patchLeafletDefaultIcon } from '@/lib/leaflet-icon';
import type { Apartment } from '@/types';

interface CatalogMapProps {
  apartments: Apartment[];
  locale: string;
}

const CITY_DEFAULT_CENTERS: Record<string, [number, number]> = {
  "Город Ташкент": [41.2995, 69.2401],
  Ташкент: [41.2995, 69.2401],
  Самарканд: [39.627, 66.975],
  Бухара: [39.7747, 64.4286],
  Фергана: [40.3834, 71.7842],
  Андижан: [40.7821, 72.3442],
  Наманган: [40.9983, 71.6726],
};

export default function CatalogMapInner({ apartments, locale }: CatalogMapProps) {
  const [ready, setReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    patchLeafletDefaultIcon();
    setReady(true);
  }, []);

  const icon = useMemo(() => (ready ? getDefaultMarkerIcon() : null), [ready]);

  const markers = useMemo(() => {
    return apartments.map((apt, idx) => {
      const baseCenter = CITY_DEFAULT_CENTERS[apt.city || 'Ташкент'] || CITY_DEFAULT_CENTERS.Ташкент;
      const latOffset = ((idx % 7) - 3) * 0.012 + (apt.rooms ? apt.rooms * 0.003 : 0);
      const lngOffset = (((idx * 3) % 7) - 3) * 0.015;
      const lat = (apt as any).lat || (apt as any).coordinates?.lat || baseCenter[0] + latOffset;
      const lng = (apt as any).lng || (apt as any).coordinates?.lng || baseCenter[1] + lngOffset;
      return {
        ...apt,
        position: [lat, lng] as [number, number],
      };
    });
  }, [apartments]);

  const defaultCenter = markers[0]?.position || [41.2995, 69.2401];

  if (!ready || !icon) {
    return (
      <div className="flex h-full min-h-[22rem] w-full items-center justify-center bg-stone-100 text-sm text-stone-400 dark:bg-white/5 dark:text-stone-500">
        Загрузка интерактивной карты объявлений…
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer
        key={`catalog-map-${resolvedTheme}-${markers.length}`}
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%', minHeight: 350 }}
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
        {markers.map((apt) => (
          <Marker key={apt.id} position={apt.position} icon={icon}>
            <Popup className="custom-popup">
              <div className="p-1 space-y-1.5 max-w-[200px]">
                {apt.image && (
                  <img
                    src={apt.image}
                    alt={apt.title}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                )}
                <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-1">
                  {apt.title}
                </h4>
                <p className="text-[11px] text-stone-500 line-clamp-1">
                  {apt.district || apt.city || 'Ташкент'}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-black text-teal-600">
                    ${apt.price}/мес
                  </span>
                  <Link
                    href={`/${locale}/catalog/${apt.id}`}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Открыть →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
