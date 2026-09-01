import { useEffect, useState } from 'react';
import Navbar, { type Page } from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Menu from '@/pages/Menu';
import Gallery from '@/pages/Gallery';
import Feedback from '@/pages/Feedback';
import Directions from '@/pages/Directions';
import Admin from '@/pages/Admin';
import { BRAND } from '@/lib/constants';

const PAGE_META: Record<Page, { title: string; description: string }> = {
  home: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: 'Famous local Indian street-food shop serving fresh Kachori and Bhel. Check live availability, store status, menu, gallery, and find us on the map.',
  },
  menu: {
    title: `Menu — ${BRAND.name}`,
    description: 'View our menu — crispy Kachori and fresh Bhel with live prices and availability. Made fresh daily at Paras Kachoriwala.',
  },
  gallery: {
    title: `Gallery — ${BRAND.name}`,
    description: 'Real photos of our food, shop, and happy customers at Paras Kachoriwala.',
  },
  feedback: {
    title: `Feedback — ${BRAND.name}`,
    description: 'Share your experience at Paras Kachoriwala. Rate our food, service, and cleanliness.',
  },
  directions: {
    title: `Get Directions & Location — ${BRAND.name}`,
    description: 'Get directions to Paras Kachoriwala on Google Maps. Operating daily from 7:00 PM to 11:30 PM with live status.',
  },
  admin: {
    title: `Author Management Portal — ${BRAND.name}`,
    description: 'Real-time store status, price management, and stock control for Paras Kachoriwala.',
  },
};

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  useEffect(() => {
    const meta = PAGE_META[page];
    document.title = meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', meta.description);
  }, [page]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar current={page} onNavigate={navigate} />
      <main className="flex-1">
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'menu' && <Menu />}
        {page === 'gallery' && <Gallery />}
        {page === 'feedback' && <Feedback />}
        {page === 'directions' && <Directions />}
        {page === 'admin' && <Admin onNavigate={navigate} />}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
