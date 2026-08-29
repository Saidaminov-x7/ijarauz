'use client';

import { useEffect, useState } from 'react';
import { externalBaseURL } from '@/lib/axios';

interface ThemeTokens {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
}

const DEFAULTS: ThemeTokens = {
  primaryColor: '#14b8a6',
  secondaryColor: '#0f766e',
  backgroundColor: '#f9fafb',
  textColor: '#111827',
  borderRadius: '0.75rem',
  fontFamily: 'Inter, sans-serif',
};

export function DesignTokensInjector() {
  const [tokens, setTokens] = useState<ThemeTokens>(DEFAULTS);

  useEffect(() => {
    const apiUrl = externalBaseURL;
    
    fetch(`${apiUrl}/site-settings/public/theme`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch theme');
        return res.json();
      })
      .then((data: ThemeTokens) => {
        setTokens(data);
      })
      .catch(() => {
        // Use defaults silently
      });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', tokens.primaryColor);
    root.style.setProperty('--color-secondary', tokens.secondaryColor);
    root.style.setProperty('--color-bg', tokens.backgroundColor);
    root.style.setProperty('--color-text', tokens.textColor);
    root.style.setProperty('--border-radius', tokens.borderRadius);
    root.style.setProperty('--font-family', tokens.fontFamily);
  }, [tokens]);

  return null;
}
