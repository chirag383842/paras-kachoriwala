import { CheckCircle2, XCircle, UtensilsCrossed, Leaf } from 'lucide-react';
import type { Product } from '@/lib/types';

type Props = {
  product: Product;
  loading?: boolean;
};

export default function AvailabilityCard({ product, loading }: Props) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-16 w-16 rounded-2xl" />
        <div className="skeleton mt-4 h-5 w-24 rounded" />
        <div className="skeleton mt-3 h-4 w-20 rounded" />
      </div>
    );
  }

  const available = product.available;
  const isJain = product.slug.includes('jain');
  const isSwaminarayan = product.slug.includes('swaminarayan');

  return (
    <div className={`card p-5 transition-all duration-300 hover:shadow-warm ${!available ? 'opacity-80' : ''}`}>
      <div className="flex items-center gap-4">
        {/* Product Image or Custom Placeholder */}
        <div className="relative shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-spice-100 to-amber-100 border border-spice-200 grid place-items-center text-spice-700 shadow-inner">
              {isJain || isSwaminarayan ? (
                <Leaf size={24} className="text-leaf-600" />
              ) : (
                <UtensilsCrossed size={22} className="text-spice-600" />
              )}
            </div>
          )}

          <span
            className={`absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white ${
              available ? 'bg-leaf-500' : 'bg-red-500'
            }`}
          >
            {available ? <CheckCircle2 size={12} className="text-white" /> : <XCircle size={12} className="text-white" />}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-display text-base sm:text-lg font-bold text-charcoal-900 leading-snug">
              {product.name}
            </h3>
            {isJain && (
              <span className="text-[10px] font-bold bg-leaf-100 text-leaf-800 px-2 py-0.5 rounded-full">
                🌿 Jain
              </span>
            )}
            {isSwaminarayan && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                ✨ Satvik
              </span>
            )}
          </div>
          <p className={`text-xs font-semibold mt-0.5 ${available ? 'text-leaf-600' : 'text-red-600'}`}>
            {available ? 'Available Now' : 'Sold Out'}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-spice-700">₹{product.price}</p>
        </div>
      </div>
    </div>
  );
}
