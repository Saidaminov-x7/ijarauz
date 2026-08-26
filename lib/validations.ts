import { z } from 'zod';

/**
 * Узбекский номер телефона: +998 XX XXX-XX-XX
 * Код оператора: 33,50,55,61,62,65,66,67,70,71,72,73,74,75,76,77,78,88,90,91,93,94,95,97,98,99
 * Здесь используется упрощённая, но безопасная проверка формата.
 */
export const uzPhoneRegex = /^\+998\d{9}$/;

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ''))
  .refine((v) => uzPhoneRegex.test(v), 'Введите номер в формате +998 90 123-45-67');

export const MAX_FILE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/** Клиентская проверка файла перед загрузкой фото объявления. */
export function validateImageFile(file: File): string | null {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || !ACCEPTED_IMAGE_EXTENSIONS.includes(ext)) {
    return 'Допустимы только файлы .jpg, .png, .webp';
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `Файл больше ${MAX_FILE_SIZE_MB} МБ`;
  }
  return null;
}

/** Zod-схема формы добавления объявления (используется с react-hook-form). */
export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, 'Минимум 10 символов')
    .max(120, 'Максимум 120 символов'),
  description: z
    .string()
    .trim()
    .min(20, 'Минимум 20 символов')
    .max(2000, 'Максимум 2000 символов'),
  type: z.enum(['apartment', 'room', 'daily']),
  region: z.string().trim().min(1, 'Выберите регион'),
  district: z.string().trim().min(1, 'Выберите район'),
  address: z.string().trim().max(200, 'Максимум 200 символов').optional().or(z.literal('')),
  price: z.coerce
    .number({ error: 'Укажите цену' })
    .positive('Цена должна быть больше 0')
    .max(100_000, 'Слишком большая цена'),
  rooms: z.coerce.number().int().min(1, 'Минимум 1').max(20, 'Максимум 20'),
  area: z.coerce.number().positive('Укажите площадь').max(2000, 'Слишком большая площадь'),
  floor: z.coerce.number().int().min(0, 'Минимум 0').max(200, 'Максимум 200'),
  furnished: z.boolean().default(false),
  audience: z.enum(['all', 'students', 'families', 'girls', 'boys']),
  phone: phoneSchema,
});

// z.coerce.number() даёт разные "входные"/"выходные" типы —
// ListingFormInput используется в useForm<...>, ListingFormValues — в onSubmit.
export type ListingFormInput  = z.input<typeof listingSchema>;
export type ListingFormValues = z.output<typeof listingSchema>;
