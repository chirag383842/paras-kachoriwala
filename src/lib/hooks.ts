import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type { Product, StoreStatus, Review, Feedback, GalleryImage } from './types';
import { DEFAULT_GALLERY_IMAGES } from './galleryData';
import { sendFeedbackToGoogleSheet } from './googleSheets';
import { calculateStoreStatus } from './constants';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// Fallback seed data in case Supabase is offline or loading
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'kachori',
    name: 'Regular Kachori',
    price: 40,
    description:
      'Crispy, golden-fried puffed pastry stuffed with our classic spiced lentil and onion filling — served fresh with tangy house chutneys.',
    image_url: '/images/kachori.webp',
    available: true,
    stock: 80,
    featured: true,
    display_order: 1,
  },
  {
    id: '2',
    slug: 'kachori-jain',
    name: 'Jain Kachori (No Onion / No Garlic)',
    price: 40,
    description:
      'Prepared strictly per Jain dietary traditions without onion or garlic — packed with rich authentic spices and served with fresh sweet and spicy chutneys.',
    image_url: '', // Image space left empty for owner to add photo
    available: true,
    stock: 50,
    featured: false,
    display_order: 2,
  },
  {
    id: '3',
    slug: 'kachori-swaminarayan',
    name: 'Swaminarayan Kachori (Satvik)',
    price: 40,
    description:
      'Pure satvik preparation crafted strictly without onion or garlic, following Swaminarayan dietary guidelines with fragrant spices and fresh chutneys.',
    image_url: '', // Image space left empty for owner to add photo
    available: true,
    stock: 50,
    featured: false,
    display_order: 3,
  },
  {
    id: '4',
    slug: 'bhel',
    name: 'Fresh Bhel',
    price: 50,
    description:
      'Light, crunchy puffed rice tossed with fresh tomatoes, onions, sev and our house chutneys — a burst of flavour in every bite.',
    image_url: '/images/bhel.webp',
    available: true,
    stock: 60,
    featured: false,
    display_order: 4,
  },
];

const DEFAULT_STORE_STATUS: StoreStatus = {
  id: '1',
  is_open: true,
  crowd_level: 'Moderate',
  last_updated: new Date().toISOString(),
  closed_for_date: null,
};

// Local storage keys for optimistic cache & event synchronization
const STORAGE_STATUS_KEY = 'pk_local_store_status_v2';
const STORAGE_PRODUCTS_KEY = 'pk_local_products_v2';
const STORAGE_GALLERY_KEY = 'pk_local_gallery_v2';

