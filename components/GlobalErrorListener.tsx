'use client';

import { useEffect } from 'react';

export function GlobalErrorListener() {
  useEffect(() => {
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-ed76.up.railway.app';

    const sendReport = (payload: { message: string; stack?: string; severity?: string }) => {
      try {
        fetch(`${backendBaseUrl}/error-reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: payload.message.slice(0, 2000),
            stack: payload.stack ? payload.stack.slice(0, 5000) : '',
            url: window.location.href.slice(0, 500),
            userAgent: navigator.userAgent.slice(0, 500),
            severity: payload.severity || 'error',
          }),
        }).catch(() => {});
      } catch {
        // silent
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
      // Ignore trivial script load or third-party extension errors
      if (event.filename && !event.filename.includes(window.location.host)) return;
      sendReport({
        message: event.message || 'Window error',
        stack: event.error?.stack,
        severity: 'error',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || 'Unhandled Promise Rejection';
      sendReport({
        message: msg,
        stack: reason?.stack,
        severity: 'warning',
      });
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
