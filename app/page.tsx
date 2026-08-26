import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function RootPage() {
  const hdrs = await headers();
  const acceptLang = hdrs.get('accept-language') ?? '';

  const supported = ['uz', 'ru'];
  let locale = 'ru'; // default

  for (const part of acceptLang.split(',')) {
    const lang = part.split(';')[0].trim().toLowerCase().slice(0, 2);
    if (supported.includes(lang)) { locale = lang; break; }
  }

  redirect(`/${locale}`);
}
