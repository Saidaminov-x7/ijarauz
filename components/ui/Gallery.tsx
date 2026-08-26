'use client';

import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

/** Карусель фотографий объявления на базе embla-carousel-react. */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {images.map((src, i) => (
            <div key={src + i} className="relative aspect-video min-w-0 flex-[0_0_100%]">
              <Image
                src={src}
                alt={`${alt} — фото ${i + 1}`}
                fill
                // Первое фото — приоритетная загрузка (виден на первом экране, LCP)
                priority={i === 0}
                loading={i === 0 ? undefined : 'lazy'}
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Предыдущее фото"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow transition hover:bg-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Следующее фото"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow transition hover:bg-white"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </div>
  );
}
