import { ArrowRight, Navigation, Star } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import type { Page } from '@/components/Navbar';

type Props = {
  onNavigate: (page: Page) => void;
};

export default function Hero({ onNavigate }: Props) {
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-charcoal-950">
      <div className="absolute inset-0">
        <img
          src="/images/kachori.webp"
          alt="Fresh Kachori served at Paras Kachoriwala"
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/70 via-charcoal-950/55 to-charcoal-950/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/80 via-transparent to-transparent" />
      </div>

      <div className="relative container-max pt-24 pb-16 sm:pt-28">
        <div className="max-w-2xl">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-marigold-300">
            <Star size={13} className="fill-marigold-400 text-marigold-400" />
            Famous Local Food Brand
          </div>

          <h1 className="animate-fade-up mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] text-balance" style={{ animationDelay: '0.08s' }}>
            {BRAND.name}
          </h1>

          <p className="animate-fade-up mt-3 text-base sm:text-lg font-semibold uppercase tracking-[0.2em] text-marigold-300" style={{ animationDelay: '0.16s' }}>
            {BRAND.tagline}
          </p>

          <p className="animate-fade-up mt-6 text-lg sm:text-xl text-spice-50/85 leading-relaxed max-w-xl text-balance" style={{ animationDelay: '0.24s' }}>
            Serving delicious Kachori and Bhel loved by our customers — fresh, crispy and full of authentic taste.
          </p>

          <div className="animate-fade-up mt-9 flex flex-wrap gap-3" style={{ animationDelay: '0.32s' }}>
            <button onClick={() => onNavigate('menu')} className="btn-primary group">
              View Menu
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate('directions')}
              className="btn bg-white/10 text-white backdrop-blur-md border border-white/25 hover:bg-white/20 active:scale-[0.98] flex items-center gap-2"
            >
              <Navigation size={18} />
              Get Directions
            </button>
          </div>

          <div className="animate-fade-up mt-10 flex items-center gap-5 text-spice-50/70" style={{ animationDelay: '0.4s' }}>
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <span key={i} className="h-8 w-8 rounded-full border-2 border-charcoal-950 bg-gradient-to-br from-spice-400 to-spice-600" />
              ))}
            </div>
            <p className="text-sm">
              <span className="font-bold text-white">Loved</span> by our regular customers
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-spice-50 to-transparent pointer-events-none" />
    </section>
  );
}
