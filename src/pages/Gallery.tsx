import { useState, useMemo } from 'react';
import { useGallery } from '@/lib/hooks';
import { GALLERY_CATEGORIES } from '@/lib/galleryData';
import Lightbox from '@/components/Lightbox';
import type { GalleryImage, GalleryCategory } from '@/lib/types';
import { Sparkles, Users, Utensils, Store, Home as HomeIcon, BookOpen, Layers, RefreshCw } from 'lucide-react';
import { SectionSkeleton, SectionError } from '@/components/SectionLoader';

export default function Gallery() {
  const { data: galleryImages, loading, error, refetch } = useGallery();
  const [active, setActive] = useState<GalleryCategory>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = galleryImages ?? [];

  const filtered = useMemo(() => {
    if (active === 'all') return images;
    return images.filter((g) => g.category === active);
  }, [active, images]);

  const openLightbox = (img: GalleryImage) => {
    const idx = filtered.findIndex((g) => g.id === img.id);
    if (idx >= 0) setLightboxIndex(idx);
  };

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'food':
        return <Utensils size={15} />;
      case 'shop':
        return <Store size={15} />;
      case 'customers':
        return <Users size={15} />;
      case 'home':
        return <HomeIcon size={15} />;
      case 'about':
        return <BookOpen size={15} />;
      default:
        return <Layers size={15} />;
    }
  };

  return (
    <div className="pt-20 sm:pt-24">
      <section className="container-max section-pad">
        <div className="text-center max-w-2xl mx-auto">
          <div className="eyebrow justify-center mb-3">
            <span className="h-px w-8 bg-spice-400" /> Photo Gallery <span className="h-px w-8 bg-spice-400" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-900 text-balance">
            Moments at Paras Kachoriwala
          </h1>
          <p className="mt-4 text-lg text-charcoal-600 text-balance">
            Browse real photographs of our food, stall setup, and customer moments.
          </p>
          {error && (
            <button
              onClick={refetch}
              type="button"
              className="mt-5 inline-flex items-center gap-1.5 btn-outline text-xs py-2 px-4"
            >
              <RefreshCw size={14} />
              Reload Gallery
            </button>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {GALLERY_CATEGORIES.map((c) => {
            const count =
              c.id === 'all' ? images.length : images.filter((g) => g.category === c.id).length;
            const isSelected = active === c.id;

            return (
              <button
                key={c.id}
                onClick={() => setActive(c.id as GalleryCategory)}
                className={`rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-spice-600 text-white shadow-warm font-bold ring-2 ring-spice-500/20'
                    : 'bg-white text-charcoal-700 border border-spice-200 hover:border-spice-400 hover:text-spice-700'
                }`}
              >
                {getCategoryIcon(c.id)}
                <span>{c.shortLabel || c.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-spice-100 text-spice-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <SectionSkeleton count={6} variant="gallery" />
        ) : error ? (
          <div className="mt-10">
            <SectionError
              title="Unable to load gallery"
              message="The gallery couldn't be loaded right now. You can try again, and we'll keep checking in the background."
              onRetry={refetch}
            />
          </div>
        ) : filtered.length > 0 ? (
          <div className="mt-10 columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
            {filtered.map((img, i) => (
              <button
                key={img.id}
                onClick={() => openLightbox(img)}
                className="group relative mb-3 sm:mb-4 block w-full overflow-hidden rounded-2xl shadow-card break-inside-avoid animate-scale-in focus:outline-none focus-visible:ring-2 focus-visible:ring-spice-500"
                style={{ animationDelay: `${i * 0.05}s` }}
                aria-label={`Open photo: ${img.caption || img.alt}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] font-bold text-marigold-300 uppercase tracking-wider block">
                    {img.category === 'customers' ? '👥 Customers' : img.category}
                  </span>
                  <span className="text-sm font-semibold text-white block mt-0.5">
                    {img.caption || img.alt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-12 card p-12 text-center max-w-md mx-auto animate-fade-up">
            <Sparkles size={36} className="mx-auto text-spice-300 mb-3" />
            <h3 className="text-charcoal-900 font-display text-xl font-bold">
              No Photos in {GALLERY_CATEGORIES.find((c) => c.id === active)?.label || 'this Section'}
            </h3>
            <p className="text-charcoal-600 text-sm mt-2 leading-relaxed">
              You can upload and assign photos to this section from the Author Panel.
            </p>
          </div>
        )}
      </section>

      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <Lightbox
          images={filtered.map((g) => ({
            id: g.id,
            src: g.src,
            alt: g.alt,
            category: g.category === 'about' || g.category === 'home' ? 'shop' : g.category,
            caption: g.caption,
          }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
