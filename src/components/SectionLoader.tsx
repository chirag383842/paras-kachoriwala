import { RefreshCw, AlertTriangle } from 'lucide-react';

type SectionLoaderSkeletonProps = {
  count?: number;
  variant?: 'cards' | 'grid' | 'text' | 'gallery';
};

export function SectionSkeleton({ count = 3, variant = 'cards' }: SectionLoaderSkeletonProps) {
  if (variant === 'grid') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card p-7 space-y-4">
            <div className="skeleton h-6 w-32 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-5 w-24 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'gallery') {
    return (
      <div className="mt-10 columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance] animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton mb-4 rounded-2xl h-64 w-full break-inside-avoid" />
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-3 animate-pulse max-w-lg mx-auto">
        <div className="skeleton h-8 w-1/2 mx-auto rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 mx-auto rounded" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 max-w-5xl mx-auto animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[4/3] w-full" />
          <div className="p-6 space-y-3">
            <div className="skeleton h-7 w-40 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-10 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

type SectionErrorProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function SectionError({
  title = 'Unable to load this information.',
  message = 'There was a temporary problem loading the data. Please try again.',
  onRetry,
  compact = false,
}: SectionErrorProps) {
  return (
    <div
      className={`rounded-2xl border border-red-200 bg-red-50/70 ${
        compact ? 'p-4' : 'p-8 sm:p-10'
      } text-center max-w-lg mx-auto animate-fade-up`}
    >
      <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle size={compact ? 18 : 24} />
      </div>
      <h3 className={`mt-4 font-display font-bold text-red-900 ${compact ? 'text-sm' : 'text-xl'}`}>
        {title}
      </h3>
      {!compact && (
        <p className="mt-2 text-sm text-red-700/80 leading-relaxed">{message}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-5 inline-flex items-center gap-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all font-semibold shadow-sm ${
            compact ? 'px-4 py-2 text-xs' : 'px-6 py-2.5 text-sm'
          }`}
        >
          <RefreshCw size={compact ? 13 : 16} />
          Try Again
        </button>
      )}
    </div>
  );
}
