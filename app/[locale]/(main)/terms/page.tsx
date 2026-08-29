import { getTranslations } from 'next-intl/server';
import { fetchDynamicPageSections, DynamicSectionRenderer } from '@/components/DynamicSectionRenderer';

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Terms');
  const sections = await fetchDynamicPageSections('terms', locale);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 border-b border-stone-200 dark:border-stone-800 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {t('lastUpdated')}
        </p>
      </div>

      {sections && sections.length > 0 ? (
        <DynamicSectionRenderer sections={sections} locale={locale} />
      ) : (
        <div className="prose max-w-none dark:prose-invert prose-headings:text-stone-900 prose-headings:font-bold prose-p:text-stone-600 dark:prose-headings:text-white dark:prose-p:text-stone-300 prose-p:leading-relaxed space-y-6">
          <section>
            <h2 className="text-xl">{t('section1Title')}</h2>
            <p>{t('section1Text')}</p>
          </section>

          <section>
            <h2 className="text-xl">{t('section2Title')}</h2>
            <p>{t('section2Text')}</p>
          </section>

          <section>
            <h2 className="text-xl">{t('section3Title')}</h2>
            <p>{t('section3Text')}</p>
          </section>

          <section>
            <h2 className="text-xl">{t('section4Title')}</h2>
            <p>{t('section4Text')}</p>
          </section>

          <section>
            <h2 className="text-xl">{t('section5Title')}</h2>
            <p>{t('section5Text')}</p>
          </section>

          <section>
            <h2 className="text-xl">{t('section6Title')}</h2>
            <p>{t('section6Text')}</p>
          </section>

          <section>
            <h2 className="text-xl">{t('section7Title')}</h2>
            <p>{t('section7Text')}</p>
          </section>

          <section>
            <h2 className="text-xl">{t('section8Title')}</h2>
            <p>{t('section8Text')}</p>
          </section>
        </div>
      )}
    </div>
  );
}