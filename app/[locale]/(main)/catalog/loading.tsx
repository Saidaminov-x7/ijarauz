import { ListingSkeleton } from './components/ListingSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      
      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ListingSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}