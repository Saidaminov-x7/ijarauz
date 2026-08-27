'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { createListing, publishListing, uploadMedia, getSiteSettings, estimateFairPrice } from '@/lib/api';
import { compressImage } from '@/lib/image-compress';
import { useAuthStore } from '@/store/useAuthStore';
import { UploadCloud, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { regions, regionNames } from '@/lib/regions';
import ProtectedRoute from '@/components/ProtectedRoute';

const cityOptions = Object.keys(regions);

const listingSchema = z.object({
  title: z.string().min(5, 'Минимум 5 символов').max(200),
  description: z.string().min(20, 'Минимум 20 символов'),
  price: z.string().regex(/^\d+$/, 'Введите корректное число'),
  type: z.enum(['APARTMENT', 'HOUSE', 'ROOM', 'COMMERCIAL', 'LAND']),
  city: z.string().min(2, 'Укажите город'),
  district: z.string().min(2, 'Укажите район'),
  address: z.string().optional(),
  rooms: z.string().regex(/^\d+$/, 'Число комнат'),
  area: z.string().regex(/^\d+$/, 'Площадь в м²'),
  floor: z.string().optional(),
  totalFloors: z.string().optional(),
});

type ListingFormValues = z.infer<typeof listingSchema>;

export default function AddListingPage() {
  return (
    <ProtectedRoute>
      <AddListingContent />
    </ProtectedRoute>
  );
}

function AddListingContent() {
  const t = useTranslations('AddListing');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'ru';
  const { fetchUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [autoModerationEnabled, setAutoModerationEnabled] = useState(false);
  const [maxImagesPerListing, setMaxImagesPerListing] = useState(10);
  const [priceEstimate, setPriceEstimate] = useState<{ min: number | null; max: number | null; average: number | null; sampleSize?: number } | null>(null);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '', description: '', price: '', type: 'APARTMENT', city: '', district: '',
      address: '', rooms: '', area: '', floor: '', totalFloors: '',
    },
  });

  // Получаем список районов для выбранного города
  const selectedCity = form.watch('city');
  const selectedDistrict = form.watch('district');
  const selectedRooms = form.watch('rooms');
  const selectedArea = form.watch('area');
  const selectedType = form.watch('type');
  const districtOptions = selectedCity && regions[selectedCity] ? regions[selectedCity] : [];

  useEffect(() => {
    if (selectedCity && selectedRooms && selectedArea && Number(selectedRooms) >= 0 && Number(selectedArea) > 0) {
      const timer = setTimeout(() => {
        estimateFairPrice({
          city: selectedCity,
          district: selectedDistrict || undefined,
          rooms: Number(selectedRooms),
          area: Number(selectedArea),
          type: selectedType,
        }).then((res) => {
          if (res && res.average) {
            setPriceEstimate(res);
          } else {
            setPriceEstimate(null);
          }
        }).catch(() => setPriceEstimate(null));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPriceEstimate(null);
    }
  }, [selectedCity, selectedDistrict, selectedRooms, selectedArea, selectedType]);

  useEffect(() => {
    fetchUser().then(() => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated) {
        router.push(`/${locale}/login?redirect=/add-listing`);
      }
    });
    
    // Проверяем настройки автомодерации
    getSiteSettings().then((settings) => {
      setAutoModerationEnabled(settings.autoModerationEnabled || false);
      setMaxImagesPerListing(settings.maxImagesPerListing || 10);
    });
  }, [fetchUser, locale, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const remaining = Math.max(0, maxImagesPerListing - selectedFiles.length);
    const files = Array.from(e.target.files).slice(0, remaining);
    if (files.length < e.target.files.length) {
      setServerError(`Можно загрузить не более ${maxImagesPerListing} фото`);
      return;
    }
    if (files.length === 0) return;
    
    // Валидация типа и размера файлов
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setServerError('Можно загружать только изображения');
        return;
      }
      if (file.size > 15 * 1024 * 1024) { // 15MB
        setServerError('Максимальный размер исходного фото — 15MB');
        return;
      }
    }
    
    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const onSubmit = async (data: ListingFormValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // 1. Create listing
      const listing = await createListing({
        title: data.title,
        description: data.description,
        price: Number(data.price),
        type: data.type,
        city: data.city,
        district: data.district,
        address: data.address || undefined,
        rooms: Number(data.rooms),
        area: Number(data.area),
        floor: data.floor ? Number(data.floor) : undefined,
        totalFloors: data.totalFloors ? Number(data.totalFloors) : undefined,
      });

      // 2. Client-side compress and upload images
      if (selectedFiles.length > 0 && listing?.id) {
        for (const file of selectedFiles) {
          try {
            const compressed = await compressImage(file, { maxWidth: 1920, quality: 0.82 });
            await uploadMedia(compressed, listing.id);
          } catch (uploadErr) {
            console.error('Failed to upload image:', uploadErr);
            setServerError('Не удалось загрузить одно или несколько фото. Попробуйте позже.');
          }
        }
      }

      // 3. После успешного создания — показываем модалку модерации
      setShowModerationModal(true);
    } catch (error: any) {
      console.error('Failed to add listing:', error);
      const msg = error.response?.data?.message || 'Не удалось создать объявление. Проверьте форму.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="mb-8 text-3xl font-bold text-stone-900 dark:text-white">
        {t('title')}
      </h1>

      {serverError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400 animate-in fade-in duration-200">
          {serverError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('type')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={t('selectType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="APARTMENT">{t('apartment')}</SelectItem>
                    <SelectItem value="HOUSE">{t('house')}</SelectItem>
                    <SelectItem value="ROOM">{t('room')}</SelectItem>
                    <SelectItem value="COMMERCIAL">Коммерческая</SelectItem>
                    <SelectItem value="LAND">Участок</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('title')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('titlePlaceholder')} className="h-11 rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('description')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t('descriptionPlaceholder')} className="rounded-xl" {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Город</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('district', '');
                    }}>
                      <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder="Выберите город" /></SelectTrigger></FormControl>
                      <SelectContent>{cityOptions.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Район</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} disabled={!selectedCity || districtOptions.length === 0}>
                      <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder={!selectedCity ? "Сначала выберите город" : "Выберите район"} /></SelectTrigger></FormControl>
                      <SelectContent>{districtOptions.map((district) => <SelectItem key={district} value={district}>{district}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('price')}</FormLabel>
                  <FormControl>
                    <Input placeholder="1000" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  {priceEstimate && priceEstimate.average && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2 rounded-lg border border-teal-200 dark:border-teal-800/40">
                      <Sparkles size={14} className="shrink-0 text-teal-600 dark:text-teal-400" />
                      <span>
                        Ориентир рынка в этом районе: <strong>${priceEstimate.min} - ${priceEstimate.max}</strong> (средняя: ${priceEstimate.average})
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('area')}</FormLabel>
                  <FormControl>
                    <Input placeholder="75" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="rooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rooms')}</FormLabel>
                  <FormControl>
                    <Input placeholder="2" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('floor') || 'Этаж'}</FormLabel>
                  <FormControl>
                    <Input placeholder="3" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalFloors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('totalFloors') || 'Всего этажей'}</FormLabel>
                  <FormControl>
                    <Input placeholder="9" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-3">
            <FormLabel>{t('uploadImages') || 'Фотографии'}</FormLabel>
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 p-6 transition-colors hover:border-teal-500 dark:border-white/10 dark:hover:border-teal-500/50">
              <UploadCloud className="h-10 w-10 text-stone-400 mb-2" />
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Загрузите фотографии жилья
              </p>
              <p className="text-xs text-stone-400 mt-1">PNG, JPG, WEBP до 10MB</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="mt-4 text-xs file:mr-4 file:rounded-xl file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-teal-950/60 dark:file:text-teal-400 cursor-pointer"
              />
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 pt-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-stone-200 dark:border-white/10">
                    <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-teal-600 font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? t('loading') : t('submit')}
          </Button>
        </form>
      </Form>

      {/* Модалка "Отправлено на модерацию" */}
      <Modal
        isOpen={showModerationModal}
        onClose={() => {
          setShowModerationModal(false);
          router.push(`/${locale}/profile`);
          router.refresh();
        }}
        title={autoModerationEnabled ? "Объявление опубликовано!" : "Отправлено на модерацию"}
      >
        <div className="space-y-4 text-center">
          <p className="text-stone-700 dark:text-stone-300">
            {autoModerationEnabled
              ? "Ваше объявление было автоматически одобрено и опубликовано в каталоге."
              : "Ваше объявление отправлено на модерацию. Обычно проверка занимает до 24 часов."
            }
          </p>
          <Button
            onClick={() => {
              setShowModerationModal(false);
              router.push(`/${locale}/profile`);
              router.refresh();
            }}
            className="w-full"
          >
            Перейти в профиль
          </Button>
        </div>
      </Modal>
    </div>
  );
}