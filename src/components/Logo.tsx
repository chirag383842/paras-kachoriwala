import React from 'react';
import { BRAND } from '@/lib/constants';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon-only' | 'light';
  className?: string;
  onClick?: () => void;
};

export default function Logo({ size = 'md', variant = 'full', className = '', onClick }: Props) {
  const iconDimensions = {
    sm: 'h-9 w-9 min-w-[2.25rem]',
    md: 'h-10 w-10 sm:h-11 sm:w-11 min-w-[2.5rem]',
    lg: 'h-12 w-12 sm:h-14 sm:w-14 min-w-[3rem]',
  };

  const titleSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-lg sm:text-xl font-bold tracking-tight',
    lg: 'text-2xl sm:text-3xl font-bold tracking-tight',
  };

  const taglineSizes = {
    sm: 'text-[9px] font-semibold tracking-[0.16em]',
    md: 'text-[10px] sm:text-[11px] font-semibold tracking-[0.18em]',
    lg: 'text-xs font-semibold tracking-[0.2em]',
  };

  const isLight = variant === 'light';

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`inline-flex items-center gap-3 group select-none transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      aria-label={`${BRAND.name} — Home`}
    >
      {/* Authentic Brand Kachori Emblem */}
      <div
        className={`grid place-items-center rounded-2xl bg-gradient-to-br from-spice-500 via-spice-600 to-spice-800 text-white shadow-warm transition-transform duration-300 group-hover:scale-105 border border-spice-400/40 relative overflow-hidden ${iconDimensions[size]}`}
      >
        {/* Subtle background radial sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />

        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 sm:h-8 sm:w-8 relative z-10 drop-shadow-sm"
          aria-hidden="true"
        >
          {/* Subtle Outer Halo */}
          <circle cx="24" cy="24" r="21" fill="url(#pk_halo_grad)" opacity="0.25" />

          {/* Golden Kachori Shadow & Outer Crust Base */}
          <ellipse
            cx="24"
            cy="28"
            rx="15"
            ry="11"
            fill="url(#pk_crust_base)"
            stroke="#f59e0b"
            strokeWidth="1.2"
          />

          {/* Crispy Golden Puffed Dome Top */}
          <ellipse
            cx="24"
            cy="27"
            rx="13.5"
            ry="9.5"
            fill="url(#pk_golden_puff)"
          />

          {/* Signature Kachori Fluted Pleats / Khasta Gathering Knot */}
          {/* Central top pleat / pinch */}
          <path
            d="M24 20.5 C22 23, 20 25.5, 17 27.5"
            stroke="#b45309"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M24 20.5 C26 23, 28 25.5, 31 27.5"
            stroke="#b45309"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M24 20.5 C24 24, 24 27, 24 29"
            stroke="#d97706"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Kachori Top Pinch Knot */}
          <ellipse
            cx="24"
            cy="21.5"
            rx="3"
            ry="2"
            fill="#fef08a"
            stroke="#b45309"
            strokeWidth="0.9"
          />

          {/* Crispy Golden Surface Flakes Highlight */}
          <path
            d="M16 26.5 C19 28.5, 23 29, 27 28.2"
            stroke="#fef9c3"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Traditional Roasted Spice Grain Accents (Ajwain/Jeera) */}
          <circle cx="21" cy="25" r="0.8" fill="#78350f" />
          <circle cx="27" cy="25.5" r="0.75" fill="#78350f" />
          <circle cx="24" cy="27" r="0.8" fill="#78350f" />

          {/* Fresh Coriander Leaf Garnishing Accent */}
          <path
            d="M28.5 20.5 C29.5 19 32 19.5 32.5 21.5 C31 22.5 29.5 21.5 28.5 20.5 Z"
            fill="#10b981"
            opacity="0.95"
          />

          {/* Fragrant Warm Steam / Aroma Waves Rising */}
          <path
            d="M19 16 C18 13.5 20 11.5 19 9"
            stroke="#fde68a"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M24 15 C23 12 25 10.5 24 7"
            stroke="#fef08a"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M29 16 C28 13.5 30 11.5 29 9"
            stroke="#fde68a"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.9"
          />

          <defs>
            <radialGradient id="pk_halo_grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="pk_crust_base" x1="10" y1="18" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="0.6" stopColor="#d97706" />
              <stop offset="1" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="pk_golden_puff" x1="14" y1="18" x2="34" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.45" stopColor="#fbbf24" />
              <stop offset="0.8" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#c2410c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'icon-only' && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display font-bold transition-colors ${
              isLight ? 'text-white' : 'text-charcoal-900 group-hover:text-spice-700'
            } ${titleSizes[size]}`}
          >
            {BRAND.name}
          </span>
          <span
            className={`uppercase mt-1 font-semibold ${
              isLight ? 'text-marigold-300' : 'text-spice-600'
            } ${taglineSizes[size]}`}
          >
            {BRAND.tagline}
          </span>
        </span>
      )}
    </div>
  );
}
