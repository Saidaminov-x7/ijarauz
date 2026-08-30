'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PREV_PAGE_KEY = 'ijara_prev_page';
const CURR_PAGE_KEY = 'ijara_curr_page';

export function NavigationHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    try {
      const currentStored = sessionStorage.getItem(CURR_PAGE_KEY);
      if (currentStored && currentStored !== pathname) {
        sessionStorage.setItem(PREV_PAGE_KEY, currentStored);
      }
      sessionStorage.setItem(CURR_PAGE_KEY, pathname);
    } catch {
      // sessionStorage might not be accessible
    }
  }, [pathname]);

  return null;
}

export function getPreviousPage(): string | null {
  try {
    return sessionStorage.getItem(PREV_PAGE_KEY);
  } catch {
    return null;
  }
}
