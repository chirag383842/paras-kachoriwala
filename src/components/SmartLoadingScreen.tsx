import { useEffect, useState } from 'react';
import Logo from './Logo';

type Props = {
  visible: boolean;
};

export default function SmartLoadingScreen({ visible }: Props) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    let hideTimer: number | undefined;

    if (visible) {
      setShouldRender(true);
      setFadingOut(false);
    } else if (shouldRender) {
      setFadingOut(true);
      hideTimer = window.setTimeout(() => {
        setShouldRender(false);
        setFadingOut(false);
      }, 250);
    }

    return () => {
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [visible, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-charcoal-950 select-none transition-opacity duration-300 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center animate-fade-up">
        <Logo size="lg" variant="light" />

        <div className="space-y-2">
          <p className="font-display text-xl font-bold text-white tracking-wide">
            Paras Kachoriwala
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-marigold-400 font-semibold">
            Fresh • Famous • Full of Taste
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 rounded-full bg-amber-700 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
