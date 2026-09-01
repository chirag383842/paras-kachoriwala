import { CheckCircle2, XCircle, ArrowRight, Leaf, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { Page } from '@/components/Navbar';

type Props = {
  product: Product;
  loading: boolean;
  reverse?: boolean;
  onNavigate: (page: Page) => void;
};

export default function FeaturedProduct({ product, loading, reverse = false, onNavigate }: Props) {
  const isJain = product?.slug.includes('jain');
  const isSwaminarayan = product?.slug.includes('swaminarayan');

  return (
    <div
      className={`grid gap-8 lg:gap-12 lg:grid-cols-2 items-center ${
        reverse ? 'lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      <div className="relative">
        <div className="relative overflow-hidden rounded-[2rem] shadow-warm aspect-[4/3] bg-charcoal-950 flex items-center justify-center">
          {loading || !product ? (
            <div className="skeleton h-full w-full" />
          ) : product.image_url ? (
            <>
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/40 to-transparent" />
              {product.featured && (
                <span className="absolute top-4 left-4 rounded-full bg-marigold-400 text-charcoal-900 text-xs font-bold uppercase tracking-wider px-3 py-1 shadow-lg">
                  Signature
                </span>
              )}
            </>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-spice-900 via-charcoal-900 to-charcoal-950 p-8 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-3xl bg-white/10 border border-white/20 grid place-items-center mb-4">
                {isJain || isSwaminarayan ? (
                  <Leaf size={40} className="text-leaf-400" />
                ) : (
                  <Sparkles size={40} className="text-marigold-400" />
                )}
              </div>
              <h4 className="font-display text-2xl font-bold text-white">{product.name}</h4>
              <p className="text-xs text-spice-200/70 mt-2 max-w-xs leading-relaxed">
                {isJain
                  ? 'Prepared strictly without onion or garlic per Jain traditions.'
                  : isSwaminarayan
                  ? 'Pure satvik preparation following Swaminarayan guidelines.'
                  : 'Freshly fried and served crisp with authentic house chutneys.'}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-marigold-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                📸 Photo Coming Soon
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        {loading || !product ? (
          <div className="space-y-4">
            <div className="skeleton h-8 w-40 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-12 w-32 rounded-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-900">{product.name}</h3>
              <span className="rounded-full bg-spice-600 text-white text-lg font-bold px-4 py-1 shadow-warm">
                ₹{product.price}
              </span>
              {isJain && (
                <span className="text-xs font-bold bg-leaf-100 text-leaf-800 border border-leaf-300 px-3 py-1 rounded-full">
                  🌿 100% Jain
                </span>
              )}
              {isSwaminarayan && (
                <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full">
                  ✨ Satvik
                </span>
              )}
            </div>

            <p className="mt-5 text-base sm:text-lg text-charcoal-600 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  product.available ? 'bg-leaf-500/10 text-leaf-700' : 'bg-red-500/10 text-red-700'
                }`}
              >
                {product.available ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {product.available ? 'Available Today' : 'Currently Sold Out'}
              </span>
            </div>

            <button onClick={() => onNavigate('menu')} className="btn-outline mt-8 group">
              View All 3 Kachori Varieties & Full Menu
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
