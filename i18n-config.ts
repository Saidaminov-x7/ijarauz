export const i18n = {
  locales: ['ru', 'uz', 'en'] as const,
  defaultLocale: 'ru',
};

export type Locale = typeof i18n['locales'][number];