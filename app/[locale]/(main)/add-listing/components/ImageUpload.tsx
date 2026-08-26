'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePlus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageUploadProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function ImageUpload({
  onChange,
  maxFiles = 5,
  maxSize = 5
}: ImageUploadProps) {
  const t = useTranslations('AddListing');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
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
    setPreviewUrls(newPreviewUrls);
    onChange([...previewUrls.map((_, i) => files[i]), ...newFiles]);
  };
  
  const handleRemoveImage = (index: number) => {
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
    
    // Update parent component
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      newPreviewUrls.forEach((_, i) => {
        if (fileInputRef.current?.files?.[i]) {
          dataTransfer.items.add(fileInputRef.current.files[i]);
        }
      });
      
      fileInputRef.current.files = dataTransfer.files;
      onChange(Array.from(dataTransfer.files));
    }
  };
  
  return (
    <div className="space-y-4">
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
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}