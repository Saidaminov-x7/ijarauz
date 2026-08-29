'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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

function createCustomPriceMarker(price: number) {
  return L.divIcon({
    className: 'custom-map-price-marker',
    html: `
      <div style="
        background: #0d9488;
        color: #ffffff;
        font-weight: 800;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
      ">
        <span>$${price}</span>
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
    popupAnchor: [0, -14],
  });
}

export default function CatalogMapInner({ apartments, locale }: CatalogMapProps) {
  const [ready, setReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setReady(true);
  }, []);

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

  if (!ready) {
    return (
      <div className="flex h-full min-h-[22rem] w-full items-center justify-center bg-stone-100 text-sm text-stone-400 dark:bg-white/5 dark:text-stone-500">
        Загрузка интерактивной карты объявлений…
      </div>
    );
  }

  // Премиальные тайлы Carto Voyager (светлая тема) и Carto Dark Matter (тёмная тема)
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

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
          url={tileUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {markers.map((apt) => (
          <Marker
            key={apt.id}
            position={apt.position}
            icon={createCustomPriceMarker(apt.price)}
          >
            <Popup className="custom-popup">
              <div className="p-1 space-y-2 max-w-[210px]">
                {apt.image && (
                  <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-stone-100">
                    <img
                      src={apt.image}
                      alt={apt.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-1">
                  {apt.title}
                </h4>
                <p className="text-[11px] text-stone-500 line-clamp-1">
                  {apt.district || apt.city || 'Ташкент'}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="text-xs font-black text-teal-600">
                    ${apt.price}/мес
                  </span>
                  <Link
                    href={`/${locale}/catalog/${apt.id}`}
                    className="text-[11px] font-bold px-3 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
                  >
                    Смотреть
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
