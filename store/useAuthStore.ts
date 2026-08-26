import { create } from 'zustand';
import { getMe, logout as apiLogout } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role?: string;
  verified?: boolean;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  setToken: (token: string) => void;
  setUser: (user: AuthUser | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    set({ accessToken: token, user, isAuthenticated: true, isLoading: false });
  },

  setToken: (token) => {
    set({ accessToken: token });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const userData = await getMe();
      if (userData) {
        set({ user: userData, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

