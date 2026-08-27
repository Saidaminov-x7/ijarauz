// Global types for the application

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

export type Audience = 'all' | 'students' | 'families' | 'girls' | 'boys';

export interface Listing {
  id: number;
  title: string;
  description?: string;
  price: number;
  city: string;
  district: string;
  type: 'apartment' | 'room' | 'daily' | 'commercial' | 'house';
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
  reviews: number;
  verified: boolean;
}

export interface ListingFilters {
  type?: 'all' | 'apartment' | 'room' | 'daily' | 'commercial' | 'house';
  forStudents?: boolean;
  audience?: Audience;
  region?: string;
  district?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  furnished?: boolean;
  limit?: number;
}

export interface ApiListResponse<T> {
  data?: T[];
  items?: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Apartment {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  rooms: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  images?: string[];
  image: string;
  amenities?: string[];
  owner?: User;
  type?: string;
  city?: string;
  district?: string;
  forStudents?: boolean;
  audience?: Audience;
  furnished?: boolean;
  verified?: boolean;
  rating?: number;
  reviews?: number;
  isPromoted?: boolean;
  promotionTier?: 'BASIC' | 'TOP' | 'URGENT';
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListingFormValues {
  title: string;
  description: string;
  price: string;
  location: string;
  rooms: string;
  area: string;
  type: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}