import Hero from '@/components/home/Hero';
import LiveStoreStatus from '@/components/home/LiveStoreStatus';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TodayAvailability from '@/components/home/TodayAvailability';
import WhyParas from '@/components/home/WhyParas';
import Reviews from '@/components/home/Reviews';
import GalleryPreview from '@/components/home/GalleryPreview';
import LocationSection from '@/components/home/LocationSection';
import FeedbackCTA from '@/components/home/FeedbackCTA';
import type { Page } from '@/components/Navbar';

type Props = { onNavigate: (page: Page) => void };

export default function Home({ onNavigate }: Props) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <LiveStoreStatus />
      <FeaturedProducts onNavigate={onNavigate} />
      <TodayAvailability />
      <WhyParas />
      <Reviews onNavigate={onNavigate} />
      <GalleryPreview onNavigate={onNavigate} />
      <LocationSection />
      <FeedbackCTA onNavigate={onNavigate} />
    </>
  );
}
