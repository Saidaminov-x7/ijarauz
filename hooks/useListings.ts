'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import type { ApiListResponse, Listing, ListingFilters } from '@/types';

/**
 * Получение объявлений через react-query + axios.
 * При недоступном backend axios-интерцептор автоматически
 * подставит мок-данные (см. lib/axios.ts, lib/mock-listings.ts),
 * поэтому хук всегда возвращает валидные данные.
 */
export function useListings(filters: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiListResponse<Listing>>('/listings', {
        params: filters,
      });
      return data;
    },
    staleTime: 60_000,
  });
}

/** Получение одного объявления по UUID. */
export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Listing>(`/listings/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}
