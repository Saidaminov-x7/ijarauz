import { getRequestConfig } from 'next-intl/server';

const locales = ['uz', 'en', 'ru'];
const defaultLocale = 'ru';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    timeZone: 'Asia/Tashkent',
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});