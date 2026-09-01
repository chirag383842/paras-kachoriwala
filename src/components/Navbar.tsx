import { useEffect, useState } from 'react';
import { Menu, X, Navigation, ShieldCheck } from 'lucide-react';
import { getAuthUser } from '@/lib/auth';
import Logo from '@/components/Logo';

export type Page = 'home' | 'menu' | 'gallery' | 'feedback' | 'directions' | 'admin';

type Props = {
  current: Page;
  onNavigate: (page: Page) => void;
};

const LINKS: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'menu', label: 'Menu' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'feedback', label: 'Feedback' },
];

export default function Navbar({ current, onNavigate }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAuthor, setIsAuthor] = useState(getAuthUser() !== null);

  useEffect(() => {
    const handleAuthChange = () => setIsAuthor(getAuthUser() !== null);
    window.addEventListener('pk_auth_state_changed', handleAuthChange);
    return () => window.removeEventListener('pk_auth_state_changed', handleAuthChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (p: Page) => {
    onNavigate(p);
    setOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-spice-50/90 backdrop-blur-xl shadow-[0_2px_20px_-8px_rgba(60,40,25,0.18)] border-b border-spice-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-max flex h-16 sm:h-20 items-center justify-between" aria-label="Primary">
        {/* Brand Logo with responsive sizing and home link */}
        <Logo size="md" onClick={() => go('home')} className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-spice-500 rounded-xl" />

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                current === l.id ? 'text-spice-700 font-bold' : 'text-charcoal-600 hover:text-spice-700'
              }`}
            >
              {l.label}
              {current === l.id && (
                <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-spice-500" />
              )}
            </button>
          ))}
          {isAuthor && (
            <button
              onClick={() => go('admin')}
              className="px-3.5 py-1.5 rounded-full bg-leaf-500/15 border border-leaf-500/30 text-leaf-700 text-xs font-bold flex items-center gap-1.5 hover:bg-leaf-500/25 transition-colors mr-1"
            >
              <ShieldCheck size={14} className="text-leaf-600" />
              Author Panel
            </button>
          )}
          <button
            onClick={() => go('directions')}
            className="btn-primary ml-2 py-2.5 flex items-center gap-1.5 shadow-warm hover:shadow-lg transition-all"
          >
            <Navigation size={16} />
            Get Directions
          </button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden grid h-11 w-11 place-items-center rounded-xl text-charcoal-800 hover:bg-spice-100 transition-colors"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile navigation drawer */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-max pb-5 pt-2 flex flex-col gap-1 bg-spice-50/95 backdrop-blur-xl border-b border-spice-200">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={`tap-target px-4 py-3 rounded-xl text-left text-base font-semibold transition-colors ${
                current === l.id ? 'bg-spice-100 text-spice-700 font-bold' : 'text-charcoal-700 hover:bg-spice-50'
              }`}
            >
              {l.label}
            </button>
          ))}
          {isAuthor && (
            <button
              onClick={() => go('admin')}
              className="tap-target px-4 py-3 rounded-xl text-left text-sm font-bold bg-leaf-50 text-leaf-800 border border-leaf-200 flex items-center gap-2"
            >
              <ShieldCheck size={16} className="text-leaf-600" />
              Author Control Panel
            </button>
          )}
          <button
            onClick={() => go('directions')}
            className="btn-primary mt-2 py-3 flex items-center justify-center gap-2"
          >
            <Navigation size={18} />
            Get Directions
          </button>
        </div>
      </div>
    </header>
  );
}
