'use client';

import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import Image from 'next/image';

/** Карусель фотографий объявления с полноэкранным просмотром (Lightbox) и зумом */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [currentIndex, setCurrentIndex] = useState(0);

  // Состояние полноэкранного Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomLevel(1);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
  };

  const lightboxPrev = useCallback(() => {
    setZoomLevel(1);
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const lightboxNext = useCallback(() => {
    setZoomLevel(1);
    setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Обработка горячих клавиш в полноэкранном режиме
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
      if (e.key === '+' || e.key === '=') setZoomLevel((z) => Math.min(z + 0.5, 3));
      if (e.key === '-') setZoomLevel((z) => Math.max(z - 0.5, 1));
    };

    // Блокируем скролл страницы
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, lightboxPrev, lightboxNext]);

  return (
    <>
      <div className="relative group">
        <div ref={emblaRef} className="overflow-hidden rounded-2xl bg-stone-900">
          <div className="flex">
            {images.map((src, i) => (
              <div
                key={src + i}
                onClick={() => openLightbox(i)}
                className="relative aspect-video min-w-0 flex-[0_0_100%] cursor-zoom-in select-none"
              >
                <Image
                  src={src}
                  alt={`${alt} — фото ${i + 1}`}
                  fill
                  priority={i === 0}
                  loading={i === 0 ? undefined : 'lazy'}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка открытия на весь экран */}
        <button
          type="button"
          onClick={() => openLightbox(currentIndex)}
          aria-label="Открыть во весь экран"
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md cursor-pointer"
        >
          <Maximize2 size={14} />
          <span>{currentIndex + 1} / {images.length}</span>
        </button>

        {/* Стрелки переключения */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 cursor-pointer dark:bg-stone-800/90 dark:text-stone-200"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 cursor-pointer dark:bg-stone-800/90 dark:text-stone-200"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* ─── FULLSCREEN LIGHTBOX MODAL ────────────────────────────────────── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 p-4 select-none"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div
            className="w-full flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
              <span>{lightboxIndex + 1} / {images.length}</span>
              <span className="hidden sm:inline text-white/40">•</span>
              <span className="hidden sm:inline text-xs text-white/60 truncate max-w-xs">{alt}</span>
            </div>

            {/* Controls: Zoom & Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 3))}
                disabled={zoomLevel >= 3}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 cursor-pointer"
                title="Увеличить (+)"
              >
                <ZoomIn size={18} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.5, 1))}
                disabled={zoomLevel <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 cursor-pointer"
                title="Уменьшить (-)"
              >
                <ZoomOut size={18} />
              </button>
              {zoomLevel > 1 && (
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Сбросить зум"
                >
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={closeLightbox}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer ml-2"
                title="Закрыть (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Image Center Area */}
          <div
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden my-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative max-h-full max-w-full flex items-center justify-center transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={images[lightboxIndex]}
                alt={`${alt} — полноэкранное фото ${lightboxIndex + 1}`}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Lightbox Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={lightboxPrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={lightboxNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                  aria-label="Следующее фото"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div
              className="flex items-center gap-2 max-w-full overflow-x-auto p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, idx) => (
                <button
                  key={src + idx}
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setLightboxIndex(idx);
                  }}
                  className={`relative h-14 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    idx === lightboxIndex
                      ? 'border-primary-500 scale-105 shadow-md shadow-primary-500/30'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
