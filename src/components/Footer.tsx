import { MapPin, Clock, Navigation } from 'lucide-react';
import { BRAND, STORE_HOURS, formatTimeStr } from '@/lib/constants';
import { useStoreStatus } from '@/lib/hooks';
import Logo from '@/components/Logo';
import type { Page } from './Navbar';

type Props = {
  onNavigate: (page: Page) => void;
};

const LINKS: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'menu', label: 'Menu' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'directions', label: 'Get Directions' },
];

export default function Footer({ onNavigate }: Props) {
  const { computed } = useStoreStatus();
  const isOpen = computed.isOpen;

  return (
    <footer className="bg-charcoal-950 text-spice-50">
      <div className="container-max py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo
              size="md"
              variant="light"
              onClick={() => onNavigate('home')}
              className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 rounded-xl"
            />
            <p className="mt-5 text-sm leading-relaxed text-spice-100/70 max-w-xs">
              {BRAND.description}
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-marigold-400">
              {BRAND.tagline}
            </p>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-marigold-400 mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {LINKS.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => onNavigate(l.id)}
                    className="text-sm text-spice-100/80 hover:text-spice-50 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-marigold-400 mb-4">Visit Us</h3>
            <p className="flex items-start gap-2 text-sm text-spice-100/80">
              <MapPin size={16} className="mt-0.5 shrink-0 text-spice-400" />
              <span>{BRAND.address}</span>
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('directions')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-spice-50 hover:text-marigold-300 transition-colors text-left"
              >
                <Navigation size={15} /> Directions & Location Page
              </button>
              <a
                href={BRAND.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-spice-100/70 hover:text-marigold-300 transition-colors"
              >
                Open Google Maps Pin ↗
              </a>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold">
              <span className={`h-2 w-2 rounded-full ${isOpen ? 'bg-leaf-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={isOpen ? 'text-leaf-400' : 'text-red-400'}>
                {isOpen ? 'Open Now' : computed.statusLabel || 'Closed Now'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-marigold-400 mb-4 flex items-center gap-2">
              <Clock size={14} /> Store Hours
            </h3>
            <ul className="space-y-1.5 text-xs text-spice-100/70">
              {STORE_HOURS.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.day}</span>
                  <span className="tabular-nums">
                    {h.display ?? `${formatTimeStr(h.open)} – ${formatTimeStr(h.close)}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-spice-100/50">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('admin')}
              className="text-xs text-spice-100/40 hover:text-marigold-300 transition-colors flex items-center gap-1.5"
            >
              Author & Owner Portal
            </button>
            <span className="text-spice-100/20">•</span>
            <p className="text-xs text-spice-100/50">Made with care for our customers.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
