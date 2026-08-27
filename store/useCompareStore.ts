import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareState {
  ids: (string | number)[];
  toggle: (id: string | number) => void;
  add: (id: string | number) => boolean;
  remove: (id: string | number) => void;
  clear: () => void;
  isInCompare: (id: string | number) => boolean;
}

const MAX_COMPARE = 4;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const { ids } = get();
        const strId = String(id);
        const exists = ids.some((x) => String(x) === strId);
        if (exists) {
          set({ ids: ids.filter((x) => String(x) !== strId) });
        } else {
          if (ids.length >= MAX_COMPARE) {
            return;
          }
          set({ ids: [...ids, id] });
        }
      },
      add: (id) => {
        const { ids } = get();
        const strId = String(id);
        if (ids.some((x) => String(x) === strId)) return true;
        if (ids.length >= MAX_COMPARE) return false;
        set({ ids: [...ids, id] });
        return true;
      },
      remove: (id) => {
        const strId = String(id);
        set((s) => ({ ids: s.ids.filter((x) => String(x) !== strId) }));
      },
      clear: () => set({ ids: [] }),
      isInCompare: (id) => {
        const strId = String(id);
        return get().ids.some((x) => String(x) === strId);
      },
    }),
    { name: 'ijarauz-compare' }
  )
);
