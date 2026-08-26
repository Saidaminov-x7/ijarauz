import { create } from 'zustand';
import type { FilterType } from '@/lib/data';

interface FilterState {
  type: FilterType | 'all';
  region: string;
  district: string;
  minPrice: string;
  maxPrice: string;
  furnished: boolean;
  students: boolean;
  page: number;

  setType: (v: FilterType | 'all') => void;
  setRegion: (v: string) => void;
  setDistrict: (v: string) => void;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  toggleFurnished: () => void;
  toggleStudents: () => void;
  setPage: (v: number) => void;
  reset: () => void;
}

const initial = {
  type: 'all' as const,
  region: '',
  district: '',
  minPrice: '',
  maxPrice: '',
  furnished: false,
  students: false,
  page: 1,
};

/**
 * Глобальное состояние фильтров каталога.
 * Позволяет читать/менять фильтры из любого компонента
 * (шапка, каталог, быстрые ссылки на главной) без прокидывания пропсов.
 */
export const useFilterStore = create<FilterState>((set) => ({
  ...initial,
  setType: (type) => set({ type, page: 1 }),
  setRegion: (region) => set({ region, district: '', page: 1 }),
  setDistrict: (district) => set({ district, page: 1 }),
  setMinPrice: (minPrice) => set({ minPrice, page: 1 }),
  setMaxPrice: (maxPrice) => set({ maxPrice, page: 1 }),
  toggleFurnished: () => set((s) => ({ furnished: !s.furnished, page: 1 })),
  toggleStudents: () => set((s) => ({ students: !s.students, page: 1 })),
  setPage: (page) => set({ page }),
  reset: () => set(initial),
}));
