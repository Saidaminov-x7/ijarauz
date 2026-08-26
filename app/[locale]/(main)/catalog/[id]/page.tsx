import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { MapView } from '@/components/ui/MapView';
import { ApartmentImage } from '@/components/ui/ApartmentImage';
import { getApartmentById, getPopularApartmentIds } from '@/lib/api';

interface ApartmentPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  // Pre-render popular apartments
  const popularApartments = await getPopularApartmentIds();
  
  const params = [];
  for (const id of popularApartments) {
    params.push({ locale: 'ru', id });
    params.push({ locale: 'uz', id });
  }
  
  return params;
}


export async function generateMetadata({ params }: ApartmentPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const apartment = await getApartmentById(id);
  const t = await getTranslations('Apartment');

  if (!apartment) {
    return {
      title: t('notFound'),
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ijara.uz';
  const images = apartment.images?.length ? apartment.images : [apartment.image || '/placeholder-apartment.jpg'];
  const firstImage = images[0];
  const imageUrl = firstImage.startsWith('http')
    ? firstImage
    : `${baseUrl}${firstImage}`;

  return {
    title: `${apartment.title} - ${apartment.price}$/месяц | ijara.uz`,
    description: apartment.description || '',
    openGraph: {
      title: apartment.title,
      description: apartment.description || '',
      url: `${baseUrl}/${locale}/catalog/${apartment.id}`,
      siteName: 'ijara.uz',
      images: images.map((img: string) => ({
        url: img.startsWith('http') ? img : `${baseUrl}${img}`,
        width: 1200,
        height: 630,
        alt: apartment.title,
      })),
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: apartment.title,
      description: apartment.description || '',
      images: [imageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/catalog/${apartment.id}`,
    },
  };
}

export default async function ApartmentPage({ params }: ApartmentPageProps) {
  const { id, locale } = await params;
  const apartment = await getApartmentById(id);
  const t = await getTranslations('Apartment');

  if (!apartment) {
    notFound();
  }

  const images = apartment.images?.length ? apartment.images : [apartment.image || '/placeholder-apartment.jpg'];
  const amenities = apartment.amenities || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-white">
          {apartment.title}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {apartment.location}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="mb-4 rounded-lg overflow-hidden">
            <ApartmentImage
              src={images[0]}
              alt={apartment.title}
              className="w-full h-auto object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {images.slice(1, 4).map((image: string, index: number) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <ApartmentImage
                    src={image}
                    alt={`${apartment.title} - ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="mb-4">
            <span className="text-2xl font-bold text-teal-600">
              ${apartment.price} / {t('month')}
            </span>
          </div>
          {apartment.description && (
            <div className="mb-6">
              <p className="text-stone-600 dark:text-stone-300">
                {apartment.description}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-stone-500 dark:text-stone-400">
                {t('rooms')}:
              </span>
              <span className="ml-2 font-medium">
                {apartment.rooms}
              </span>
            </div>
            <div>
              <span className="text-sm text-stone-500 dark:text-stone-400">
                {t('area')}:
              </span>
              <span className="ml-2 font-medium">
                {apartment.area} м²
              </span>
            </div>
            {apartment.floor !== undefined && (
              <div>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  {t('floor')}:
                </span>
                <span className="ml-2 font-medium">
                  {apartment.floor} {apartment.totalFloors ? `/ ${apartment.totalFloors}` : ''}
                </span>
              </div>
            )}
          </div>
          {amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {t('amenities')}:
              </h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity: string, index: number) => (
                  <span key={index} className="px-3 py-1 text-sm rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button className="w-full rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700">
            {t('contactOwner')}
          </button>
        </div>
      </div>
    </div>
  );
}