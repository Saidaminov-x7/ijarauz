"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { MapPin, Search, Sparkles, Filter, Check, RotateCcw, Bell, X, Compass } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { ApartmentCard } from '@/app/[locale]/(main)/catalog/components/ApartmentCard';
import { AmenitiesFilter, AMENITY_CONFIG } from '@/app/[locale]/(main)/catalog/components/AmenitiesFilter';
import { getApartments } from '@/lib/api';
import { Apartment } from '@/types';
import { Dropdown } from '@/components/ui/Dropdown';
import { SavedSearchModal } from '@/components/search/SavedSearchModal';

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

const CITIES: Record<string, string[]> = {
  "Ташкент": [
    "Юнусабадский", "Чиланзарский", "Мирабадский", "Яккасарайский",
    "Мирзо-Улугбекский", "Шайхантахурский", "Алмазарский", "Сергелийский",
    "Учтепинский", "Яшнабадский", "Бектемирский", "Янгихаётский"
  ],
  "Самарканд": ["Центральный", "Сиабский", "Багишамальский"],
  "Бухара": ["Центральный", "Старый город"],
  "Фергана": ["Центральный", "Киргули"],
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'ru';

  // Read initial states from URL query params for full synchronization
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

  // Sync states when URL changes (e.g. from AI assistant or back/forward buttons)
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
    // Сохраняем сортировку в URL
    nextParams.set('sortBy', sortBy);
    nextParams.set('sortOrder', sortOrder);
    const qs = nextParams.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, sortBy, sortOrder]);

  // Check if any filter is active (to show/hide "Найдено: X объявлений")
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
        type: activeType !== 'all' ? activeType : undefined,
        audience: activeAudience !== 'all' ? activeAudience : undefined,
        forStudents: activeAudience === 'students',
        furnished: furnished ? true : undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
        sortOrder,
      });
      setApartments(data);

      // Если ничего не найдено, загружаем запасные рекомендации (без строгих ограничений)
      if (data.length === 0) {
        const fallback = await getApartments(locale, undefined, {
          city: selectedCity || undefined,
          limit: 6,
        });
        setRecommendations(fallback);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Failed to fetch apartments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [locale, activeType, activeAudience, selectedCity, selectedDistrict, minPrice, maxPrice, furnished, selectedAmenities, searchQuery, sortBy, sortOrder]);

  const handleAmenitiesChange = (amenities: string[]) => {
    setSelectedAmenities(amenities);
    updateUrlParams({ amenities: amenities.length > 0 ? amenities.join(',') : null });
  };

  const removeSingleAmenity = (key: string) => {
    const next = selectedAmenities.filter((a) => a !== key);
    setSelectedAmenities(next);
    updateUrlParams({ amenities: next.length > 0 ? next.join(',') : null });
  };

  const handleTypeChange = (typeId: string) => {
    setActiveType(typeId);
    updateUrlParams({ type: typeId });
  };

  const handleAudienceChange = (audId: string) => {
    setActiveAudience(audId);
    updateUrlParams({ audience: audId });
  };

  const handleCityClick = (city: string) => {
    if (selectedCity === city) {
      setSelectedCity(null);
      setSelectedDistrict(null);
      updateUrlParams({ city: null, district: null });
    } else {
      setSelectedCity(city);
      setSelectedDistrict(null); // Сбрасываем район при смене города
      updateUrlParams({ city, district: null });
    }
  };

  const handleDistrictClick = (district: string) => {
    const next = selectedDistrict === district ? null : district;
    setSelectedDistrict(next);
    updateUrlParams({ district: next });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchQuery });
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

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#121212]">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-stone-200 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-[#1A1A1A]/95">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                Каталог жилья
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Найдите подходящее жильё для аренды в Узбекистане
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1A1A1A]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-teal-600 dark:text-teal-400" />
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white">Фильтры</h2>
                </div>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors"
                  >
                    <RotateCcw size={12} />
                    Сбросить
                  </button>
                )}
              </div>

              {/* 1. Category / Property Type */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
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
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
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

              {/* 2. Target Audience / Кому подходит */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
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
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
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

              {/* 3. Location / Город и Районы */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                  Местоположение
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {Object.keys(CITIES).map((city) => {
                    const active = selectedCity === city;
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleCityClick(city)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-teal-600 text-white font-semibold'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>

                {selectedCity && CITIES[selectedCity] && (
                  <div className="mt-3 space-y-1 rounded-xl border border-stone-100 bg-stone-50/50 p-2 dark:border-white/5 dark:bg-white/5 max-h-44 overflow-y-auto">
                    <p className="px-2 py-1 text-[11px] font-semibold text-stone-400">Районы ({selectedCity}):</p>
                    {CITIES[selectedCity].map((district) => {
                      const active = selectedDistrict === district;
                      return (
                        <button
                          key={district}
                          type="button"
                          onClick={() => handleDistrictClick(district)}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                            active
                              ? 'bg-teal-50 text-teal-700 font-semibold dark:bg-teal-950/60 dark:text-teal-400'
                              : 'text-stone-600 hover:bg-white dark:text-stone-300 dark:hover:bg-white/10'
                          }`}
                        >
                          <span>{district}</span>
                          {active && <Check size={12} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Price Range */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
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
                    className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs text-stone-900 placeholder-stone-400 outline-none focus:border-teal-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      updateUrlParams({ maxPrice: e.target.value });
                    }}
                    placeholder="До ($)"
                    className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs text-stone-900 placeholder-stone-400 outline-none focus:border-teal-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>

              {/* 5. Amenities / Удобства */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                  Удобства
                </h3>
                <AmenitiesFilter
                  selected={selectedAmenities}
                  onChange={handleAmenitiesChange}
                />
              </div>

              {/* 6. Additional Checkboxes */}
              <div className="mb-6 space-y-2 border-t border-stone-100 pt-4 dark:border-white/5">
                <label className="flex items-center gap-2.5 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={furnished}
                    onChange={(e) => {
                      setFurnished(e.target.checked);
                      updateUrlParams({ furnished: e.target.checked ? 'true' : null });
                    }}
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                  />
                  С мебелью и техникой
                </label>
              </div>

              <Button
                onClick={fetchListings}
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md shadow-teal-900/20"
              >
                Показать результаты
              </Button>
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
                        className="hover:text-teal-900 dark:hover:text-white transition-colors"
                        title="Удалить фильтр"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Header with counter and sort dropdown */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {isFiltered ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                    Найдено: {apartments.length} {apartments.length === 1 ? 'объявление' : apartments.length < 5 ? 'объявления' : 'объявлений'}
                  </h2>
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                    по фильтрам
                  </span>
                </div>
              ) : (
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                  Все объявления
                </h2>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsSavedSearchModalOpen(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 shadow-xs hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-[#222222] dark:text-stone-300 transition-colors cursor-pointer"
                  title="Сохранить этот фильтр и получать уведомления"
                >
                  <Bell size={13} className="text-amber-500" />
                  Сохранить поиск
                </button>

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
              </div>
            </div>

            {/* Listings Grid with framer-motion Stagger Animation (C1) */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {apartments.map((apartment) => (
                  <motion.div key={apartment.id} variants={itemVariants}>
                    <ApartmentCard
                      apartment={apartment}
                      locale={locale}
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

                {/* Recommendations (Group A4) */}
                {recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-teal-600" />
                      Похожие варианты в этом регионе
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
