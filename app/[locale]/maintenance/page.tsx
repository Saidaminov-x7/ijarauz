import { MaintenanceView } from './MaintenanceView';
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
    maintenancePasswordEnabled: false,
  };
}

export default async function MaintenancePage({ params }: MaintenancePageProps) {
  const { locale } = await params;
  const settings = await getSiteSettings();

  return <MaintenanceView locale={locale} initialSettings={settings} />;
}
