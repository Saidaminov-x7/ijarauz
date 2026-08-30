import api, { externalBaseURL } from './axios';
export { api, externalBaseURL };
export { getSiteSettings } from './siteSettings';
import {
  getCachedCatalogResults,
  cacheCatalogResults,
  getCachedApartmentDetails,
  cacheApartmentDetails,
} from './cache';
import { Apartment, Audience } from '@/types';

export interface Filters {
  regionId?: string;
  city?: string;
  district?: string;
  rooms?: string | number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  priceRange?: string;
  area?: string;
  type?: string;
  audience?: Audience | string;
  forStudents?: boolean;
  furnished?: boolean;
  amenities?: string[] | string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'viewsCount' | 'area';
  sortOrder?: 'asc' | 'desc';
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'USER' | 'LANDLORD';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateListingPayload {
  title: string;
  description: string;
  price: number;
  type: 'APARTMENT' | 'HOUSE' | 'ROOM' | 'COMMERCIAL' | 'LAND';
  rooms: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  lat?: number;
  lng?: number;
  city: string;
  district: string;
  address?: string;
  amenities?: string[];
}

// ─── AUTHENTICATION ─────────────────────────────────────────────────────────

export const register = async (data: RegisterPayload) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const login = async (identifierOrEmail: string, password: string) => {
  const response = await api.post('/auth/login', {
    email: identifierOrEmail,
    password,
  });
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const googleAuth = async (payload: {
  idToken: string;
  phone?: string;
}) => {
  const response = await api.post('/auth/google', payload);
  return response.data;
};

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const forgotPassword = async (email: string, locale?: string) => {
  const response = await api.post('/auth/forgot-password', { email, locale: locale || 'ru' });
  return response.data;
};

export const resetPassword = async (payload: { token: string; password: string }) => {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
};

// ─── LISTINGS ───────────────────────────────────────────────────────────────

function formatListingToApartment(item: any): Apartment {
  const backendBaseUrl = externalBaseURL;
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images.map((img: any) => {
        // Если это Cloudinary URL — используем secure_url
        if (typeof img === 'string' && img.startsWith('http')) return img;
        if (img?.secure_url) return img.secure_url;
        if (typeof img === 'string') return img.startsWith('/') ? `${backendBaseUrl}${img}` : img;
        if (img?.url) return img.url.startsWith('http') ? img.url : `${backendBaseUrl}${img.url}`;
        return '/placeholder-apartment.jpg';
      })
    : [];

  const city = item.city || 'Ташкент';
  const district = item.district || '';
  const location = district && city
    ? `${city}, ${district}`
    : (city || item.location || 'Ташкент');

  return {
    id: String(item.id),
    title: item.title || 'Объявление',
    description: item.description || '',
    price: Number(item.price) || 0,
    location,
    city,
    district,
    type: item.type ? item.type.toLowerCase() : 'apartment',
    rooms: Number(item.rooms) || 1,
    area: Number(item.area) || 0,
    floor: item.floor !== undefined && item.floor !== null ? Number(item.floor) : undefined,
    totalFloors: item.totalFloors !== undefined && item.totalFloors !== null ? Number(item.totalFloors) : undefined,
    image: images[0] || '/placeholder-apartment.jpg',
    images,
    amenities: item.amenities || item.features || [],
    forStudents: !!item.forStudents || item.audience === 'students' || item.title?.toLowerCase().includes('студент'),
    audience: item.audience || (item.forStudents ? 'students' : 'all'),
    furnished: item.furnished !== undefined ? !!item.furnished : true,
    verified: item.isVerified ?? item.verified ?? false,
    isVerified: item.isVerified ?? item.verified ?? false,
    isPromoted: item.isPromoted ?? false,
    promotionTier: item.promotionTier ?? null,
    rating: item.rating !== undefined ? Number(item.rating) : 0,
    reviews: item.reviewsCount !== undefined ? Number(item.reviewsCount) : (item.reviews !== undefined ? Number(item.reviews) : 0),
    owner: item.owner ? {
      id: item.owner.id,
      name: item.owner.name,
      email: item.owner.email || '',
      phone: item.owner.phone || '',
      avatar: item.owner.avatar,
    } : undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const getApartments = async (
  locale: string = 'ru',
  query?: string,
  filters: Filters = {}
): Promise<Apartment[]> => {
  try {
    // Отключаем кэш для разработки, чтобы всегда получать актуальные данные
    if (process.env.NODE_ENV === 'development') {
      // В продакшене кэш можно включить обратно
    } else {
      const cachedResults = await getCachedCatalogResults(locale, query, {
        regionId: filters.regionId,
        rooms: filters.rooms ? Number(filters.rooms) : undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
      });

      if (cachedResults && cachedResults.length > 0) {
        return filterApartmentsClient(cachedResults, query, filters);
      }
    }

    const params: Record<string, any> = {
      page: filters.page || 1,
      limit: filters.limit || 50,
    };

    if (query) {
      params.search = query;
    }
    if (filters.city) {
      params.city = filters.city;
    }
    if (filters.district) {
      params.district = filters.district;
    }
    if (filters.rooms) {
      params.minRooms = Number(filters.rooms);
    }
    if (filters.minPrice) {
      params.minPrice = filters.minPrice;
    }
    if (filters.maxPrice) {
      params.maxPrice = filters.maxPrice;
    }
    if (filters.amenities && (Array.isArray(filters.amenities) ? filters.amenities.length > 0 : Boolean(filters.amenities))) {
      params.amenities = Array.isArray(filters.amenities) ? filters.amenities.join(',') : filters.amenities;
    }
    if (filters.type && filters.type !== 'all') {
      const typeMap: Record<string, string> = {
        apartment: 'APARTMENT',
        room: 'ROOM',
        house: 'HOUSE',
        commercial: 'COMMERCIAL',
        daily: 'APARTMENT', // backend doesn't have DAILY type, filter client-side
      };
      const mappedType = typeMap[filters.type.toLowerCase()];
      if (mappedType) params.type = mappedType;
    }

    const response = await api.get('/listings', { params });
    const rawItems = response.data.items || response.data.data || response.data || [];
    const apartments: Apartment[] = rawItems.map(formatListingToApartment);

    if (apartments.length > 0) {
      await cacheCatalogResults(locale, apartments, query, {
        regionId: filters.regionId,
        rooms: filters.rooms ? Number(filters.rooms) : undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
      });
      return filterApartmentsClient(apartments, query, filters);
    }

    // Если бэкенд пустой — загружаем 100 реалистичных демо-объявлений по Узбекистану
    const { generate100DemoApartments } = await import('@/lib/demoApartments');
    const demoList = generate100DemoApartments();
    return filterApartmentsClient(demoList, query, filters);
  } catch (error) {
    console.error('Error fetching apartments from API, loading demo data:', error);
    try {
      const { generate100DemoApartments } = await import('@/lib/demoApartments');
      const demoList = generate100DemoApartments();
      return filterApartmentsClient(demoList, query, filters);
    } catch {
      return [];
    }
  }
};

function filterApartmentsClient(list: Apartment[], query?: string, filters: Filters = {}): Apartment[] {
  return list.filter((apt) => {
    if (query) {
      const q = query.toLowerCase();
      const match = apt.title.toLowerCase().includes(q) ||
        apt.location.toLowerCase().includes(q) ||
        (apt.description && apt.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.city && apt.city && !apt.city.toLowerCase().includes(filters.city.toLowerCase())) {
      if (!apt.location.toLowerCase().includes(filters.city.toLowerCase())) return false;
    }
    if (filters.district && apt.district && !apt.district.toLowerCase().includes(filters.district.toLowerCase())) {
      if (!apt.location.toLowerCase().includes(filters.district.toLowerCase())) return false;
    }
    if (filters.type && filters.type !== 'all') {
      const targetType = filters.type.toLowerCase();
      const currentType = (apt.type || 'apartment').toLowerCase();
      if (targetType === 'student' || targetType === 'students') {
        if (!apt.forStudents && apt.audience !== 'students') return false;
      } else if (currentType !== targetType) {
        return false;
      }
    }
    if (filters.audience && filters.audience !== 'all') {
      if (filters.audience === 'students' && !apt.forStudents && apt.audience !== 'students') return false;
      if (filters.audience !== 'students' && apt.audience && apt.audience !== filters.audience) return false;
    }
    if (filters.forStudents && !apt.forStudents) return false;
    if (filters.furnished !== undefined && apt.furnished !== undefined && apt.furnished !== filters.furnished) return false;
    if (filters.minPrice && apt.price < filters.minPrice) return false;
    if (filters.maxPrice && apt.price > filters.maxPrice) return false;
    if (filters.rooms && apt.rooms !== Number(filters.rooms)) return false;
    if (filters.amenities) {
      const neededAmenities = Array.isArray(filters.amenities)
        ? filters.amenities
        : filters.amenities.split(',').filter(Boolean);
      if (neededAmenities.length > 0) {
        const aptAmenities = (apt.amenities || []).map((a) => a.toUpperCase());
        const hasMatch = neededAmenities.some((na) => aptAmenities.includes(na.toUpperCase()));
        if (!hasMatch) return false;
      }
    }
    return true;
  });
}

export const getApartmentById = async (id: string): Promise<Apartment | null> => {
  try {
    const cachedApartment = await getCachedApartmentDetails('ru', id);
    if (cachedApartment) {
      return cachedApartment;
    }

    const response = await api.get(`/listings/${id}`);
    const apartment = formatListingToApartment(response.data);

    await cacheApartmentDetails('ru', id, apartment);
    return apartment;
  } catch (error) {
    // Демо-поиск объекта
    try {
      const { generate100DemoApartments } = await import('@/lib/demoApartments');
      const found = generate100DemoApartments().find((a) => String(a.id) === String(id));
      if (found) return found;
    } catch {}
    return null;
  }
};

export const getPopularApartmentIds = async (limit: number = 20): Promise<string[]> => {
  try {
    const response = await api.get('/listings', { params: { limit } });
    const items = response.data.items || response.data.data || response.data || [];
    if (items.length > 0) {
      return items.map((item: any) => String(item.id));
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const createListing = async (data: CreateListingPayload) => {
  const response = await api.post('/listings', data);
  return response.data;
};

export const publishListing = async (id: string) => {
  const response = await api.post(`/listings/${id}/publish`);
  return response.data;
};

export const getMyListings = async (page: number = 1, limit: number = 20): Promise<Apartment[]> => {
  try {
    const response = await api.get('/listings/my', { params: { page, limit } });
    const items = response.data.items || [];
    return items.map(formatListingToApartment);
  } catch (error) {
    console.error('Error fetching my listings:', error);
    return [];
  }
};

export const getFavorites = async (page: number = 1, limit: number = 20): Promise<Apartment[]> => {
  try {
    const response = await api.get('/listings/favorites', { params: { page, limit } });
    const items = response.data.items || [];
    return items.map((fav: any) => formatListingToApartment(fav.listing || fav));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

export const toggleFavorite = async (listingId: string): Promise<{ favorited: boolean }> => {
  const response = await api.post(`/listings/${listingId}/favorite`);
  return response.data;
};

export const uploadMedia = async (file: File, listingId?: string) => {
  const formData = new FormData();
  formData.append('file', file);

  const url = listingId ? `/media/upload?listingId=${encodeURIComponent(listingId)}` : '/media/upload';
  const response = await api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if (!response.data.url) {
    throw new Error('Failed to upload image: no URL returned');
  }
  return response.data;
};

export const getSimilarListings = async (id: string): Promise<Apartment[]> => {
  try {
    const response = await api.get(`/listings/${id}/similar`);
    const items = response.data || [];
    return items.map(formatListingToApartment);
  } catch (error) {
    console.error('Error fetching similar listings:', error);
    return [];
  }
};

export const reportListing = async (
  id: string,
  reason: 'SCAM' | 'ALREADY_RENTED' | 'WRONG_PRICE' | 'WRONG_PHOTOS' | 'DUPLICATE' | 'OTHER',
  comment?: string,
) => {
  const response = await api.post(`/listings/${id}/report`, { reason, comment });
  return response.data;
};

export const getPriceHistory = async (id: string) => {
  try {
    const response = await api.get(`/listings/${id}/price-history`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching price history:', error);
    return [];
  }
};

export const estimateFairPrice = async (data: {
  city: string;
  district?: string;
  rooms: number;
  area: number;
  type?: string;
}) => {
  const response = await api.post('/listings/estimate-price', data);
  return response.data;
};

export const getSavedSearches = async () => {
  try {
    const response = await api.get('/saved-searches');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return [];
  }
};

export const createSavedSearch = async (name: string, filters: Record<string, any>) => {
  const response = await api.post('/saved-searches', { name, filters });
  return response.data;
};

export const deleteSavedSearch = async (id: string) => {
  const response = await api.delete(`/saved-searches/${id}`);
  return response.data;
};

export const createViewingRequest = async (listingId: string, preferredDate?: string, message?: string) => {
  const response = await api.post(`/listings/${listingId}/viewing-requests`, { preferredDate, message });
  return response.data;
};

export const getChatSummary = async (listingId: string) => {
  const response = await api.get(`/ai-chat/chats/${listingId}/summary`);
  return response.data;
};

// ─── REVIEWS (ОТЗЫВЫ) ───────────────────────────────────────────────────────

export interface ReviewItem {
  id: string;
  author: string;
  authorAvatar?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ListingReviewsResponse {
  listingId: string;
  ownerId: string;
  averageRating: number;
  totalReviews: number;
  items: ReviewItem[];
}

export const getListingReviews = async (listingId: string): Promise<ListingReviewsResponse> => {
  try {
    const response = await api.get(`/listings/${listingId}/reviews`);
    return response.data;
  } catch (e) {
    return {
      listingId,
      ownerId: '',
      averageRating: 5.0,
      totalReviews: 0,
      items: [],
    };
  }
};

export const createListingReview = async (listingId: string, rating: number, comment: string): Promise<ReviewItem> => {
  const response = await api.post(`/listings/${listingId}/reviews`, { rating, comment });
  return response.data;
};

// ─── PEER-TO-PEER CHAT (ЧАТ С АРЕНДОДАТЕЛЕМ) ────────────────────────────────

export interface ChatConversationItem {
  id: string;
  peerId: string;
  peerName: string;
  peerAvatar?: string | null;
  peerPhone?: string | null;
  lastMessage: string;
  time: string;
  unread: number;
  listing?: {
    id: string;
    title: string;
    city: string;
    price: number;
    image?: string | null;
  } | null;
}

export interface ChatMessagesHistoryResponse {
  peer: {
    id: string;
    name: string;
    avatar?: string | null;
    phone?: string | null;
  };
  messages: Array<{
    id: string;
    sender: 'user' | 'peer';
    senderId: string;
    recipientId: string;
    text: string;
    timestamp: string;
    readStatus: string;
    listing?: {
      id: string;
      title: string;
      city: string;
      price: number;
      image?: string | null;
    } | null;
  }>;
}

export const getChatConversations = async (): Promise<ChatConversationItem[]> => {
  try {
    const response = await api.get('/chat/conversations');
    return response.data || [];
  } catch (e) {
    return [];
  }
};

export const getChatMessages = async (peerId: string): Promise<ChatMessagesHistoryResponse | null> => {
  try {
    const response = await api.get(`/chat/conversations/${peerId}`);
    return response.data;
  } catch (e) {
    return null;
  }
};

export const sendChatMessage = async (payload: {
  recipientId: string;
  listingId?: string | null;
  message: string;
}) => {
  const response = await api.post('/chat/messages', payload);
  return response.data;
};

export const deleteChatMessage = async (messageId: string): Promise<boolean> => {
  try {
    await api.delete(`/chat/messages/${messageId}`);
    return true;
  } catch {
    return false;
  }
};


