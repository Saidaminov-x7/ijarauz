"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Игнорируем внутренние служебные пути
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
      return;
    }

    try {
      // 1. Получаем или генерируем персистентный анонимный device ID (UUID)
      let deviceId = localStorage.getItem('ijarauz_device_id');
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
        localStorage.setItem('ijarauz_device_id', deviceId);
      }

      // 2. Отправляем неблокирующий запрос (fire-and-forget)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-ed76.up.railway.app';
      fetch(`${apiUrl}/analytics/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, path: pathname }),
        keepalive: true, // Позволяет запросу завершиться даже при быстрой навигации
      }).catch(() => {});
    } catch {
      // Игнорируем возможные ошибки localStorage в приватном режиме
    }
  }, [pathname]);

  return null;
}
