import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const externalBaseURL = process.env.NEXT_PUBLIC_API_URL;
if (!externalBaseURL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL не задан. Укажи переменную окружения перед сборкой/запуском — без неё приложение не может обратиться к backend API.',
  );
}
export { externalBaseURL };
const baseURL = typeof window !== 'undefined' ? '/api/backend' : externalBaseURL;
const PROACTIVE_REFRESH_BEFORE_MS = 5 * 60 * 1000; // 5 minutes

/** Decodes JWT payload to check exp */
function decodeJwtExp(token: string): number | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const payload = JSON.parse(
      typeof window !== 'undefined'
        ? atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
        : Buffer.from(base64, 'base64').toString('utf8'),
    );
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Schedules proactive refresh 5 min before token expiry */
export function scheduleProactiveRefresh(token: string) {
  if (proactiveRefreshTimer) clearTimeout(proactiveRefreshTimer);
  const exp = decodeJwtExp(token);
  if (!exp) return;
  const delay = exp - Date.now() - PROACTIVE_REFRESH_BEFORE_MS;
  if (delay <= 0) return;
  proactiveRefreshTimer = setTimeout(async () => {
    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      if (data.accessToken) {
        useAuthStore.getState().setToken(data.accessToken);
        scheduleProactiveRefresh(data.accessToken);
      }
    } catch {
      // If proactive refresh fails, wait for 401 interceptor
    }
  }, delay);
}

const getAuthToken = () => useAuthStore.getState().accessToken;

const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

const AUTH_SKIP = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh'];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 429) {
      const data = error.response.data as { message?: string };
      const message = data?.message || 'Слишком много запросов. Попробуйте позже.';
      return Promise.reject(new Error(message));
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const url: string = originalRequest.url || '';
    if (AUTH_SKIP.some((p) => url.includes(p))) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newToken = data.accessToken;
      useAuthStore.getState().setToken(newToken);
      scheduleProactiveRefresh(newToken);
      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;