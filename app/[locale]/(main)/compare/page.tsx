'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Scale, Trash2, ShieldCheck, MapPin, ArrowRight, Building, Check, X } from 'lucide-react';
import { useCompareStore } from '@/store/useCompareStore';
import { getApartmentById } from '@/lib/api';
import { Apartment } from '@/types';

export default function ComparePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ru';
  const { ids, remove, clear } = useCompareStore();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApartments() {
      if (ids.length === 0) {
        setApartments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          ids.map((id) => getApartmentById(String(id)))
        );
        setApartments(results.filter((a): a is Apartment => a !== null));
      } catch (err) {
        console.error('Failed to load apartments for comparison', err);
      } finally {
        setLoading(false);
      }
    }

    loadApartments();
  }, [ids]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        <p className="mt-4 text-stone-500">Загрузка сравнения объектов...</p>
      </div>
    );
  }

  if (apartments.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
          <Scale size={36} />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-stone-900 dark:text-white">
          Список сравнения пуст
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          Добавляйте понравившиеся объявления в сравнение, нажимая на иконку весов на карточках объектов.
        </p>
        <div className="mt-8">
          <Link
            href={`/${locale}/catalog`}
            className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition-transform hover:-translate-y-0.5 hover:bg-teal-700"
          >
            Перейти в каталог <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const allAmenities = Array.from(
    new Set(apartments.flatMap((apt) => apt.amenities || []))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white flex items-center gap-3">
            <Scale className="text-teal-600" size={30} />
            Сравнение объявлений ({apartments.length})
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Сопоставьте характеристики объектов для выбора лучшего варианта
          </p>
        </div>
        <button
          onClick={clear}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
        >
          <Trash2 size={14} /> Очистить список
        </button>
      </div>

      {/* Comparison Grid Table */}
      <div className="mt-8 overflow-x-auto pb-6">
        <div className="min-w-[700px]">
          {/* Card Headers Row */}
          <div className="grid grid-cols-5 gap-4 pb-6 border-b border-stone-200/80 dark:border-white/10">
            <div className="col-span-1 font-semibold text-stone-400 dark:text-stone-500 self-end pb-2">
              Объект
            </div>
            {apartments.map((apt) => (
              <div key={apt.id} className="relative flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-[#222222]">
                <button
                  onClick={() => remove(apt.id)}
                  title="Удалить из сравнения"
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-rose-600 transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="aspect-4/3 overflow-hidden rounded-xl bg-stone-100 dark:bg-white/5">
                  {apt.image ? (
                    <img src={apt.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-300">
                      <Building size={24} />
                    </div>
                  )}
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xs font-bold text-stone-900 dark:text-white line-clamp-2">
                    {apt.title}
                  </h3>
                  <div className="mt-1 text-sm font-black text-teal-600 dark:text-teal-400">
                    ${apt.price} <span className="text-[10px] font-normal text-stone-400">/мес</span>
                  </div>
                  <Link
                    href={`/${locale}/catalog/${apt.id}`}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-stone-100 py-1.5 text-[11px] font-semibold text-stone-800 hover:bg-teal-600 hover:text-white transition-colors dark:bg-white/10 dark:text-white"
                  >
                    Перейти <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Parameters Rows */}
          <div className="divide-y divide-stone-100 text-sm dark:divide-white/5">
            {/* Price */}
            <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
              <span className="col-span-1 font-medium text-stone-500 dark:text-stone-400">Цена</span>
              {apartments.map((apt) => (
                <span key={apt.id} className="font-bold text-stone-900 dark:text-white">
                  ${apt.price} / мес
                </span>
              ))}
            </div>

            {/* City & District */}
            <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
              <span className="col-span-1 font-medium text-stone-500 dark:text-stone-400">Расположение</span>
              {apartments.map((apt) => (
                <span key={apt.id} className="flex items-center gap-1 text-stone-700 dark:text-stone-300">
                  <MapPin size={14} className="text-teal-500 shrink-0" />
                  {apt.district || apt.city || apt.location}
                </span>
              ))}
            </div>

            {/* Rooms */}
            <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
              <span className="col-span-1 font-medium text-stone-500 dark:text-stone-400">Комнаты</span>
              {apartments.map((apt) => (
                <span key={apt.id} className="font-semibold text-stone-800 dark:text-stone-200">
                  {apt.rooms} комн.
                </span>
              ))}
            </div>

            {/* Area */}
            <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
              <span className="col-span-1 font-medium text-stone-500 dark:text-stone-400">Площадь</span>
              {apartments.map((apt) => (
                <span key={apt.id} className="font-semibold text-stone-800 dark:text-stone-200">
                  {apt.area} м²
                </span>
              ))}
            </div>

            {/* Floor */}
            <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
              <span className="col-span-1 font-medium text-stone-500 dark:text-stone-400">Этаж</span>
              {apartments.map((apt) => (
                <span key={apt.id} className="text-stone-700 dark:text-stone-300">
                  {apt.floor ? `${apt.floor}${apt.totalFloors ? `/${apt.totalFloors}` : ''} эт.` : '—'}
                </span>
              ))}
            </div>

            {/* Verification */}
            <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
              <span className="col-span-1 font-medium text-stone-500 dark:text-stone-400">Проверено Ijarauz</span>
              {apartments.map((apt) => (
                <span key={apt.id}>
                  {apt.isVerified || apt.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
                      <ShieldCheck size={16} /> Да
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">Нет</span>
                  )}
                </span>
              ))}
            </div>

            {/* Amenities Checklist */}
            {allAmenities.map((amenity) => (
              <div key={amenity} className="grid grid-cols-5 gap-4 py-3 items-center">
                <span className="col-span-1 text-xs font-medium text-stone-500 dark:text-stone-400 capitalize">
                  {amenity.replace(/_/g, ' ').toLowerCase()}
                </span>
                {apartments.map((apt) => {
                  const has = (apt.amenities || []).includes(amenity);
                  return (
                    <span key={apt.id}>
                      {has ? (
                        <Check size={16} className="text-teal-600" />
                      ) : (
                        <span className="text-stone-300 dark:text-stone-700">—</span>
                      )}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
