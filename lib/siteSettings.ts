// src/lib/siteSettings.ts
// Получение настроек сайта с кэшированием

import { api } from './api';

export interface PublicSiteSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string | null;
  navLinks?: any[] | null;
  googleAuthEnabled?: boolean;
  autoModerationEnabled?: boolean;
  maxImagesPerListing?: number;
}

// Кэш настроек
let cachedSettings: PublicSiteSettings | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

/**
 * Получить публичные настройки сайта (с кэшированием)
 */
export const getSiteSettings = async (): Promise<PublicSiteSettings> => {
  const now = Date.now();

  // Возвращаем кэш, если он ещё актуален
  if (cachedSettings && now - lastFetchTime < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const { data } = await api.get('/site-settings/public');
    cachedSettings = {
      siteName: data.siteName || 'Ijarauz',
      contactEmail: data.contactEmail || 'support@ijarauz.uz',
      contactPhone: data.contactPhone || '+998 71 200-00-00',
      logoUrl: data.logoUrl || null,
      navLinks: data.navLinks || null,
      googleAuthEnabled: data.googleAuthEnabled ?? true,
      autoModerationEnabled: data.autoModerationEnabled ?? false,
      maxImagesPerListing: data.maxImagesPerListing ?? 10,
    };
    lastFetchTime = now;
    return cachedSettings;
  } catch (error) {
    console.error('Failed to fetch site settings, using defaults:', error);
    return {
      siteName: 'Ijarauz',
      contactEmail: 'support@ijarauz.uz',
      contactPhone: '+998 71 200-00-00',
      logoUrl: null,
      googleAuthEnabled: true,
      autoModerationEnabled: false,
      maxImagesPerListing: 10,
    };
  }
};