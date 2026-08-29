'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTheme } from 'next-themes';
import 'leaflet/dist/leaflet.css';
import { getDefaultMarkerIcon, patchLeafletDefaultIcon } from '@/lib/leaflet-icon';

interface MapViewInnerProps {
  lat: number;
  lng: number;
  label: string;
}

export default function MapViewInner({ lat, lng, label }: MapViewInnerProps) {
  const [ready, setReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    patchLeafletDefaultIcon();
    setReady(true);
  }, []);

  const icon = useMemo(() => (ready ? getDefaultMarkerIcon() : null), [ready]);

  if (!ready || !icon) {
    return (
      <div className="flex h-full min-h-[18rem] w-full items-center justify-center bg-stone-100 text-sm text-stone-400 dark:bg-white/5 dark:text-stone-500">
        …
      </div>
    );
  }

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
      <Marker position={[lat, lng]} icon={icon}>
        <Popup>{label}</Popup>
      </Marker>
    </MapContainer>
  );
}
