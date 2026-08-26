'use client';

interface ApartmentImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ApartmentImage({ src, alt, className }: ApartmentImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = '/placeholder-apartment.jpg';
      }}
    />
  );
}