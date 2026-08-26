import { Apartment } from '@/types';

// In-memory cache storage
const memoryStore = new Map<string, { value: any; expiry: number }>();

const CACHE_TTL = 300 * 1000; // 5 minutes in ms
const CACHE_PREFIX = 'ijara:';

function getCatalogCacheKey(
  locale: string,
  query?: string,
  filters?: {
    regionId?: string;
    rooms?: number;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
  }
): string {
  const keyParts = [CACHE_PREFIX, 'catalog', locale];
  
  if (query) keyParts.push(`q:${query}`);
  if (filters?.regionId) keyParts.push(`region:${filters.regionId}`);
  if (filters?.rooms) keyParts.push(`rooms:${filters.rooms}`);
  if (filters?.minPrice) keyParts.push(`minPrice:${filters.minPrice}`);
  if (filters?.maxPrice) keyParts.push(`maxPrice:${filters.maxPrice}`);
  if (filters?.minArea) keyParts.push(`minArea:${filters.minArea}`);
  if (filters?.maxArea) keyParts.push(`maxArea:${filters.maxArea}`);
  
  return keyParts.join(':');
}

function getApartmentCacheKey(locale: string, id: string): string {
  return `${CACHE_PREFIX}apartment:${locale}:${id}`;
}

export async function cacheCatalogResults(
  locale: string,
  data: Apartment[],
  query?: string,
  filters?: {
    regionId?: string;
    rooms?: number;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
  }
): Promise<void> {
  const cacheKey = getCatalogCacheKey(locale, query, filters);
  memoryStore.set(cacheKey, { value: data, expiry: Date.now() + CACHE_TTL });
}

export async function getCachedCatalogResults(
  locale: string,
  query?: string,
  filters?: {
    regionId?: string;
    rooms?: number;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
  }
): Promise<Apartment[] | null> {
  const cacheKey = getCatalogCacheKey(locale, query, filters);
  const entry = memoryStore.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    memoryStore.delete(cacheKey);
    return null;
  }
  return entry.value as Apartment[];
}

export async function cacheApartmentDetails(
  locale: string,
  id: string,
  data: Apartment
): Promise<void> {
  const cacheKey = getApartmentCacheKey(locale, id);
  memoryStore.set(cacheKey, { value: data, expiry: Date.now() + CACHE_TTL });
}

export async function getCachedApartmentDetails(
  locale: string,
  id: string
): Promise<Apartment | null> {
  const cacheKey = getApartmentCacheKey(locale, id);
  const entry = memoryStore.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    memoryStore.delete(cacheKey);
    return null;
  }
  return entry.value as Apartment;
}

export async function invalidateApartmentCache(
  locale: string,
  id: string
): Promise<void> {
  const cacheKey = getApartmentCacheKey(locale, id);
  memoryStore.delete(cacheKey);
}

export async function invalidateCatalogCache(locale: string): Promise<void> {
  const prefix = `${CACHE_PREFIX}catalog:${locale}`;
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
}