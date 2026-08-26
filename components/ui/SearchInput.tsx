'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  locale: string;
  className?: string;
  placeholder?: string;
  isMobile?: boolean;
}

export function SearchInput({ locale, className = '', placeholder = 'Поиск...', isMobile = false }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/catalog?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-4.5 w-4.5 text-stone-400" />
      </div>
      
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        // Установлена сбалансированная высота h-12 и удобный отступ слева pl-11
        className={`w-full h-12 rounded-xl border border-stone-200 bg-white py-2 pl-11 pr-4 text-sm transition-shadow duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white ${isMobile ? 'pr-10' : ''}`}
      />
      
      {isMobile && query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-300"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}