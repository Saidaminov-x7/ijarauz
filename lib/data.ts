export type Audience = 'all' | 'students' | 'families' | 'girls' | 'boys';

export interface Listing {
  id: number;
  title: string;
  description?: string;
  price: number;
  city: string;
  district: string;
  type: 'apartment' | 'room' | 'daily';
  rooms: number;
  area: number;
  floor: number;
  totalFloors: number;
  furnished: boolean;
  image: string;
  images?: string[];
  coordinates?: { lat: number; lng: number };
  features: string[];
  forStudents: boolean;
  audience?: Audience;
  phone?: string;
  rating: number;
  reviews?: number;
  verified?: boolean;
  isVerified?: boolean;
  isPromoted?: boolean;
  promotionTier?: 'BASIC' | 'TOP' | 'URGENT';
  author?: { id?: string; name?: string; phone?: string; avatar?: string; createdAt?: string };
  owner?: { id?: string; name?: string; phone?: string; avatar?: string; createdAt?: string };
  createdAt?: string;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Tashkent: { lat: 41.2995, lng: 69.2401 },
  Самарканд: { lat: 39.627, lng: 66.975 },
  Бухара: { lat: 39.7747, lng: 64.4286 },
  Фергана: { lat: 40.3834, lng: 71.7842 },
};

export function getListingCoordinates(listing: Listing) {
  return listing.coordinates ?? CITY_COORDINATES[listing.city] ?? CITY_COORDINATES.Tashkent;
}

export type FilterType = 'all' | 'apartment' | 'room' | 'daily';

export interface GetListingsOptions {
  type?: FilterType;
  forStudents?: boolean;
  region?: string;
  district?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  furnished?: boolean;
  limit?: number;
}

/** Legacy callers receive no local fixtures; listings are loaded from the API. */
export function getListings(_opts?: GetListingsOptions): Listing[] {
  return [];
}

export function getSearchSuggestions(q: string) {
  const lower = q.toLowerCase().trim();
  if (!lower) return [];

  const cityMap: Record<string, string> = {
    ташкент: 'Ташкент',
    tashkent: 'Ташкент',
    самарканд: 'Самарканд',
    samarkand: 'Самарканд',
    бухара: 'Бухара',
    bukhara: 'Бухара',
    фергана: 'Фергана',
    fergana: 'Фергана',
    наманган: 'Наманган',
    namangan: 'Наманган',
  };

  const suggestions: { icon: string; text: string; sub: string; href: string }[] = [];
  for (const [key, city] of Object.entries(cityMap)) {
    if (lower.includes(key)) {
      suggestions.push({ icon: 'location', text: `Аренда в ${city}`, sub: 'Открыть объявления этого города', href: `/catalog?city=${encodeURIComponent(city)}` });
      break;
    }
  }

  if (/(комнат|room)/i.test(lower)) {
    suggestions.push({ icon: 'home', text: 'Аренда комнат', sub: 'Открыть объявления комнат', href: '/catalog?type=room' });
  }
  if (/(посуточ|сутки|daily)/i.test(lower)) {
    suggestions.push({ icon: 'calendar', text: 'Посуточная аренда', sub: 'Открыть посуточные объявления', href: '/catalog?type=daily' });
  }
  if (/(студент|student)/i.test(lower)) {
    suggestions.push({ icon: 'graduation', text: 'Жилье для студентов', sub: 'Искать подходящие объявления', href: '/catalog?audience=students' });
  }

  suggestions.push({ icon: 'search', text: `Искать «${q}»`, sub: 'Поиск по реальным объявлениям', href: `/catalog?q=${encodeURIComponent(q)}` });
  return suggestions.slice(0, 5);
}
