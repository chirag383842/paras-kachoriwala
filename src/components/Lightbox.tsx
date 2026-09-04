import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryImage } from '@/lib/types';

type Props = {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export default function Lightbox({ images, index, onClose, onNavigate }: Props) {
  const next = useCallback(() => onNavigate((index + 1) % images.length), [index, images.length, onNavigate]);
  const prev = useCallback(() => onNavigate((index - 1 + images.length) % images.length), [index, images.length, onNavigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, next, prev]);

  const img = images[index];
  if (!img) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal-950/95 backdrop-blur-sm animate-fade-in p-4 sm:p-8" onClick={onClose} role="dialog" aria-modal="true" aria-label={img.alt}>
      <button onClick={onClose} className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors tap-target" aria-label="Close">
        <X size={22} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-2 sm:left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors tap-target"
        aria-label="Previous image"
      >
        <ChevronLeft size={24} />
      </button>

      <figure className="max-w-5xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img src={img.src} alt={img.alt} decoding="async" className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl animate-scale-in" />
        {img.caption && (
          <figcaption className="mt-4 text-center text-spice-50/90 text-sm font-semibold tracking-wide">
            {img.caption}
          </figcaption>
        )}
        <p className="mt-1 text-xs text-spice-100/50">{index + 1} of {images.length}</p>
      </figure>

      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-2 sm:right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors tap-target"
        aria-label="Next image"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
