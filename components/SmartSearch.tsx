'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Suggestion {
  icon: string;
  text: string;
  sub: string;
  href: string;
}

export function SmartSearch({ locale }: { locale: string }) {
  const [query, setSuggestions_query] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen]     = useState(false);
  const [loading, setLoad]  = useState(false);
  const [active, setActive] = useState(-1);
  const timer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router  = useRouter();

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const analyze = useCallback((q: string) => {
    clearTimeout(timer.current);
    if (!q.trim()) { setSuggestions([]); setOpen(false); return; }
    setLoad(true);
    timer.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setOpen(true);
      } finally {
        setLoad(false);
      }
    }, 280);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setSuggestions_query('');
    router.push(`/${locale}${href}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) go(`/catalog?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(v => Math.min(v + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(v => Math.max(v - 1, -1)); }
    if (e.key === 'Enter' && active >= 0) go(suggestions[active].href);
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition-shadow focus-within:shadow-md dark:border-stone-700/60 dark:bg-stone-900">
        {loading ? (
          <svg className="h-4 w-4 animate-spin shrink-0 text-teal-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
          </svg>
        ) : (
          <svg className="h-4 w-4 shrink-0 text-stone-400" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        )}
        <input
          type="text"
          value={query}
          onChange={e => { setSuggestions_query(e.target.value); analyze(e.target.value); }}
          onKeyDown={handleKey}
          onFocus={() => suggestions.length && setOpen(true)}
          placeholder="Найти квартиру, район, город..."
          className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none dark:text-white dark:placeholder:text-stone-500"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="shrink-0 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
        >
          Найти
        </button>
      </form>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-150 mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-900/10 dark:border-stone-700/60 dark:bg-stone-900 dark:shadow-black/40">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(s.href)}
              className={`flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors ${
                active === i ? 'bg-stone-50 dark:bg-stone-800/60' : ''
              }`}
            >
              <span className="text-xl leading-none">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{s.text}</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{s.sub}</p>
              </div>
              <svg className="text-stone-300 dark:text-stone-600 shrink-0" width="14" height="14"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
