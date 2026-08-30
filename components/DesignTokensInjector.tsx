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

function applyTokensToDom(tokens: ThemeTokens) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', tokens.primaryColor);
  root.style.setProperty('--color-secondary', tokens.secondaryColor);
  root.style.setProperty('--color-bg', tokens.backgroundColor);
  root.style.setProperty('--color-text', tokens.textColor);
  root.style.setProperty('--border-radius', tokens.borderRadius);
  root.style.setProperty('--font-family', tokens.fontFamily);
  if (tokens.fontFamily && document.body) {
    document.body.style.fontFamily = tokens.fontFamily;
  }
}

export function DesignTokensInjector() {
  const [tokens, setTokens] = useState<ThemeTokens>(DEFAULTS);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const endpoint = typeof window !== 'undefined'
          ? '/api/backend/site-settings/public/theme'
          : `${externalBaseURL}/site-settings/public/theme`;
        
        let res = await fetch(endpoint, { cache: 'no-store' });
        if (!res.ok && typeof window !== 'undefined' && externalBaseURL) {
          res = await fetch(`${externalBaseURL}/site-settings/public/theme`, { cache: 'no-store' });
        }
        if (res.ok) {
          const data: ThemeTokens = await res.json();
          setTokens(data);
          applyTokensToDom(data);
        }
      } catch {
        // Fallback to defaults
      }
    };

    fetchTheme();
  }, []);

  useEffect(() => {
    applyTokensToDom(tokens);
  }, [tokens]);

  return null;
}

