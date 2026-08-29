'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthInitializer() {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchUser();
  }, [fetchUser]);

  return null;
}
