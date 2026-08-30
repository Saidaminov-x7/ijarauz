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
import { createListing, uploadMedia, getSiteSettings, estimateFairPrice } from '@/lib/api';
import { compressImage } from '@/lib/image-compress';
import { UploadCloud, Image as ImageIcon, Sparkles, Trash2, GripVertical, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
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

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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

  // B1: Автосохранение черновика формы в localStorage
  useEffect(() => {
    const subscription = form.watch((values) => {
      const hasData = Object.values(values).some(
        (v) => typeof v === 'string' && v.trim().length > 0
      );
      if (hasData) {
        try {
          localStorage.setItem('add-listing-draft', JSON.stringify(values));
        } catch {
          // ignore localStorage error
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // B1: Предложение восстановить сохранённый черновик при входе на страницу
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('add-listing-draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        const hasData = Object.values(parsed).some(
          (v) => typeof v === 'string' && v.trim().length > 0
        );
        if (hasData) {
          toast('Найден сохранённый черновик', {
            description: 'Восстановить ранее заполненные данные формы?',
            action: {
              label: 'Восстановить',
              onClick: () => {
                form.reset(parsed);
                toast.success('Черновик успешно восстановлен!');
              },
            },
            duration: 8000,
          });
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }, [form]);

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
    // Проверяем настройки автомодерации
    getSiteSettings().then((settings) => {
      setAutoModerationEnabled(settings.autoModerationEnabled || false);
      setMaxImagesPerListing(settings.maxImagesPerListing || 10);
    });
  }, []);

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

  // B2: Drag & Drop сортировка фото
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    const [draggedFile] = newFiles.splice(draggedIndex, 1);
    const [draggedPreview] = newPreviews.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);
    newPreviews.splice(index, 0, draggedPreview);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ListingFormValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // 1. Create listing (на бэкенде создаётся сразу со статусом ACTIVE)
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

      // 3. Очищаем сохранённый черновик
      try {
        localStorage.removeItem('add-listing-draft');
      } catch {}

      // 4. Показываем модалку успешного создания
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
                <div className="flex items-center justify-between">
                  <FormLabel>{t('description')}</FormLabel>
                  <button
                    type="button"
                    onClick={() => {
                      const typeVal = form.getValues('type') || 'Квартира';
                      const cityVal = form.getValues('city') || 'Ташкенте';
                      const districtVal = form.getValues('district') || '';
                      const roomsVal = form.getValues('rooms') || '2';
                      const areaVal = form.getValues('area') || '60';

                      const generatedDesc = `Сдаётся уютная и светлая ${roomsVal}-комнатная недвижимость (${typeVal.toLowerCase()}) площадью ${areaVal} м² в г. ${cityVal}${districtVal ? ', ' + districtVal : ''}.\n\nКвартира полностью меблирована, оборудована всей необходимой современной бытовой техникой (кондиционер, холодильник, стиральная машина, Wi-Fi интернет).\nОтличная транспортная развязка, развитая инфраструктура, рядом супермаркеты, школы и остановки.\n\nПорядочным жильцам на длительный срок. Звоните для согласования времени просмотра!`;

                      form.setValue('description', generatedDesc, { shouldValidate: true });
                      if (!form.getValues('title')) {
                        form.setValue('title', `${roomsVal}-комн. ${typeVal.toLowerCase()}, ${areaVal} м², ${districtVal || cityVal}`, { shouldValidate: true });
                      }
                      toast.success('✨ AI успешно сгенерировал продающее описание!');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                  >
                    <Sparkles size={13} className="text-amber-500" />
                    ✨ Сгенерировать с помощью ИИ
                  </button>
                </div>
                <FormControl>
                  <Textarea
                    placeholder={t('descriptionPlaceholder')}
                    className="min-h-[120px] rounded-xl"
                    {...field}
                  />
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
                  <FormLabel>{t('city')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Выберите город" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cityOptions.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedCity || districtOptions.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={selectedCity ? "Выберите район" : "Сначала выберите город"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {districtOptions.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t('location')}</FormLabel>
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        toast.error('Геолокация не поддерживается вашим браузером');
                        return;
                      }
                      toast.info('Определяем ваше точное местоположение...');
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
                          form.setValue('address', `GPS: ${coords} (рядом с вами)`, { shouldValidate: true });
                          toast.success('📍 Точная геолокация определена!');
                        },
                        () => {
                          toast.error('Не удалось получить доступ к геолокации');
                        }
                      );
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                  >
                    📍 Определить моё местоположение (GPS)
                  </button>
                </div>
                <FormControl>
                  <Input placeholder={t('locationPlaceholder')} className="h-11 rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t('price')}</FormLabel>
                    {priceEstimate && priceEstimate.average && (
                      <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">
                        Средняя цена: ~${priceEstimate.average}/мес
                      </span>
                    )}
                  </div>
                  <FormControl>
                    <Input placeholder="500" className="h-11 rounded-xl" {...field} />
                  </FormControl>
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

          {/* Photo Upload Section with Drag-and-Drop & Cover indicator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel>{t('uploadImages') || 'Фотографии'}</FormLabel>
              <span className="text-xs text-stone-400">
                Перетащите фото для смены порядка (первое фото — обложка)
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 p-6 transition-colors hover:border-primary-500 dark:border-white/10 dark:hover:border-primary-500/50 bg-stone-50/50 dark:bg-white/[0.02]">
              <UploadCloud className="h-10 w-10 text-stone-400 mb-2" />
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Загрузите фотографии жилья
              </p>
              <p className="text-xs text-stone-400 mt-1">PNG, JPG, WEBP до 15MB</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="mt-4 text-xs file:mr-4 file:rounded-xl file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-950/60 dark:file:text-primary-400 cursor-pointer"
              />
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {previews.map((preview, index) => (
                  <div
                    key={preview + index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group aspect-video rounded-xl overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${
                      draggedIndex === index
                        ? 'opacity-40 scale-95 border-primary-500'
                        : index === 0
                        ? 'border-primary-500 ring-2 ring-primary-500/30'
                        : 'border-stone-200 dark:border-white/10 hover:border-stone-300'
                    }`}
                  >
                    <img src={preview} alt="Upload preview" className="w-full h-full object-cover select-none" />

                    {/* Cover badge */}
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-primary-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        Обложка
                      </span>
                    )}

                    {/* Drag indicator & remove button */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="p-1 rounded-lg bg-black/70 text-white hover:bg-rose-600 transition-colors shadow-xs"
                        title="Удалить фото"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="absolute bottom-1 right-1 p-1 rounded bg-black/40 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <GripVertical size={12} />
                      <span>{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary-600 font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
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