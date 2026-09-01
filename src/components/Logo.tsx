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
      {/* Brand Icon Badge */}
      <div
        className={`grid place-items-center rounded-2xl bg-gradient-to-br from-spice-500 via-spice-600 to-spice-700 text-white shadow-warm transition-transform duration-300 group-hover:scale-105 ${iconDimensions[size]}`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 sm:h-7 sm:w-7"
          aria-hidden="true"
        >
          {/* Subtle Glow Circle */}
          <circle cx="20" cy="20" r="18" fill="url(#pk_gold_grad)" opacity="0.18" />

          {/* Crispy Kachori Base Outline */}
          <ellipse
            cx="20"
            cy="24"
            rx="12"
            ry="9"
            fill="url(#pk_kachori_body)"
            stroke="#fcd34d"
            strokeWidth="1.5"
          />

          {/* Kachori Flaky Pleats / Crust Texture */}
          <path
            d="M11 23C13.5 26.5 17 28 20 28C23 28 26.5 26.5 29 23"
            stroke="#b45309"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M14 20.5C16 23 18.5 24 20 24C21.5 24 24 23 26 20.5"
            stroke="#fef3c7"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Steaming Aroma / Flavor Swirls */}
          <path
            d="M16 14C15 11.5 17 9.5 16 7"
            stroke="#fcd34d"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <path
            d="M20 13C19 10 21 8.5 20 5.5"
            stroke="#fef3c7"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M24 14C23 11.5 25 9.5 24 7"
            stroke="#fcd34d"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Center Spice Seed Accent */}
          <circle cx="20" cy="21.5" r="1.2" fill="#78350f" />

          <defs>
            <linearGradient id="pk_gold_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="1" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="pk_kachori_body" x1="8" y1="15" x2="32" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fde68a" />
              <stop offset="0.5" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#d97706" />
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
