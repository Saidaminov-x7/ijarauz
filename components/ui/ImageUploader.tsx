'use client';

import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { validateImageFile } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
}

/** Загрузчик фото с клиентской проверкой расширения и размера файла. */
export function ImageUploader({ files, onChange, max = 10 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const valid: File[] = [];

    for (const file of incoming) {
      const error = validateImageFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }
      valid.push(file);
    }

    if (files.length + valid.length > max) {
      toast.warning(`Максимум ${max} фотографий`);
    }

    onChange([...files, ...valid].slice(0, max));
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {files.map((file, i) => (
        <div
          key={i}
          className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 dark:border-white/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => removeAt(i)}
            aria-label="Удалить фото"
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {files.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-stone-200 text-stone-400 transition',
            'hover:border-teal-400 hover:text-teal-500 dark:border-white/10 dark:hover:border-teal-600'
          )}
        >
          <ImagePlus size={20} />
          <span className="text-xs">Добавить</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
