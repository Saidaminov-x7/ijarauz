import { getTranslations } from 'next-intl/server';
import { fetchDynamicPageSections, DynamicSectionRenderer } from '@/components/DynamicSectionRenderer';

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Terms');
  const sections = await fetchDynamicPageSections('terms');

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="mb-8 text-3xl font-bold text-stone-900 dark:text-white">
        {t('title')}
      </h1>

      {sections && sections.length > 0 ? (
        <DynamicSectionRenderer sections={sections} locale={locale} />
      ) : (
        <div className="prose max-w-none dark:prose-invert prose-headings:text-stone-900 prose-p:text-stone-600 dark:prose-headings:text-white dark:prose-p:text-stone-300">
          <p>{t('lastUpdated')}</p>
          
          <h2>{t('section1Title')}</h2>
          <p>{t('section1Text')}</p>
          
          <h2>{t('section2Title')}</h2>
          <p>{t('section2Text')}</p>
          
          <h2>{t('section3Title')}</h2>
          <p>{t('section3Text')}</p>
          
          <h2>{t('section4Title')}</h2>
          <p>{t('section4Text')}</p>
        </div>
      )}
    </div>
  );
}