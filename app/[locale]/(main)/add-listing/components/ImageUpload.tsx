'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePlus, Trash2, AlertCircle, CheckCircle2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageUploadProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function ImageUpload({
  onChange,
  maxFiles = 10,
  maxSize = 15,
}: ImageUploadProps) {
  const t = useTranslations('AddListing');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [filesList, setFilesList] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxFileSize = maxSize * 1024 * 1024; // Convert MB to bytes
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newErrors: string[] = [];
    const newFiles: File[] = [];
    const newPreviewUrls: string[] = [...previewUrls];
    
    // Validate files
    files.forEach((file) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        newErrors.push(t('invalidFileType', { filename: file.name }));
        return;
      }
      
      // Check file size
      if (file.size > maxFileSize) {
        newErrors.push(t('fileTooLarge', { filename: file.name, size: maxSize }));
        return;
      }
      
      // Check total files
      if (previewUrls.length + newFiles.length >= maxFiles) {
        newErrors.push(t('maxFilesExceeded', { max: maxFiles }));
        return;
      }
      
      newFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    });
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors([]);
    const updatedFiles = [...filesList, ...newFiles];
    setFilesList(updatedFiles);
    setPreviewUrls(newPreviewUrls);
    onChange(updatedFiles);
  };
  
  const handleRemoveImage = (index: number) => {
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    const newFiles = filesList.filter((_, i) => i !== index);
    setPreviewUrls(newPreviews);
    setFilesList(newFiles);
    onChange(newFiles);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newPreviews = [...previewUrls];
    const newFiles = [...filesList];
    const [draggedUrl] = newPreviews.splice(draggedIndex, 1);
    const [draggedFile] = newFiles.splice(draggedIndex, 1);
    newPreviews.splice(index, 0, draggedUrl);
    newFiles.splice(index, 0, draggedFile);
    setPreviewUrls(newPreviews);
    setFilesList(newFiles);
    setDraggedIndex(index);
    onChange(newFiles);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            {t('uploadImages')}
          </Button>
          <span className="text-sm text-stone-500">
            {t('maxFiles', { max: maxFiles })} | {t('maxSize', { size: maxSize })}MB
          </span>
        </div>
        {previewUrls.length > 1 && (
          <span className="text-xs text-stone-400">
            Перетащите для изменения порядка
          </span>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
        multiple
        className="hidden"
      />
      
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ))}
        </div>
      )}
      
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {previewUrls.map((url, index) => (
            <div
              key={url + index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group aspect-video rounded-xl overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${
                draggedIndex === index
                  ? 'opacity-40 scale-95 border-teal-500'
                  : index === 0
                  ? 'border-teal-500 ring-2 ring-teal-500/30'
                  : 'border-stone-200 dark:border-white/10'
              }`}
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover select-none"
              />

              {index === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-teal-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  Обложка
                </span>
              )}

              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                title="Удалить фото"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="absolute bottom-1 right-1 p-0.5 px-1.5 rounded bg-black/40 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                <GripVertical size={10} />
                <span>{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}