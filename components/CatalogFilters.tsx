'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterType, type Listing } from '@/lib/data';
import { regions, regionNames, regionToCity } from '@/lib/regions';
import { ListingCard } from '@/components/ListingCard';
import { Dropdown } from '@/components/ui/Dropdown';

const TYPES: { value: FilterType | 'all'; label: string }[] = [
  { value: 'all',       label: 'Все'        },
  { value: 'apartment', label: 'Квартиры'   },
  { value: 'room',      label: 'Комнаты'    },
  { value: 'daily',     label: 'Посуточно'  },
];

function usePageSize() {
  const [size, setSize] = useState(9);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w >= 1024) setSize(18);
      else if (w >= 640) setSize(15);
      else setSize(9);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return size;
}

export function CatalogFilters({ locale }: { locale: string }) {
  const searchParams = useSearchParams();

  const [type,      setType]      = useState<FilterType | 'all'>('all');
  const [region,    setRegion]    = useState('');
  const [district,  setDistrict]  = useState('');
  const [minPrice,  setMinPrice]  = useState('');
  const [maxPrice,  setMaxPrice]  = useState('');
  const [furnished, setFurnished] = useState(false);
  const [students,  setStudents]  = useState(false);
  const [page,       setPage]     = useState(1);
  const [hasFilter,  setHasFilter] = useState(false);

  const pageSize = usePageSize();

  // Инициализация из URL (?category=students|daily, ?furnished=1)
  useEffect(() => {
    const category   = searchParams.get('category');
    const furnishedQ = searchParams.get('furnished');
    const handle = requestAnimationFrame(() => {
      let touched = false;
      if (category === 'students') { setStudents(true); touched = true; }
      if (category === 'daily')    { setType('daily');  touched = true; }
      if (furnishedQ === '1')      { setFurnished(true); touched = true; }
      if (touched) setHasFilter(true);
    });
    return () => cancelAnimationFrame(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const districts = region ? (regions[region] ?? []) : [];

  const filtered = useMemo(() => {
    const listings: Listing[] = [];
    return listings.filter(l => {
      if (type !== 'all' && l.type !== type) return false;
      if (region) {
        const city = regionToCity[region];
        if (!city || l.city !== city) return false;
      }
      if (district && !l.district.includes(district.replace(/\s*район$/i, ''))) return false;
      if (minPrice && l.price < parseInt(minPrice)) return false;
      if (maxPrice && l.price > parseInt(maxPrice)) return false;
      if (furnished && !l.furnished) return false;
      if (students && !l.forStudents) return false;
      return true;
    });
  }, [type, region, district, minPrice, maxPrice, furnished, students]);

  // Сброс страницы при смене фильтров/размера страницы
  useEffect(() => {
    const handle = requestAnimationFrame(() => setPage(1));
    return () => cancelAnimationFrame(handle);
  }, [type, region, district, minPrice, maxPrice, furnished, students, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems   = filtered.slice((page - 1) * pageSize, page * pageSize);

  const setTypeAndFlag  = (v: FilterType | 'all') => { setType(v); setHasFilter(true); };
  const setRegionAndFlag = (v: string) => { setRegion(v); setDistrict(''); setHasFilter(true); };

  const reset = () => {
    setType('all'); setRegion(''); setDistrict('');
    setMinPrice(''); setMaxPrice(''); setFurnished(false); setStudents(false);
    setHasFilter(false);
  };

  const regionOptions   = regionNames.map(r => ({ value: r, label: r }));
  const districtOptions = districts.map(d => ({ value: d, label: d }));

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

      {/* Панель фильтров — стики на десктопе */}
      <aside className="w-full shrink-0 lg:w-72 xl:w-80">
        <div className="lg:sticky lg:top-20 rounded-2xl border border-stone-200/80 bg-white p-5 dark:border-white/5 dark:bg-[#222222] space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-white">Фильтры</h2>
            <button type="button" onClick={reset}
              className="text-xs text-teal-600 hover:underline dark:text-teal-400">
              Сбросить
            </button>
          </div>

          {/* Тип жилья */}
          <div>
            <label className="mb-2 block text-xs font-medium text-stone-500 dark:text-stone-400">Тип жилья</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setTypeAndFlag(value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    type === value
                      ? 'border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-600 dark:bg-teal-950/60 dark:text-teal-300'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300 dark:border-white/10 dark:text-stone-400 dark:hover:border-white/20'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Регион */}
          <div>
            <label className="mb-2 block text-xs font-medium text-stone-500 dark:text-stone-400">Регион</label>
            <Dropdown
              value={region}
              onChange={setRegionAndFlag}
              options={regionOptions}
              placeholder="Выберите регион"
            />
          </div>

          {/* Район */}
          <div>
            <label className="mb-2 block text-xs font-medium text-stone-500 dark:text-stone-400">Район</label>
            <Dropdown
              value={district}
              onChange={(v) => { setDistrict(v); setHasFilter(true); }}
              options={districtOptions}
              placeholder="Выберите район"
              disabled={!region}
              disabledPlaceholder="Сначала выберите регион"
            />
          </div>

          {/* Цена */}
          <div>
            <label className="mb-2 block text-xs font-medium text-stone-500 dark:text-stone-400">Цена ($/мес)</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" placeholder="от" value={minPrice}
                onChange={e => { setMinPrice(e.target.value); setHasFilter(true); }}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:border-white/10 dark:bg-[#2A2A2A] dark:text-white dark:placeholder:text-stone-500 dark:focus:border-teal-600 dark:focus:ring-teal-950" />
              <span className="text-stone-400">—</span>
              <input type="number" min="0" placeholder="до" value={maxPrice}
                onChange={e => { setMaxPrice(e.target.value); setHasFilter(true); }}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:border-white/10 dark:bg-[#2A2A2A] dark:text-white dark:placeholder:text-stone-500 dark:focus:border-teal-600 dark:focus:ring-teal-950" />
            </div>
          </div>

          {/* Чекбоксы */}
          <div className="space-y-2.5">
            {[
              { id: 'furnished', label: 'С мебелью',          checked: furnished, onChange: () => { setFurnished(v => !v); setHasFilter(true); } },
              { id: 'students',  label: 'Подходит студентам', checked: students,  onChange: () => { setStudents(v => !v);  setHasFilter(true); } },
            ].map(({ id, label, checked, onChange }) => (
              <label key={id} className="flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" id={id} checked={checked} onChange={onChange}
                  className="h-4 w-4 rounded border-stone-300 accent-teal-600 dark:border-white/20" />
                <span className="text-sm text-stone-700 dark:text-stone-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Результаты */}
      <div className="flex-1">
        {hasFilter && (
          <p className="mb-5 text-sm text-stone-500 dark:text-stone-400">
            Найдено: <span className="font-semibold text-stone-900 dark:text-white">{filtered.length}</span> объявлений
          </p>
        )}

        {pageItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map(item => (
                <ListingCard key={item.id} item={item} locale={locale} />
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1.5">
                <button type="button" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} type="button" onClick={() => setPage(p)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-teal-600 text-white'
                        : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/5'
                    }`}>
                    {p}
                  </button>
                ))}
                <button type="button" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-stone-400 dark:hover:bg-white/5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 dark:border-white/10 py-20 text-center">
            <span className="text-4xl">🏠</span>
            <p className="mt-3 font-medium text-stone-900 dark:text-white">Ничего не найдено</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Попробуйте изменить фильтры</p>
            <button type="button" onClick={reset}
              className="mt-4 rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700">
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
