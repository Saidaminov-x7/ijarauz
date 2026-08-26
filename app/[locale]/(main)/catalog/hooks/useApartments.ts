'use client';

import { useState, useEffect } from 'react';
import { getApartments } from '@/lib/api';
import { Apartment } from '@/types';

interface Filters {
  priceRange?: string;
  rooms?: string;
  area?: string;
}

export function useApartments(locale: string = 'ru', query?: string, filters: Filters = {}) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApartments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getApartments(locale, query, filters);
        setApartments(data);
      } catch (err) {
        setError('Не удалось загрузить объявления. Показаны примеры данных.');
        console.error('Error fetching apartments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApartments();
  }, [locale, query, filters]);

  return { apartments, isLoading, error };
}
