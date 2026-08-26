'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export function ListingSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div className="aspect-w-16 aspect-h-12 overflow-hidden bg-stone-100 dark:bg-stone-700">
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-4 w-1/2" />
        <div className="flex items-center gap-4 text-sm">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}