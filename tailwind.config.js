/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        spice: {
          50: '#fdf6ee',
          100: '#faead0',
          200: '#f4d39e',
          300: '#edb76b',
          400: '#e69a3f',
          500: '#d97f1f',
          600: '#bd6418',
          700: '#9c4c18',
          800: '#7d3d18',
          900: '#663318',
          950: '#381909',
        },
        marigold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        clay: {
          50: '#fbf6f2',
          100: '#f5e8df',
          200: '#ead0bf',
          300: '#dcb098',
          400: '#c98a6b',
          500: '#b86d4a',
          600: '#a0563a',
          700: '#834431',
          800: '#6b382b',
          900: '#582f25',
          950: '#311813',
        },
        leaf: {
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        },
        charcoal: {
          50: '#f6f5f4',
          100: '#e7e3df',
          200: '#cfc7bf',
          300: '#ada193',
          400: '#897c6b',
          500: '#6f6354',
          600: '#5a4f43',
          700: '#4a4038',
          800: '#3e3630',
          900: '#342d28',
          950: '#1c1815',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 10px 40px -12px rgba(157, 76, 24, 0.25)',
        card: '0 4px 24px -8px rgba(60, 40, 25, 0.18)',
        glow: '0 0 0 1px rgba(217, 127, 31, 0.2), 0 12px 40px -8px rgba(217, 127, 31, 0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.6s ease both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      backgroundImage: {
        'warm-texture': "radial-gradient(circle at 20% 20%, rgba(252, 211, 77, 0.08), transparent 45%), radial-gradient(circle at 80% 80%, rgba(217, 127, 31, 0.08), transparent 45%)",
      },
    },
  },
  plugins: [],
};
