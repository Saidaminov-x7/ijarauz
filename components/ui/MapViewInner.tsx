'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getDefaultMarkerIcon, patchLeafletDefaultIcon } from '@/lib/leaflet-icon';

interface MapViewInnerProps {
  lat: number;
  lng: number;
  label: string;
}

export default function MapViewInner({ lat, lng, label }: MapViewInnerProps) {
  const [ready, setReady] = useState(false);

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
      key={`${lat}-${lng}`}
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ height: '100%', width: '100%', minHeight: 288 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[lat, lng]} icon={icon}>
        <Popup>{label}</Popup>
      </Marker>
    </MapContainer>
  );
}
