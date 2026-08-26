'use client';

import dynamic from 'next/dynamic';

// Динамический импорт с ssr:false — react-leaflet использует window/document
// и не может рендериться на сервере. Это же снижает начальный бандл (code splitting).
const MapViewInner = dynamic(() => import('./MapViewInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-stone-100 text-sm text-stone-400 dark:bg-white/5 dark:text-stone-500">
      Загрузка карты…
    </div>
  ),
});

interface MapViewProps {
  lat: number;
  lng: number;
  label: string;
}

export function MapView({ lat, lng, label }: MapViewProps) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl border border-stone-200/80 dark:border-white/5">
      <MapViewInner lat={lat} lng={lng} label={label} />
    </div>
  );
}
