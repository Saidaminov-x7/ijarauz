'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Eye, EyeOff, ExternalLink } from 'lucide-react';

const MapViewInner = dynamic(() => import('./MapViewInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-stone-100 text-sm text-stone-400 dark:bg-white/5 dark:text-stone-500">
      Загрузка интерактивной карты…
    </div>
  ),
});

interface MapViewProps {
  lat: number;
  lng: number;
  label: string;
}

export function MapView({ lat, lng, label }: MapViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const yandexMapsUrl = `https://yandex.ru/maps/?rtext=~${lat}%2C${lng}&rtt=auto`;

  return (
    <div className="space-y-3">
      {/* Контейнер карты с блюром и кнопками */}
      <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-stone-200/80 dark:border-white/10 shadow-sm bg-stone-100 dark:bg-[#121212]">
        {/* Кнопка "Скрыть карту" в правом верхнем углу (когда открыта) */}
        {isRevealed && (
          <button
            type="button"
            onClick={() => setIsRevealed(false)}
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <EyeOff size={14} />
            <span>Скрыть карту</span>
          </button>
        )}

        {/* Карта Leaflet */}
        <div className={`h-full w-full transition-all duration-300 ${!isRevealed ? 'filter blur-md scale-105 pointer-events-none opacity-60' : ''}`}>
          <MapViewInner lat={lat} lng={lng} label={label} />
        </div>

        {/* Затемнение и центральная кнопка "Показать на карте" (когда закрыта) */}
        {!isRevealed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-900/30 dark:bg-black/50 backdrop-blur-xs p-4 text-center">
            <div className="p-3 bg-teal-600/90 text-white rounded-2xl mb-3 shadow-lg animate-bounce">
              <MapPin size={26} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1 drop-shadow-md">
              Интерактивная карта дома
            </h4>
            <p className="text-xs text-stone-200 mb-3 max-w-xs drop-shadow-sm">
              Нажмите для просмотра точного расположения, инфраструктуры и ближайшего метро
            </p>
            <button
              type="button"
              onClick={() => setIsRevealed(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 transition-all transform hover:scale-105 cursor-pointer"
            >
              <Eye size={15} />
              <span>Показать на карте</span>
            </button>
          </div>
        )}
      </div>

      {/* Кнопка "Построить маршрут до адреса" (Google Maps & Яндекс Карты) */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/30 transition-all cursor-pointer shadow-xs"
        >
          <Navigation size={14} className="text-teal-600 dark:text-teal-400" />
          <span>Построить маршрут в Google Maps</span>
          <ExternalLink size={12} className="opacity-70" />
        </a>

        <a
          href={yandexMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30 transition-all cursor-pointer shadow-xs"
        >
          <Navigation size={14} className="text-amber-600 dark:text-amber-400" />
          <span>Построить в Яндекс Картах</span>
          <ExternalLink size={12} className="opacity-70" />
        </a>
      </div>
    </div>
  );
}
