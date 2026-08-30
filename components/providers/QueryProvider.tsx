'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({
  children,
  initialSiteSettings,
}: {
  children: React.ReactNode;
  initialSiteSettings?: any;
}) {
  // useState гарантирует, что QueryClient создаётся один раз на клиенте,
  // а не при каждом рендере/навигации.
  const [client] = useState(
    () => {
      const qc = new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
          },
        },
      });
      if (initialSiteSettings) {
        qc.setQueryData(['site-settings'], initialSiteSettings);
      }
      return qc;
    }
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
