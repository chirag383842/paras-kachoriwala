import { Images, ArrowRight } from 'lucide-react';
import { useGallery } from '@/lib/hooks';
import SectionHeading from '@/components/SectionHeading';
import type { Page } from '@/components/Navbar';

type Props = { onNavigate: (page: Page) => void };

export default function GalleryPreview({ onNavigate }: Props) {
  const { data: galleryImages, loading } = useGallery();
  const preview = (galleryImages ?? []).slice(0, 6);

  return (
    <section className="bg-spice-100/40 section-pad">
      <div className="container-max">
        <SectionHeading
          eyebrow="Gallery"
          title="A Glimpse of the Experience"
          subtitle="Real moments — the food, the shop, and the people who make it special."
        />

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? [1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`skeleton rounded-2xl aspect-square ${
                    i === 1 ? 'col-span-2 row-span-2' : ''
                  }`}
                />
              ))
            : preview.map((img, i) => (
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
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-2 left-2 right-2 text-left text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {img.caption || img.alt}
                  </span>
                </button>
              ))}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => onNavigate('gallery')} className="btn-outline group">
            <Images size={18} />
            View Full Gallery
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
