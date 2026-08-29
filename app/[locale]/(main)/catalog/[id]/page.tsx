import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { MapView } from '@/components/ui/MapView';
import { ApartmentImage } from '@/components/ui/ApartmentImage';
import { getApartmentById, getPopularApartmentIds } from '@/lib/api';
import { ListingDetailClient } from './ListingDetailClient';

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ijara.uz';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Apartment',
    name: apartment.title,
    description: apartment.description || '',
    address: {
      '@type': 'PostalAddress',
      addressLocality: apartment.city || 'Tashkent',
      addressRegion: apartment.district || '',
      addressCountry: 'UZ',
    },
    numberOfRooms: apartment.rooms || 1,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: apartment.area || 0,
      unitCode: 'MTK',
    },
    image: images.map((img: string) => (img.startsWith('http') ? img : `${baseUrl}${img}`)),
    offers: {
      '@type': 'Offer',
      price: apartment.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  // Преобразуем Apartment в Listing для богатого интерактивного UI
  const listingData = {
    id: apartment.id,
    title: apartment.title,
    description: apartment.description,
    price: apartment.price,
    city: apartment.city || 'Ташкент',
    district: apartment.district || apartment.location || 'Ташкент',
    type: (apartment.type as any) || 'apartment',
    rooms: apartment.rooms || 1,
    area: apartment.area || 50,
    floor: apartment.floor || 1,
    totalFloors: apartment.totalFloors || 9,
    furnished: true,
    image: images[0] || '',
    images: images,
    features: amenities,
    forStudents: !!apartment.forStudents || apartment.audience === 'students',
    rating: apartment.rating || 4.9,
    reviews: apartment.reviews || 5,
    verified: !!apartment.isVerified || !!apartment.verified,
    isVerified: !!apartment.isVerified || !!apartment.verified,
    isPromoted: !!apartment.isPromoted,
    promotionTier: apartment.promotionTier,
    author: {
      id: apartment.owner?.id || (apartment as any).author?.id,
      name: apartment.owner?.name || (apartment as any).author?.name || 'Владелец жилья',
      phone: apartment.owner?.phone || (apartment as any).author?.phone || '+998 90 123 45 67',
      avatar: apartment.owner?.avatar || (apartment as any).author?.avatar,
    },
    owner: {
      id: apartment.owner?.id || (apartment as any).author?.id,
      name: apartment.owner?.name || (apartment as any).author?.name || 'Владелец жилья',
      phone: apartment.owner?.phone || (apartment as any).author?.phone || '+998 90 123 45 67',
      avatar: apartment.owner?.avatar || (apartment as any).author?.avatar,
    },
  };

  const coordinates = (apartment as any).coordinates || { lat: 41.2995, lng: 69.2401 };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListingDetailClient
        listing={listingData as any}
        coordinates={coordinates}
        locale={locale}
      />
    </>
  );
}