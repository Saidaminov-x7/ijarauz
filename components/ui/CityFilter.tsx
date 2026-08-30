"use client";

import { useState } from 'react';

export function CityFilter({ locale }: { locale: string }) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Список городов
  const cities = ["Ташкент", "Самарканд", "Бухара", "Хива", "Фергана", "Наманган"];

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-bold text-stone-900 dark:text-white">
        Популярные города
      </h2>
      <div className="flex flex-wrap gap-4">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`flex flex-col items-center justify-center rounded-xl border px-8 py-4 transition-all ${
              selectedCity === city
                ? 'border-primary-600 bg-primary-600/10 text-primary-600'
                : 'border-stone-200 hover:border-primary-600 dark:border-stone-800 dark:text-white'
            }`}
          >
            {/* Иконка локации (заглушка, если используешь lucide-react, можешь добавить <MapPin />) */}
            <svg className="mb-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{city}</span>
          </button>
        ))}
      </div>
    </div>
  );
}