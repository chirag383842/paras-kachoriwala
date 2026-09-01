import { useProducts } from '@/lib/hooks';
import FeaturedProduct from './FeaturedProduct';
import type { Page } from '@/components/Navbar';

type Props = { onNavigate: (page: Page) => void };

export default function FeaturedProducts({ onNavigate }: Props) {
  const { data, loading } = useProducts();
  const products = data ?? [];
  const kachori = products.find((p) => p.slug === 'kachori') ?? null;
  const bhel = products.find((p) => p.slug === 'bhel') ?? null;

  return (
    <section className="container-max section-pad space-y-20 lg:space-y-28">
      <FeaturedProduct product={kachori!} loading={loading || !kachori} onNavigate={onNavigate} />
      <FeaturedProduct product={bhel!} loading={loading || !bhel} reverse onNavigate={onNavigate} />
    </section>
  );
}
