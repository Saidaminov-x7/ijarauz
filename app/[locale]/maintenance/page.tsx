import { AlertTriangle, Hammer, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { externalBaseURL } from '@/lib/axios';

interface MaintenancePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const API_BASE_URL = externalBaseURL;

async function getSiteSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/site-settings/public`, {
      next: { revalidate: 10 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch site settings:', e);
  }
  return {
    maintenanceMode: true,
    maintenanceMessage:
      'Сайт находится в разработке и временно недоступен. Мы проводим технические работы. Пожалуйста, зайдите позже!',
  };
}

export default async function MaintenancePage({ params }: MaintenancePageProps) {
  const { locale } = await params;
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-lg w-full space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <Hammer className="w-12 h-12 animate-bounce" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
            !
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Технические работы
          </h1>
          <p className="text-stone-400 text-base leading-relaxed">
            {settings.maintenanceMessage ||
              'Сайт находится в разработке. Мы скоро вернемся с обновленной версией!'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 text-xs text-stone-400 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Все сервисы платформы временно приостановлены для обновления</span>
        </div>

        <div className="pt-2 flex justify-center gap-4">
          <Link
            href={`/${locale || 'ru'}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-all shadow-lg shadow-teal-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Проверить доступ
          </Link>
        </div>
      </div>
    </div>
  );
}
