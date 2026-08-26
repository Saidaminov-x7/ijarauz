import { randomUUID } from 'crypto';

export function sanitizeInput(input: string): string {
  if (!input) return '';
  // Remove dangerous characters and basic HTML tags
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  // Allow basic formatting tags
  return input
    .replace(/<(?!(\/?(b|i|em|strong|p|br|ul|ol|li)\b))[^>]+>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function generateSafeFilename(originalName: string): string {
  const extension = originalName.split('.').pop()?.toLowerCase() || '';
  const safeExtension = extension.replace(/[^a-z0-9]/g, '');
  return `${randomUUID()}.${safeExtension || 'jpg'}`;
}

export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(`image/${extension}`);
}

export function isValidFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}
