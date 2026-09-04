import { Flame, Leaf, HeartHandshake, Award, Ruler, Banknote } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const FEATURES = [
  { icon: Flame, title: 'Freshly Made Daily', text: 'Every kachori is fried fresh in clean oil and every bhel is tossed to order — never pre-made.' },
  { icon: Leaf, title: '3 Kachori Varieties', text: 'Authentic recipes available in Regular, 100% Jain (No Onion/Garlic) and Swaminarayan (Satvik) options.' },
  { icon: Ruler, title: 'Famously Large Kachori', text: 'Our kachori is known for its generous, satisfying size — crispy, flaky, and packed with flavour.' },
  { icon: HeartHandshake, title: 'Loved by Locals', text: 'A familiar local food destination that our regular customers and foodies keep coming back for.' },
  { icon: Banknote, title: 'Token & Cash Counter', text: 'Fast & orderly service: token system operated at the counter with cash payment only.' },
  { icon: Award, title: 'Famous for Taste', text: 'Trusted family recipe with hand-ground spices and house chutneys for unmatched authentic taste.' },
];

export default function WhyParas() {
  return (
    <section className="bg-charcoal-950 text-white section-pad relative overflow-hidden">
      <div className="absolute inset-0 bg-warm-texture opacity-40" />
      <div className="relative container-max">
        <SectionHeading
          eyebrow="Why Paras Kachoriwala"
          title="A Taste People Trust"
          subtitle="What makes us a familiar, favourite stop for kachori and bhel lovers."
          className="[&_h2]:text-white [&_p]:text-spice-100/70 [&_.eyebrow]:text-marigold-400"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-spice-500 to-spice-700 text-white shadow-warm transition-transform group-hover:scale-110">
                <f.icon size={22} strokeWidth={2} />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-spice-100/70 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
