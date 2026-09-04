import { Images, ArrowRight, RefreshCw } from 'lucide-react';
import { useGallery } from '@/lib/hooks';
import SectionHeading from '@/components/SectionHeading';
import { SectionError } from '@/components/SectionLoader';
import type { Page } from '@/components/Navbar';

type Props = { onNavigate: (page: Page) => void };

export default function GalleryPreview({ onNavigate }: Props) {
  const { data: galleryImages, loading, error, refetch } = useGallery();
  const preview = (galleryImages ?? []).slice(0, 6);

  return (
    <section className="bg-spice-100/40 section-pad">
      <div className="container-max">
        <SectionHeading
          eyebrow="Gallery"
          title="A Glimpse of the Experience"
          subtitle="Real moments — the food, the shop, and the people who make it special."
        />

        <div className="mt-10">
          {error ? (
            <SectionError
              title="Unable to load gallery preview"
              message="Photos couldn't be loaded right now. Tap Try Again or visit the full gallery page."
              onRetry={refetch}
            />
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`skeleton rounded-2xl aspect-square ${
                    i === 1 ? 'col-span-2 row-span-2' : ''
                  }`}
                />
              ))}
            </div>
          ) : preview.length === 0 ? (
            <div className="card p-10 text-center max-w-md mx-auto">
              <Images size={36} className="mx-auto text-spice-300 mb-3" />
              <p className="text-charcoal-700 font-bold">Gallery photos coming soon</p>
              <p className="text-charcoal-500 text-sm mt-2">
                Visit the full gallery page, or check back soon for new photos!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {preview.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => onNavigate('gallery')}
                  className={`group relative overflow-hidden rounded-2xl shadow-card animate-scale-in ${
                    i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                  }`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  aria-label={`View gallery: ${img.caption || img.alt}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-2 left-2 right-2 text-left text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {img.caption || img.alt}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={() => onNavigate('gallery')} className="btn-outline group">
            <Images size={18} />
            View Full Gallery
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          {error && (
            <button
              onClick={refetch}
              type="button"
              className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5"
              aria-label="Retry gallery"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