function getLocalStatus(): StoreStatus | null {
  try {
    const raw = localStorage.getItem(STORAGE_STATUS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getLocalProducts(): Product[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getLocalGallery(): GalleryImage[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_GALLERY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// 1. PRODUCTS HOOK
// ----------------------------------------------------
export function useProducts() {
  const [state, setState] = useState<AsyncState<Product[]>>(() => {
    const cached = getLocalProducts();
    return { data: cached ?? DEFAULT_PRODUCTS, loading: !cached, error: null };
  });

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        const cached = getLocalProducts();
        setState({ data: cached ?? DEFAULT_PRODUCTS, loading: false, error: null });
      } else {
        const cached = getLocalProducts();
        const merged = data.map((item: Product) => {
          const localOverride = cached?.find((c) => c.slug === item.slug || c.id === item.id);
          return localOverride ? { ...item, ...localOverride } : item;
        });
        setState({ data: merged as Product[], loading: false, error: null });
      }
    } catch {
      const cached = getLocalProducts();
      setState({ data: cached ?? DEFAULT_PRODUCTS, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleLocalUpdate = () => {
      const cached = getLocalProducts();
      if (cached) setState({ data: cached, loading: false, error: null });
    };

    window.addEventListener('pk_products_changed', handleLocalUpdate);

    // Supabase Realtime: sync product changes across all connected browsers/devices
    const channel = supabase
      .channel('realtime-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      window.removeEventListener('pk_products_changed', handleLocalUpdate);
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return state;
}

// ----------------------------------------------------
// 2. STORE STATUS HOOK (WITH IST & AUTO NEXT-DAY RESETS)
// ----------------------------------------------------
export function useStoreStatus() {
  const [state, setState] = useState<AsyncState<StoreStatus>>(() => {
    const cached = getLocalStatus();
    return { data: cached ?? DEFAULT_STORE_STATUS, loading: !cached, error: null };
  });

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('store_status')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        const cached = getLocalStatus();
        setState({ data: cached ?? DEFAULT_STORE_STATUS, loading: false, error: null });
      } else {
        const cached = getLocalStatus();
        const finalStatus = cached ? { ...data, ...cached } : data;
        setState({ data: finalStatus as StoreStatus, loading: false, error: null });
      }
    } catch {
      const cached = getLocalStatus();
      setState({ data: cached ?? DEFAULT_STORE_STATUS, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleLocalUpdate = () => {
      const cached = getLocalStatus();
      if (cached) setState({ data: cached, loading: false, error: null });
    };

    window.addEventListener('pk_store_status_changed', handleLocalUpdate);

    // Supabase Realtime: sync store status changes across all connected browsers/devices
    const channel = supabase
      .channel('realtime-store-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_status' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      window.removeEventListener('pk_store_status_changed', handleLocalUpdate);
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const computed = calculateStoreStatus(state.data);

  return {
    ...state,
    computed,
    refetch: fetchData,
  };
}

// ----------------------------------------------------
// 3. GALLERY HOOK (SYNCED TO REAL DATABASE)
// ----------------------------------------------------
export function useGallery() {
  const [state, setState] = useState<AsyncState<GalleryImage[]>>(() => {
    const cached = getLocalGallery();
    return { data: cached ?? DEFAULT_GALLERY_IMAGES, loading: !cached, error: null };
  });

  const fetchGallery = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        const cached = getLocalGallery();
        setState({ data: cached ?? DEFAULT_GALLERY_IMAGES, loading: false, error: null });
      } else {
        const formatted = (data as GalleryImage[]).map((img) => ({
          ...img,
          category: (img.category || 'food') as GalleryImage['category'],
        }));
        try {
          localStorage.setItem(STORAGE_GALLERY_KEY, JSON.stringify(formatted));
        } catch {
          // Ignore
        }
        setState({ data: formatted, loading: false, error: null });
      }
    } catch {
      const cached = getLocalGallery();
      setState({ data: cached ?? DEFAULT_GALLERY_IMAGES, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchGallery();

    const handleGalleryUpdate = () => {
      const cached = getLocalGallery();
      if (cached) setState({ data: cached, loading: false, error: null });
    };

    window.addEventListener('pk_gallery_changed', handleGalleryUpdate);

    // Supabase Realtime: sync gallery changes across all connected browsers/devices
    const channel = supabase
      .channel('realtime-gallery')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
        fetchGallery();
      })
      .subscribe();

    return () => {
      window.removeEventListener('pk_gallery_changed', handleGalleryUpdate);
      supabase.removeChannel(channel);
    };
  }, [fetchGallery]);

  return { ...state, refetch: fetchGallery };
}

// ----------------------------------------------------
// 4. REVIEWS HOOK (REAL DATABASE APPROVED FEEDBACK)
// ----------------------------------------------------
export function useReviews() {
  const [state, setState] = useState<AsyncState<Review[]>>({ data: null, loading: true, error: null });

  const fetchReviews = useCallback(async () => {
    try {
      // Fetch approved feedback as live customer reviews
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (!feedbackError && feedbackData && feedbackData.length > 0) {
        const reviews: Review[] = feedbackData.map((f, i) => ({
          id: f.id,
          rating: f.overall_rating,
          message: f.message || 'Great food and fast service!',
          customer_name: f.customer_name || 'Verified Customer',
          display_order: i + 1,
          created_at: f.created_at,
        }));
        setState({ data: reviews, loading: false, error: null });
        return;
      }

      // Fallback to reviews table if present
      const { data: rawReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('display_order', { ascending: true });

      if (!reviewsError && rawReviews && rawReviews.length > 0) {
        setState({ data: rawReviews as Review[], loading: false, error: null });
      } else {
        setState({ data: [], loading: false, error: null });
      }
    } catch {
      setState({ data: [], loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchReviews();

    const handleReviewsChange = () => fetchReviews();
    window.addEventListener('pk_reviews_changed', handleReviewsChange);

    // Supabase Realtime: sync review featured status across all connected browsers/devices
    // When Author features/unfeatures a review, all public visitors see the change immediately
    const channel = supabase
      .channel('realtime-reviews')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'feedback' }, () => {
        fetchReviews();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedback' }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => {
      window.removeEventListener('pk_reviews_changed', handleReviewsChange);
      supabase.removeChannel(channel);
    };
  }, [fetchReviews]);

  return state;
}

// ----------------------------------------------------
// 5. ALL CUSTOMER FEEDBACK HOOK (AUTHOR PANEL)
// ----------------------------------------------------
export function useFeedbackList() {
  const [state, setState] = useState<AsyncState<Feedback[]>>({ data: null, loading: true, error: null });

  const fetchFeedback = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setState({ data: [], loading: false, error: error.message });
      } else {
        setState({ data: (data as Feedback[]) ?? [], loading: false, error: null });
      }
    } catch {
      setState({ data: [], loading: false, error: 'Failed to load feedback' });
    }
  }, []);

  useEffect(() => {
    fetchFeedback();

    // Supabase Realtime: Admin panel automatically refreshes when new reviews are submitted
    // or when review status is changed (e.g., from another session)
    const channel = supabase
      .channel('realtime-feedback-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        fetchFeedback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFeedback]);

  return { ...state, refetch: fetchFeedback };
}

// ----------------------------------------------------
// 6. SUBMIT FEEDBACK ACTION
// ----------------------------------------------------
export type FeedbackPayload = {
  overall_rating: number;
  food_rating: number;
  service_rating: number;
  cleanliness_rating: number;
  message: string;
  customer_name: string;
};

export async function submitFeedback(payload: FeedbackPayload): Promise<{ success: boolean; error?: string }> {
  try {
    // All new reviews start as unfeatured (approved: false).
    // The Author must explicitly feature each review from the Admin panel.
    // This ensures no review appears publicly without Author approval.
    const { error } = await supabase.from('feedback').insert({
      overall_rating: payload.overall_rating,
      food_rating: payload.food_rating || null,
      service_rating: payload.service_rating || null,
      cleanliness_rating: payload.cleanliness_rating || null,
      message: payload.message || null,
      customer_name: payload.customer_name || null,
      approved: false,
    });

    sendFeedbackToGoogleSheet({
      customer_name: payload.customer_name,
      overall_rating: payload.overall_rating,
      food_rating: payload.food_rating,
      service_rating: payload.service_rating,
      cleanliness_rating: payload.cleanliness_rating,
      message: payload.message,
    });

    window.dispatchEvent(new Event('pk_reviews_changed'));

    if (error) return { success: false, error: 'Something went wrong. Please try again.' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit review' };
  }
}

// ----------------------------------------------------
// 7. AUTHOR ACTIONS: STORE STATUS & AUTOMATIC OPENING
// ----------------------------------------------------
export async function updateStoreStatus(status: {
  is_open: boolean;
  crowd_level: string;
  closed_for_date?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const newStatus: StoreStatus = {
    id: 'store_status_main',
    is_open: status.is_open,
    crowd_level: status.crowd_level,
    last_updated: new Date().toISOString(),
    closed_for_date: status.closed_for_date ?? null,
  };

  try {
    localStorage.setItem(STORAGE_STATUS_KEY, JSON.stringify(newStatus));
    window.dispatchEvent(new Event('pk_store_status_changed'));
  } catch {
    // Ignore
  }

  try {
    const { data: existing } = await supabase.from('store_status').select('id').limit(1).maybeSingle();
    if (existing && existing.id) {
      await supabase
        .from('store_status')
        .update({
          is_open: status.is_open,
          crowd_level: status.crowd_level,
          last_updated: newStatus.last_updated,
          closed_for_date: newStatus.closed_for_date,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('store_status').insert({
        is_open: status.is_open,
        crowd_level: status.crowd_level,
        last_updated: newStatus.last_updated,
        closed_for_date: newStatus.closed_for_date,
      });
    }
  } catch (err: any) {
    console.warn('Supabase remote status update error:', err);
  }

  return { success: true };
}

// ----------------------------------------------------
// 8. AUTHOR ACTIONS: PRODUCT UPDATES
// ----------------------------------------------------
export async function updateProduct(
  productId: string,
  updates: Partial<Product>
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentProducts = getLocalProducts() ?? DEFAULT_PRODUCTS;
    const updated = currentProducts.map((p) => {
      if (p.id === productId || p.slug === productId) {
        return { ...p, ...updates };
      }
      return p;
    });
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('pk_products_changed'));
  } catch {
    // Ignore
  }

  try {
    const { error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .or(`id.eq.${productId},slug.eq.${productId}`);

    if (error) {
      console.warn('Supabase product update error:', error.message);
    }
  } catch (err: any) {
    console.warn('Remote sync product error:', err);
  }

  return { success: true };
}

// ----------------------------------------------------
// 9. AUTHOR ACTIONS: GALLERY MANAGEMENT
// ----------------------------------------------------
export async function addGalleryImage(
  image: Omit<GalleryImage, 'id'>
): Promise<{ success: boolean; data?: GalleryImage; error?: string }> {
  const newId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const newImg: GalleryImage = {
    id: newId,
    src: image.src,
    alt: image.alt || 'Paras Kachoriwala Gallery Image',
    category: image.category || 'food',
    caption: image.caption || '',
    display_order: image.display_order ?? 99,
    created_at: new Date().toISOString(),
  };

  try {
    const current = getLocalGallery() ?? DEFAULT_GALLERY_IMAGES;
    const updated = [newImg, ...current];
    localStorage.setItem(STORAGE_GALLERY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('pk_gallery_changed'));
  } catch {
    // Ignore
  }

  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert({
        src: newImg.src,
        alt: newImg.alt,
        category: newImg.category,
        caption: newImg.caption,
        display_order: newImg.display_order,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase gallery insert warning:', error.message);
    }
    if (data) {
      newImg.id = data.id;
    }
  } catch (err: any) {
    console.warn('Supabase gallery sync error:', err);
  }

  return { success: true, data: newImg };
}

export async function updateGalleryImage(
  id: string,
  updates: Partial<GalleryImage>
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = getLocalGallery() ?? DEFAULT_GALLERY_IMAGES;
    const updated = current.map((img) => (img.id === id ? { ...img, ...updates } : img));
    localStorage.setItem(STORAGE_GALLERY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('pk_gallery_changed'));
  } catch {
    // Ignore
  }

  try {
    await supabase.from('gallery').update(updates).eq('id', id);
  } catch (err: any) {
    console.warn('Gallery update error:', err);
  }

  return { success: true };
}

export async function deleteGalleryImage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const current = getLocalGallery() ?? DEFAULT_GALLERY_IMAGES;
    const updated = current.filter((img) => img.id !== id);
    localStorage.setItem(STORAGE_GALLERY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('pk_gallery_changed'));
  } catch {
    // Ignore
  }

  try {
    await supabase.from('gallery').delete().eq('id', id);
  } catch (err: any) {
    console.warn('Gallery delete error:', err);
  }

  return { success: true };
}

// ----------------------------------------------------
// 10. AUTHOR ACTIONS: FEEDBACK / REVIEWS MANAGEMENT
// ----------------------------------------------------
export async function toggleApproveFeedback(
  id: string,
  approved: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('feedback').update({ approved }).eq('id', id);
    if (error) return { success: false, error: error.message };

    window.dispatchEvent(new Event('pk_reviews_changed'));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteFeedback(feedbackId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('feedback').delete().eq('id', feedbackId);
    window.dispatchEvent(new Event('pk_reviews_changed'));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
