export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function SentenceSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-gray-100 p-4">
          <SkeletonLine className="h-4 w-3/4" />
          <SkeletonLine className="h-3 w-1/2" />
          <div className="flex gap-2">
            <SkeletonLine className="h-5 w-16" />
            <SkeletonLine className="h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
