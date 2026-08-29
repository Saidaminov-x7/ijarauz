'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTheme } from 'next-themes';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapViewInnerProps {
  lat: number;
  lng: number;
  label: string;
}

const customListingMarker = L.divIcon({
  className: 'custom-listing-marker',
  html: `
    <div style="
      background: #0d9488;
      color: #ffffff;
      padding: 8px;
      border-radius: 50%;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.45);
      border: 3px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      transform: translate(-50%, -50%);
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

export default function MapViewInner({ lat, lng, label }: MapViewInnerProps) {
  const [ready, setReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex h-full min-h-[18rem] w-full items-center justify-center bg-stone-100 text-sm text-stone-400 dark:bg-white/5 dark:text-stone-500">
        Загрузка карты…
      </div>
    );
  }

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <MapContainer
      key={`${lat}-${lng}-${resolvedTheme}`}
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ height: '100%', width: '100%', minHeight: 288 }}
    >
      <TileLayer
        url={tileUrl}
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={[lat, lng]} icon={customListingMarker}>
        <Popup className="custom-popup">
          <div className="p-1 font-bold text-xs text-stone-900">{label}</div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
