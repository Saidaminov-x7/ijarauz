'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ApartmentCard } from '@/app/[locale]/(main)/catalog/components/ApartmentCard';
import { getFavorites, getApartments } from '@/lib/api';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Apartment } from '@/types';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}

function FavoritesContent() {
  const t = useTranslations('Favorites');
  const params = useParams();
  const locale = (params?.locale as string) || 'ru';

  const [favoriteListings, setFavoriteListings] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const localFavIds = useFavoritesStore((s) => s.ids);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          const apiFavs = await getFavorites();
          if (apiFavs.length > 0) {
            setFavoriteListings(apiFavs);
            setLoading(false);
            return;
          }
        }

        // Fallback: match local favorite IDs with catalog
        const allApartments = await getApartments(locale);
        const matched = allApartments.filter((apt) => localFavIds.includes(Number(apt.id)));
        setFavoriteListings(matched);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated, localFavIds, locale]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="mb-8 text-3xl font-bold text-stone-900 dark:text-white">
        {t('title')}
      </h1>

      {favoriteListings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favoriteListings.map((apartment) => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200/80 bg-white p-12 text-center dark:border-white/10 dark:bg-[#1f1f1f]">
          <Heart size={48} className="mx-auto mb-4 text-stone-300 dark:text-stone-600" />
          <h2 className="mb-2 text-lg font-semibold text-stone-900 dark:text-white">
            {t('noFavoritesTitle')}
          </h2>
          <p className="mb-6 text-sm text-stone-500 dark:text-stone-400">
            {t('noFavoritesText')}
          </p>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/catalog`}>
              {t('browseCatalog')}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}