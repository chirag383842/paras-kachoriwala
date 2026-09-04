import { MessageSquareHeart, ArrowRight } from 'lucide-react';
import type { Page } from '@/components/Navbar';

type Props = { onNavigate: (page: Page) => void };

export default function FeedbackCTA({ onNavigate }: Props) {
  return (
    <section className="container-max pb-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-spice-600 to-spice-800 text-white p-8 sm:p-12 lg:p-16 text-center shadow-warm">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-marigold-400/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-spice-400/20 blur-3xl" />
        <div className="relative">
          <span className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <MessageSquareHeart size={26} />
          </span>
          <h2 className="mt-6 font-display text-3xl sm:text-4xl font-bold text-balance">
            How Was Your Experience?
          </h2>
          <p className="mt-4 text-spice-50/85 max-w-xl mx-auto text-balance">
            We'd love to hear from you. Share your feedback and help us keep serving the best kachori and bhel in town.
          </p>
          <button onClick={() => onNavigate('feedback')} className="btn bg-white text-spice-700 hover:bg-marigold-100 mt-8 group shadow-lg">
            Share Your Feedback
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
