'use client';

import { useEffect, useState } from 'react';

/** Возвращает значение с задержкой — снижает число перерендеров/запросов при вводе. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
