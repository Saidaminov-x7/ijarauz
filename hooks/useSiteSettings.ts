"use client";

import { useQuery } from '@tanstack/react-query';
import { getSiteSettings } from '@/lib/siteSettings';

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}