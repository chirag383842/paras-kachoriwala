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
    sm: 'h-10 w-10 min-w-[2.5rem]',
    md: 'h-11 w-11 sm:h-12 sm:w-12 min-w-[3rem]',
    lg: 'h-14 w-14 sm:h-16 sm:w-16 min-w-[4rem]',
  };

  const titleSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-lg sm:text-xl font-bold tracking-tight',
    lg: 'text-2xl sm:text-3xl font-bold tracking-tight',
  };

  const taglineSizes = {
    sm: 'text-[9px] font-bold tracking-[0.16em]',
    md: 'text-[10px] sm:text-[11px] font-bold tracking-[0.18em]',
    lg: 'text-xs font-bold tracking-[0.2em]',
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
      className={`inline-flex items-center gap-3 group select-none transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      aria-label={`${BRAND.name} — Home`}
    >
      {/* Interactive Logo Icon Emblem */}
      <div
        className={`relative grid place-items-center rounded-2xl shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg ${
          isLight
            ? 'bg-gradient-to-br from-charcoal-900 via-charcoal-950 to-stone-900 border border-amber-500/30 group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]'
            : variant === 'icon-only'
              ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-spice-200 group-hover:border-spice-400 group-hover:shadow-[0_0_18px_rgba(217,119,6,0.2)]'
              : 'bg-gradient-to-br from-amber-500/10 via-white to-spice-500/15 border border-spice-200 group-hover:border-spice-400 group-hover:shadow-[0_0_20px_rgba(217,119,6,0.2)]'
        } ${iconDimensions[size]}`}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[88%] w-[88%] transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <defs>
            {/* Background Rich Radial Gradient */}
            <radialGradient id="pk_badge_bg" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#c2410c" />
              <stop offset="70%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#7c2d12" />
            </radialGradient>

            {/* Golden Crust Kachori Gradient */}
            <radialGradient id="pk_kachori_body" cx="45%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="95%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>

            {/* Royal Gold Trim */}
            <linearGradient id="pk_gold_trim" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.5" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#b45309" />
            </linearGradient>

            {/* Aromatic Rising Steam */}
            <linearGradient id="pk_steam_glow" x1="60" y1="36" x2="60" y2="10" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fbbf24" stopOpacity="0.95" />
              <stop offset="0.6" stopColor="#fde68a" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Outer Gold Dotted Ring */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="url(#pk_gold_trim)" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.7" />

          {/* Inner Medallion */}
          <circle cx="60" cy="60" r="50" fill="url(#pk_badge_bg)" stroke="url(#pk_gold_trim)" strokeWidth="1.5" />

          {/* Rising Hot Steam Waves with hover response */}
          <g className="transition-transform duration-500 group-hover:-translate-y-1">
            <path
              d="M48 35 C45 28, 51 22, 47 16 C45 12, 49 8, 50 6"
              stroke="url(#pk_steam_glow)"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M60 33 C63 25, 57 19, 61 13 C63 9, 60 5, 61 3"
              stroke="url(#pk_steam_glow)"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M72 35 C75 28, 69 22, 73 16 C75 12, 71 8, 70 6"
              stroke="url(#pk_steam_glow)"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Puffed Crisp Kachori Body */}
          <ellipse cx="60" cy="61" rx="31" ry="24" fill="url(#pk_kachori_body)" stroke="#78350f" strokeWidth="1.6" />

          {/* Crispy Texture Shadow Arc */}
          <path
            d="M34 65 C40 76, 80 76, 86 65 C80 81, 40 81, 34 65 Z"
            fill="#78350f"
            opacity="0.4"
          />

          {/* Kachori Flaky Layers & Swirls */}
          <path
            d="M38 59 Q60 50 82 59"
            stroke="#92400e"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M42 66 Q60 74 78 66"
            stroke="#78350f"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M48 53 Q60 48 72 53"
            stroke="#fef08a"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* Crispy Center Pinch Crest */}
          <ellipse cx="60" cy="56" rx="6" ry="4" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
          <circle cx="60" cy="55" r="2.2" fill="#fef9c3" />

          {/* Crunchy Spice Grains */}
          <circle cx="47" cy="57" r="1.1" fill="#78350f" />
          <circle cx="53" cy="64" r="1.2" fill="#78350f" />
          <circle cx="67" cy="64" r="1.1" fill="#78350f" />
          <circle cx="73" cy="56" r="1.2" fill="#78350f" />
          <circle cx="59" cy="68" r="1" fill="#92400e" />

          {/* Bottom Gold Ribbon with "PARAS" */}
          <g>
            <path
              d="M26 82 L34 77 L86 77 L94 82 L88 94 L60 92 L32 94 Z"
              fill="#78350f"
              stroke="url(#pk_gold_trim)"
              strokeWidth="1.2"
            />
            <rect x="33" y="77" width="54" height="15" rx="3.5" fill="#9a3412" stroke="url(#pk_gold_trim)" strokeWidth="1.2" />
            <text
              x="60"
              y="88.5"
              textAnchor="middle"
              fontFamily="'Playfair Display', 'Georgia', serif"
              fontWeight="900"
              fontSize="10.5"
              letterSpacing="2.5"
              fill="#fef08a"
              stroke="#78350f"
              strokeWidth="0.2"
            >
              PARAS
            </text>
          </g>
        </svg>
      </div>

      {/* Brand Typography with subtle hover transitions */}
      {variant !== 'icon-only' && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display font-bold transition-colors duration-200 ${
              isLight
                ? 'text-white group-hover:text-amber-300'
                : 'text-charcoal-900 group-hover:text-spice-700'
            } ${titleSizes[size]}`}
          >
            {BRAND.name}
          </span>
          <span
            className={`uppercase mt-1 font-bold tracking-wider transition-colors duration-200 ${
              isLight ? 'text-amber-300/90 group-hover:text-amber-200' : 'text-spice-600 group-hover:text-spice-700'
            } ${taglineSizes[size]}`}
          >
            {BRAND.tagline}
          </span>
        </span>
      )}
    </div>
  );
}
