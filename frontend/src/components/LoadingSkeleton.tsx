interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      role="status"
      aria-label="Carregando..."
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function ModuleSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-5 h-5 mt-1" />
        <div className="flex-1">
          <Skeleton className="h-6 w-2/3 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-3 w-32 mt-2" />
        </div>
        <Skeleton className="w-8 h-8" />
      </div>
      <div className="ml-8 space-y-2">
        <LessonSkeleton />
        <LessonSkeleton />
        <LessonSkeleton />
      </div>
    </div>
  );
}

export function LessonSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="w-6 h-6" />
        <div className="flex-1">
          <Skeleton className="h-4 w-48 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b p-4">
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b p-4">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-10 w-96 mb-2" />
      <Skeleton className="h-5 w-64" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <Skeleton className="h-6 w-48 mb-4" />
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ModuleListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <ModuleSkeleton key={i} />
      ))}
    </div>
  );
}
