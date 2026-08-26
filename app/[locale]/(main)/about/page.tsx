import { getTranslations } from 'next-intl/server';
import { fetchDynamicPageSections, DynamicSectionRenderer } from '@/components/DynamicSectionRenderer';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('about');
  const sections = await fetchDynamicPageSections('about');

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/95">
        <div className="container mx-auto px-4">
          <div className="flex h-24 items-center justify-between">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              {t('title')}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {sections && sections.length > 0 ? (
          <DynamicSectionRenderer sections={sections} locale={locale} />
        ) : (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-stone-900 dark:text-white">
              {t('ourMission')}
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-300 mb-6">
              {t('missionText')}
            </p>

            <h2 className="text-3xl font-bold mb-8 text-stone-900 dark:text-white">
              {t('ourTeam')}
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-300 mb-6">
              {t('teamText')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

