"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { MapPin, Search, Sparkles, Filter, Check, RotateCcw, Bell, X, Compass, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { ApartmentCard } from '@/app/[locale]/(main)/catalog/components/ApartmentCard';
import { AmenitiesFilter, AMENITY_CONFIG } from '@/app/[locale]/(main)/catalog/components/AmenitiesFilter';
import { getApartments } from '@/lib/api';
import { Apartment } from '@/types';
import { Dropdown } from '@/components/ui/Dropdown';
import { SavedSearchModal } from '@/components/search/SavedSearchModal';
import { CatalogMapView } from '@/components/ui/CatalogMapView';
import { regions, regionNames } from '@/lib/regions';

const CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'apartment', label: 'Квартиры' },
  { id: 'room', label: 'Комнаты' },
  { id: 'daily', label: 'Посуточно' },
  { id: 'house', label: 'Дома' },
];

const AUDIENCES = [
  { id: 'all', label: 'Для всех' },
  { id: 'students', label: 'Студентам' },
  { id: 'families', label: 'Для семей' },
  { id: 'girls', label: 'Девушкам' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function CatalogContent() {
  const t = useTranslations('catalog');
  const tAmenities = useTranslations('amenities');
  const params = useParams();
  const locale = (params?.locale as string) || 'ru';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial states from URL
  const typeParam = searchParams.get('type') || 'all';
  const audienceParam = searchParams.get('audience') || 'all';
  const cityParam = searchParams.get('city') || null;
  const districtParam = searchParams.get('district') || null;
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const furnishedParam = searchParams.get('furnished') === 'true';
  const queryParam = searchParams.get('q') || '';
  const amenitiesParam = searchParams.get('amenities')?.split(',').filter(Boolean) || [];

  const [activeType, setActiveType] = useState<string>(typeParam);
  const [activeAudience, setActiveAudience] = useState<string>(audienceParam);
  const [selectedCity, setSelectedCity] = useState<string | null>(cityParam);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(districtParam);
  const [minPrice, setMinPrice] = useState<string>(minPriceParam || '');
  const [maxPrice, setMaxPrice] = useState<string>(maxPriceParam || '');
  const [furnished, setFurnished] = useState<boolean>(furnishedParam);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(amenitiesParam);
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'viewsCount'>(
    (searchParams.get('sortBy') as 'createdAt' | 'price' | 'viewsCount') || 'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [recommendations, setRecommendations] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavedSearchModalOpen, setIsSavedSearchModalOpen] = useState(false);
  const [showCatalogMap, setShowCatalogMap] = useState(false);

  // Скрытие и раскрытие фильтров
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Sync states when URL changes
  useEffect(() => {
    setActiveType(searchParams.get('type') || 'all');
    setActiveAudience(searchParams.get('audience') || 'all');
    setSelectedCity(searchParams.get('city') || null);
    setSelectedDistrict(searchParams.get('district') || null);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setFurnished(searchParams.get('furnished') === 'true');
    setSelectedAmenities(searchParams.get('amenities')?.split(',').filter(Boolean) || []);
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Update URL params helper
  const updateUrlParams = useCallback((updates: Record<string, string | null | undefined>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '' || val === 'all' || val === 'false') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });
    nextParams.set('sortBy', sortBy);
    nextParams.set('sortOrder', sortOrder);
    const qs = nextParams.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, sortBy, sortOrder]);

  const isFiltered = !!(
    (activeType && activeType !== 'all') ||
    (activeAudience && activeAudience !== 'all') ||
    selectedCity ||
    selectedDistrict ||
    minPrice ||
    maxPrice ||
    furnished ||
    selectedAmenities.length > 0 ||
    searchQuery
  );

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await getApartments(locale, searchQuery || undefined, {
        city: selectedCity || undefined,
        district: selectedDistrict || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        type: activeType,
        audience: activeAudience,
        amenities: selectedAmenities.length > 0 ? selectedAmenities.join(',') : undefined,
        page: 1,
        limit: 50,
      });

      let sorted = [...data];
      if (sortBy === 'price') {
        sorted.sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : b.price - a.price));
      } else if (sortBy === 'viewsCount') {
        sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      }

      setApartments(sorted);

      if (sorted.length === 0) {
        const recs = await getApartments(locale, undefined, { limit: 8 });
        setRecommendations(recs);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Error loading listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCity, selectedDistrict, activeType, activeAudience, minPrice, maxPrice, furnished, selectedAmenities, searchQuery, sortBy, sortOrder, locale]);

  const handleTypeChange = (typeId: string) => {
    setActiveType(typeId);
    updateUrlParams({ type: typeId });
  };

  const handleAudienceChange = (audId: string) => {
    setActiveAudience(audId);
    updateUrlParams({ audience: audId });
  };

  const handleAmenitiesChange = (newAmenities: string[]) => {
    setSelectedAmenities(newAmenities);
    updateUrlParams({ amenities: newAmenities.length > 0 ? newAmenities.join(',') : null });
  };

  const removeSingleAmenity = (key: string) => {
    const next = selectedAmenities.filter((a) => a !== key);
    setSelectedAmenities(next);
    updateUrlParams({ amenities: next.length > 0 ? next.join(',') : null });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchQuery || null });
  };

  const handleReset = () => {
    setActiveType('all');
    setActiveAudience('all');
    setSelectedCity(null);
    setSelectedDistrict(null);
    setMinPrice('');
    setMaxPrice('');
    setFurnished(false);
    setSelectedAmenities([]);
    setSearchQuery('');
    router.push(pathname, { scroll: false });
  };

  // Опции для кастомных выпадающих списков городов и районов
  const cityOptions = regionNames.map((c) => ({ value: c, label: c }));
  const districtOptions = (selectedCity && regions[selectedCity])
    ? regions[selectedCity].map((d) => ({ value: d, label: d }))
    : [];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-[#121212] dark:text-stone-100 transition-colors duration-200">
      {/* Top Banner / Breadcrumb area */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md dark:border-white/5 dark:bg-[#181818]/80 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-white">
                Каталог аренды недвижимости
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Найдите идеальное жильё для комфортной жизни в Узбекистане
              </p>
            </div>

            {/* Quick search input in header */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative max-w-sm flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по району, метро или улице..."
                className="h-10 w-full rounded-xl border border-stone-200 bg-stone-100/70 pl-9 pr-4 text-xs text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-teal-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-teal-500/50"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filters Sidebar with Toggle */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1A1A1A]">
              {/* Кнопка скрытия/раскрытия меню фильтров */}
              <div
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center justify-between cursor-pointer select-none py-1"
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-teal-600 dark:text-teal-400" />
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white">Фильтры</h2>
                </div>
                <div className="flex items-center gap-2">
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors mr-1"
                    >
                      <RotateCcw size={12} />
                      Сбросить
                    </button>
                  )}
                  <ChevronDown
                    size={18}
                    className={`text-stone-400 transition-transform duration-300 ${isFiltersOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {/* Плавно скрываемое тело фильтров */}
              <AnimatePresence initial={false}>
                {isFiltersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden pt-4 space-y-6"
                  >
                    {/* 1. Category / Property Type */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
                        Тип жилья
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((cat) => {
                          const active = activeType === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleTypeChange(cat.id)}
                              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                active
                                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-700/30'
                                  : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10'
                              }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Target Audience */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
                        Для кого
                      </h3>
                      <div className="grid grid-cols-2 gap-1.5">
                        {AUDIENCES.map((aud) => {
                          const active = activeAudience === aud.id;
                          return (
                            <button
                              key={aud.id}
                              type="button"
                              onClick={() => handleAudienceChange(aud.id)}
                              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                                active
                                  ? 'bg-teal-600 text-white font-semibold shadow-sm'
                                  : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10'
                              }`}
                            >
                              <span>{aud.label}</span>
                              {active && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Location: Кастомные умные дропдауны как при смене языка */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        Местоположение
                      </h3>
                      
                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">
                          Город / Область:
                        </label>
                        <Dropdown
                          value={selectedCity || ''}
                          onChange={(val) => {
                            setSelectedCity(val || null);
                            setSelectedDistrict(null);
                            updateUrlParams({ city: val || null, district: null });
                          }}
                          options={cityOptions}
                          placeholder="Все регионы Узбекистана"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">
                          Район:
                        </label>
                        <Dropdown
                          disabled={!selectedCity || districtOptions.length === 0}
                          disabledPlaceholder="Сначала выберите город выше"
                          value={selectedDistrict || ''}
                          onChange={(val) => {
                            setSelectedDistrict(val || null);
                            updateUrlParams({ district: val || null });
                          }}
                          options={districtOptions}
                          placeholder="Все районы"
                        />
                      </div>
                    </div>

                    {/* 4. Price Range */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
                        Цена ($ / месяц)
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => {
                            setMinPrice(e.target.value);
                            updateUrlParams({ minPrice: e.target.value });
                          }}
                          placeholder="От ($)"
                          className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-900 placeholder-stone-400 outline-none focus:border-teal-500 dark:border-white/10 dark:bg-[#1E1E1E] dark:text-white"
                        />
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => {
                            setMaxPrice(e.target.value);
                            updateUrlParams({ maxPrice: e.target.value });
                          }}
                          placeholder="До ($)"
                          className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-900 placeholder-stone-400 outline-none focus:border-teal-500 dark:border-white/10 dark:bg-[#1E1E1E] dark:text-white"
                        />
                      </div>
                    </div>

                    {/* 5. Удобства: интерактивные кнопки с иконками */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
                        Удобства
                      </h3>
                      <AmenitiesFilter
                        selected={selectedAmenities}
                        onChange={handleAmenitiesChange}
                      />
                    </div>

                    <Button
                      onClick={fetchListings}
                      className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-900/20 cursor-pointer"
                    >
                      Показать результаты
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Listings Main Section */}
          <div className="flex-1 min-w-0">
            {/* Active removable amenity tags */}
            {selectedAmenities.length > 0 && (
              <div className="mb-4 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-stone-400">Выбрано:</span>
                {selectedAmenities.map((key) => {
                  const item = AMENITY_CONFIG[key];
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800/40"
                    >
                      <span>{item ? tAmenities(item.translationKey as any) : key}</span>
                      <button
                        type="button"
                        onClick={() => removeSingleAmenity(key)}
                        className="hover:text-teal-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Удалить фильтр"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Header: Сортировка СЛЕВА, заголовок и счетчик СПРАВА */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {/* Сортировка и кнопка сохранения поиска слева */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-48">
                  <Dropdown
                    value={`${sortBy}:${sortOrder}`}
                    onChange={(value) => {
                      const [nextSortBy, nextSortOrder] = value.split(':') as ['createdAt' | 'price' | 'viewsCount', 'asc' | 'desc'];
                      setSortBy(nextSortBy);
                      setSortOrder(nextSortOrder);
                    }}
                    options={[
                      { value: 'createdAt:desc', label: 'Сначала новые' },
                      { value: 'createdAt:asc', label: 'Сначала старые' },
                      { value: 'viewsCount:desc', label: 'По популярности' },
                      { value: 'price:asc', label: 'По цене (дешевле)' },
                      { value: 'price:desc', label: 'По цене (дороже)' },
                    ]}
                    placeholder="Сортировка"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsSavedSearchModalOpen(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 shadow-xs hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-[#1E1E1E] dark:text-stone-300 transition-colors cursor-pointer"
                  title="Сохранить этот фильтр и получать уведомления"
                >
                  <Bell size={13} className="text-amber-500" />
                  Сохранить
                </button>
              </div>

              {/* Заголовок Все объявления / Найдено X справа + кнопка карты */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Кнопка Показать / Скрыть карту */}
                <button
                  type="button"
                  onClick={() => setShowCatalogMap(!showCatalogMap)}
                  className="inline-flex h-9 items-center gap-1.5 px-3 rounded-xl border border-teal-600/30 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition-all cursor-pointer shadow-xs"
                >
                  <MapPin size={13} className="text-teal-600 dark:text-teal-400" />
                  {showCatalogMap ? 'Скрыть карту' : 'Показать на карте'}
                </button>

                {isFiltered ? (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                      Найдено: {apartments.length}
                    </h2>
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                      по фильтрам
                    </span>
                  </div>
                ) : (
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                    Все объявления ({apartments.length})
                  </h2>
                )}
              </div>
            </div>

            {/* Интерактивная карта всех объявлений */}
            {showCatalogMap && (
              <div className="mb-6">
                <CatalogMapView apartments={apartments} locale={locale} />
              </div>
            )}

            {/* Сетка в 4 ряда (grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4) */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-stone-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] overflow-hidden">
                    <div className="aspect-4/3 bg-stone-200 dark:bg-stone-800" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
                      <div className="h-3 bg-stone-100 dark:bg-stone-850 rounded w-1/2" />
                      <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/3 pt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : apartments.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                {apartments.map((apartment) => (
                  <motion.div key={apartment.id} variants={itemVariants}>
                    <ApartmentCard
                      apartment={apartment}
                      locale={locale}
                      activeAmenities={selectedAmenities}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Empty State Card */}
                <div className="rounded-2xl border border-stone-200/80 bg-white p-10 text-center dark:border-white/10 dark:bg-[#1A1A1A]">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
                    <Compass size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">
                    По заданным фильтрам ничего не найдено
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-5">
                    Попробуйте смягчить условия поиска, убрать часть удобств или сбросить фильтры
                  </p>
                  <Button onClick={handleReset} variant="outline" className="rounded-xl">
                    <RotateCcw size={14} className="mr-2" />
                    Сбросить все фильтры
                  </Button>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-teal-600" />
                      Похожие варианты в этом регионе
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                      {recommendations.map((item) => (
                        <ApartmentCard key={item.id} apartment={item} locale={locale} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Модальное окно автопоиска */}
      <SavedSearchModal
        isOpen={isSavedSearchModalOpen}
        onClose={() => setIsSavedSearchModalOpen(false)}
      />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 dark:bg-[#121212] p-8" />}>
      <CatalogContent />
    </Suspense>
  );
}
