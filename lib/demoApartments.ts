import type { Apartment } from '@/types';
import { regions } from '@/lib/regions';

const PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=80',
];

const AMENITIES_POOL = [
  'WIFI', 'PARKING', 'AIR_CONDITIONING', 'FURNITURE',
  'WASHING_MACHINE', 'KITCHEN', 'BALCONY', 'HEATING',
  'ELEVATOR', 'SECURITY', 'GYM', 'POOL'
];

const REGION_KEYS = Object.keys(regions);

export function generate100DemoApartments(): Apartment[] {
  const list: Apartment[] = [];

  for (let i = 1; i <= 100; i++) {
    const regionName = REGION_KEYS[(i - 1) % REGION_KEYS.length];
    const districtList = regions[regionName] || ['Центральный район'];
    const district = districtList[(i - 1) % districtList.length];

    const rooms = (i % 4) + 1;
    const price = 250 + (i % 18) * 50; // $250..$1150
    const area = 35 + rooms * 22 + (i % 15);
    const floor = (i % 9) + 1;
    const totalFloors = 9 + (i % 8);

    const typePool: ('apartment' | 'room' | 'daily' | 'house')[] = ['apartment', 'apartment', 'apartment', 'room', 'daily', 'house'];
    const type = typePool[i % typePool.length];

    const audiencePool: ('all' | 'students' | 'families' | 'girls')[] = ['all', 'students', 'families', 'girls', 'all'];
    const audience = audiencePool[i % audiencePool.length];

    const imgIndex = (i - 1) % PHOTO_PRESETS.length;
    const img1 = PHOTO_PRESETS[imgIndex];
    const img2 = PHOTO_PRESETS[(imgIndex + 1) % PHOTO_PRESETS.length];
    const img3 = PHOTO_PRESETS[(imgIndex + 2) % PHOTO_PRESETS.length];

    const numAmenities = 4 + (i % 6);
    const shuffledAmenities = [...AMENITIES_POOL].sort(() => 0.5 - Math.random()).slice(0, numAmenities);

    const titlePrefixes = [
      'Уютная', 'Светлая', 'Просторная', 'Современная', 'Элитная', 'Свежий евроремонт в', 'Стильная студия в'
    ];
    const prefix = titlePrefixes[i % titlePrefixes.length];

    list.push({
      id: String(1000 + i),
      title: `${prefix} ${rooms}-комнатная недвижимость в ${district}`,
      description: `Сдаётся светлая и комфортная ${rooms}-комнатная квартира площадью ${area} м² в ${regionName}, ${district}.\n\nПолностью укомплектована мебелью и бытовой техникой (кондиционер, стиральная машина, высокоскоростной Wi-Fi). Рядом развитая инфраструктура: остановки транспорта, супермаркеты, парки и школы. Сдается на длительный срок порядочным жильцам.`,
      price,
      location: `${regionName}, ${district}`,
      city: regionName,
      district,
      type,
      rooms,
      area,
      floor,
      totalFloors,
      image: img1,
      images: [img1, img2, img3],
      amenities: shuffledAmenities,
      rating: Number((4.6 + (i % 5) * 0.08).toFixed(1)),
      reviews: 5 + (i % 25),
      verified: i % 2 === 0,
      isVerified: i % 2 === 0,
      audience,
      forStudents: audience === 'students',
      furnished: true,
      createdAt: new Date(Date.now() - i * 3600 * 1000 * 4).toISOString(),
    });
  }

  return list;
}
