import { useProducts } from '@/lib/hooks';
import FeaturedProduct from './FeaturedProduct';
import { SectionError } from '@/components/SectionLoader';
import type { Page } from '@/components/Navbar';

type Props = { onNavigate: (page: Page) => void };

export default function FeaturedProducts({ onNavigate }: Props) {
  const { data, loading, error, refetch } = useProducts();
  const products = data ?? [];
  const kachori = products.find((p) => p.slug === 'kachori') ?? null;
  const bhel = products.find((p) => p.slug === 'bhel') ?? null;

  return (
    <section className="container-max section-pad space-y-20 lg:space-y-28">
      {error && (
        <SectionError
          title="Unable to load featured items."
          message={error}
          onRetry={refetch}
          compact
        />
      )}
      <FeaturedProduct product={kachori!} loading={loading || !kachori} onNavigate={onNavigate} />
      <FeaturedProduct product={bhel!} loading={loading || !bhel} reverse onNavigate={onNavigate} />
    </section>
  );
}
