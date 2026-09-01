import { Quote, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { useReviews } from '@/lib/hooks';
import StarRating from '@/components/StarRating';
import SectionHeading from '@/components/SectionHeading';
import type { Page } from '@/components/Navbar';

type Props = { onNavigate: (page: Page) => void };

export default function Reviews({ onNavigate }: Props) {
  const { data: reviews, loading, error } = useReviews();

  return (
    <section className="container-max section-pad">
      <SectionHeading
        eyebrow="Customer Reviews"
        title="What Our Customers Say"
        subtitle="Real experiences and honest feedback from our regular customers."
      />

      <div className="mt-12">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-7 space-y-4">
                <div className="skeleton h-6 w-32 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton h-5 w-24 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-charcoal-600">Reviews are temporarily unavailable.</p>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-10">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r, i) => (
                <article
                  key={r.id}
                  className="card p-7 flex flex-col justify-between animate-fade-up hover:shadow-warm transition-all duration-300"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Quote size={28} className="text-spice-300" />
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-leaf-700 bg-leaf-50 border border-leaf-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} className="text-leaf-600" />
                        Verified
                      </span>
                    </div>
                    <StarRating value={r.rating} size={18} className="mt-3" />
                    <p className="mt-4 text-charcoal-700 leading-relaxed italic">"{r.message}"</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-spice-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-spice-700">— {r.customer_name}</p>
                    {r.created_at && (
                      <span className="text-[11px] text-charcoal-400">
                        {new Date(r.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => onNavigate('feedback')}
                className="btn-outline group inline-flex items-center gap-2"
              >
                <MessageSquarePlus size={16} />
                Share Your Experience & Leave a Review
              </button>
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center max-w-md mx-auto animate-scale-in">
            <p className="text-charcoal-700 text-lg font-display font-bold">Be the First to Review!</p>
            <p className="text-charcoal-500 text-sm mt-1">
              Have you tried our fresh Kachori or Bhel? Share your feedback with us!
            </p>
            <button
              onClick={() => onNavigate('feedback')}
              className="btn-primary mt-6 inline-flex items-center gap-2"
            >
              <MessageSquarePlus size={16} />
              Leave a Review
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
