import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import type { Product, StoreStatus, Review, Feedback, GalleryImage } from './types';
import { DEFAULT_GALLERY_IMAGES } from './galleryData';
import { sendFeedbackToGoogleSheet } from './googleSheets';
import { calculateStoreStatus } from './constants';
import { withDedupe, invalidateCache } from './requestCache';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

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
    image_url: '',
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
    image_url: '',
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

const INITIAL_PINNED_REVIEWS: Review[] = [
  {
    id: 'jd-001',
    rating: 5,
    customer_name: 'Ramesh Prajapati',
    message:
      'Paras Kachoriwala has been my family go-to for years. The Regular Kachori is always crispy on the outside and perfectly stuffed inside — Jain Kachori is equally authentic without onion-garlic. Fresh chutneys make every bite special.',
    created_at: '2025-06-14T18:30:00.000Z',
    display_order: 1,
    source: 'justdial',
  },
  {
    id: 'jd-002',
    rating: 5,
    customer_name: 'Kinjal Shah',
    message:
      'I live nearby and visit almost every evening. The Swaminarayan Kachori is satvik, tasty and strictly prepared the way we prefer. Their Bhel is light, crunchy and never oily. Best part — reasonable prices and large, jumbo-sized portions.',
    created_at: '2025-07-02T19:05:00.000Z',
    display_order: 2,
    source: 'justdial',
  },
  {
    id: 'jd-003',
    rating: 4,
    customer_name: 'Haresh Patel',
    message:
      'Took my family of 6 last week. The counter token system is smooth — no confusion at all. Kachori was fresh and filling. Sometimes the evening rush can be busy but wait is worthwhile. Recommended for authentic street-style kachori.',
    created_at: '2025-05-21T20:12:00.000Z',
    display_order: 3,
    source: 'justdial',
  },
  {
    id: 'jd-004',
    rating: 5,
    customer_name: 'Daxa Ben Mehta',
    message:
      'We order almost every weekend for the entire joint family. Kids love the Bhel and elders enjoy the Jain Kachori. The taste has been consistent for as long as I remember. Paras ji ke kachori mein woh baat hai!',
    created_at: '2025-08-09T19:20:00.000Z',
    display_order: 4,
    source: 'justdial',
  },
  {
    id: 'jd-005',
    rating: 5,
    customer_name: 'Vivek Trivedi',
    message:
      'As someone who has tried kachori shops across the city, Paras Kachoriwala stands out for freshness. Every piece is puffed, the filling is generous, and the chutneys are balanced — not too sweet, not too tangy. Pure 5 stars from a regular customer.',
    created_at: '2025-04-30T19:45:00.000Z',
    display_order: 5,
    source: 'justdial',
  },
  {
    id: 'jd-006',
    rating: 4,
    customer_name: 'Bharat Desai',
    message:
      'Genuine local kachori place. Cash only, token system, very orderly service. Portions are big — one jumbo kachori with Bhel is enough for two adults. My friends from Mumbai were really impressed when I took them here last month.',
    created_at: '2025-07-27T20:30:00.000Z',
    display_order: 6,
    source: 'justdial',
  },
];

const DEFAULT_STORE_STATUS: StoreStatus = {
  id: 'store_status_main',
  is_open: true,
  crowd_level: 'Moderate',
  last_updated: new Date().toISOString(),
  closed_for_date: null,
  force_open_date: null,
};

const STORAGE_STATUS_KEY = 'pk_local_store_status_v3';
const STORAGE_PRODUCTS_KEY = 'pk_local_products_v3';
const STORAGE_GALLERY_KEY = 'pk_local_gallery_v3';
const STORAGE_FEEDBACK_KEY = 'pk_all_feedback_records_v3';
const STORAGE_DELETED_REVIEWS_KEY = 'pk_deleted_review_ids_v3';

const CACHE_TTL_SHORT = 10_000;
const CACHE_TTL_MEDIUM = 20_000;
const REQUEST_TIMEOUT_MS = 2_500;

// Cross-tab Real-Time Broadcast Channel
let syncBroadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncBroadcastChannel = new BroadcastChannel('paras_kachoriwala_sync');
  }
} catch {
  syncBroadcastChannel = null;
}

export function broadcastRealtimeEvent(type: string, data?: unknown) {
  try {
    syncBroadcastChannel?.postMessage({ type, data, timestamp: Date.now() });
  } catch {
    /* ignore */
  }
}

function toErrMsg(err: unknown, fallback = 'Request failed'): string {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string') return err || fallback;
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message || fallback;
  }
  return fallback;
}

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

function getLocalFeedbackList(): Feedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFeedbackList(list: Feedback[]): void {
  try {
    localStorage.setItem(STORAGE_FEEDBACK_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function getDeletedReviewIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_REVIEWS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markReviewDeleted(id: string): void {
  try {
    const deleted = getDeletedReviewIds();
    deleted.add(id);
    localStorage.setItem(STORAGE_DELETED_REVIEWS_KEY, JSON.stringify(Array.from(deleted)));
  } catch {
    /* ignore */
  }
}

async function withTimeout<T>(fn: () => T | PromiseLike<T>, ms = REQUEST_TIMEOUT_MS): Promise<Awaited<T>> {
  const timeout = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([Promise.resolve(fn()), timeout]);
}

// ----------------------------------------------------
// 1. PRODUCTS HOOK
// ----------------------------------------------------
export function useProducts() {
  const [state, setState] = useState<AsyncState<Product[]>>(() => {
    const cached = getLocalProducts();
    return { data: cached ?? DEFAULT_PRODUCTS, loading: false, error: null };
  });

  const fetchData = useCallback(async () => {
    try {
      const result = await withDedupe<Product[]>(
        'sb:products',
        async () => {
          const { data, error } = await withTimeout(() =>
            supabase
              .from('products')
              .select('*')
              .order('display_order', { ascending: true })
          );
          if (error || !data || data.length === 0) {
            const cached = getLocalProducts();
            return cached ?? DEFAULT_PRODUCTS;
          }
          try {
            localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(data));
          } catch {
            /* ignore */
          }
          return data as Product[];
        },
        CACHE_TTL_MEDIUM
      );
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const cached = getLocalProducts();
      setState({
        data: cached ?? DEFAULT_PRODUCTS,
        loading: false,
        error: toErrMsg(err, 'Unable to load menu data.'),
      });
    }
  }, []);

  const refetch = useCallback(() => {
    invalidateCache('sb:products');
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    const handleLocalUpdate = () => {
      const cached = getLocalProducts();
      if (cached) setState({ data: cached, loading: false, error: null });
    };

    window.addEventListener('pk_products_changed', handleLocalUpdate);

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === 'PRODUCTS_CHANGED') {
        invalidateCache('sb:products');
        fetchData();
      }
    };
    syncBroadcastChannel?.addEventListener('message', handleBroadcast);

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('realtime-products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          invalidateCache('sb:products');
          fetchData();
        })
        .subscribe();
    } catch {
      channel = null;
    }

    // Periodic background sync for non-websocket clients
    const pollInterval = window.setInterval(() => {
      fetchData();
    }, 30_000);

    return () => {
      window.clearInterval(pollInterval);
      window.removeEventListener('pk_products_changed', handleLocalUpdate);
      syncBroadcastChannel?.removeEventListener('message', handleBroadcast);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          /* ignore */
        }
      }
    };
  }, [fetchData]);

  return { ...state, refetch };
}

// ----------------------------------------------------
// 2. STORE STATUS HOOK
// ----------------------------------------------------
export function useStoreStatus() {
  const [state, setState] = useState<AsyncState<StoreStatus>>(() => {
    const cached = getLocalStatus();
    return { data: cached ?? DEFAULT_STORE_STATUS, loading: false, error: null };
  });
  const [, setTimeTick] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const result = await withDedupe<StoreStatus>(
        'sb:store_status',
        async () => {
          try {
            const { data, error } = await withTimeout(() =>
              supabase
                .from('store_status')
                .select('*')
                .limit(1)
                .maybeSingle()
            );
            if (error || !data) {
              const cached = getLocalStatus();
              return cached ?? DEFAULT_STORE_STATUS;
            }
            try {
              localStorage.setItem(STORAGE_STATUS_KEY, JSON.stringify(data));
            } catch {
              /* ignore */
            }
            return data as StoreStatus;
          } catch {
            const cached = getLocalStatus();
            return cached ?? DEFAULT_STORE_STATUS;
          }
        },
        CACHE_TTL_SHORT
      );
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const cached = getLocalStatus();
      setState({
        data: cached ?? DEFAULT_STORE_STATUS,
        loading: false,
        error: toErrMsg(err, 'Unable to load store status.'),
      });
    }
  }, []);

  const refetch = useCallback(() => {
    invalidateCache('sb:store_status');
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    const handleLocalUpdate = () => {
      const cached = getLocalStatus();
      if (cached) setState({ data: cached, loading: false, error: null });
    };

    window.addEventListener('pk_store_status_changed', handleLocalUpdate);

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === 'STORE_STATUS_CHANGED') {
        const newStatus = e.data.data as StoreStatus;
        if (newStatus) {
          setState({ data: newStatus, loading: false, error: null });
        } else {
          invalidateCache('sb:store_status');
          fetchData();
        }
      }
    };
    syncBroadcastChannel?.addEventListener('message', handleBroadcast);

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('realtime-store-status')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'store_status' }, () => {
          invalidateCache('sb:store_status');
          fetchData();
        })
        .subscribe();
    } catch {
      channel = null;
    }

    // 15-second timer for Indian Standard Time (IST) auto-trigger & periodic sync
    const timerInterval = window.setInterval(() => {
      setTimeTick((t) => t + 1);
      fetchData();
    }, 15_000);

    return () => {
      window.clearInterval(timerInterval);
      window.removeEventListener('pk_store_status_changed', handleLocalUpdate);
      syncBroadcastChannel?.removeEventListener('message', handleBroadcast);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          /* ignore */
        }
      }
    };
  }, [fetchData]);

  const computed = calculateStoreStatus(state.data);

  return {
    ...state,
    computed,
    refetch,
  };
}

// ----------------------------------------------------
// 3. GALLERY HOOK
// ----------------------------------------------------
export function useGallery() {
  const [state, setState] = useState<AsyncState<GalleryImage[]>>(() => {
    const cached = getLocalGallery();
    return { data: cached ?? DEFAULT_GALLERY_IMAGES, loading: false, error: null };
  });

  const fetchGallery = useCallback(async () => {
    try {
      const result = await withDedupe<GalleryImage[]>(
        'sb:gallery',
        async () => {
          try {
            const { data, error } = await withTimeout(() =>
              supabase
                .from('gallery')
                .select('*')
                .order('display_order', { ascending: true })
            );
            if (error || !data || data.length === 0) {
              const cached = getLocalGallery();
              return cached ?? DEFAULT_GALLERY_IMAGES;
            }
            const formatted = (data as GalleryImage[]).map((img) => ({
              ...img,
              category: (img.category || 'food') as GalleryImage['category'],
            }));
            try {
              localStorage.setItem(STORAGE_GALLERY_KEY, JSON.stringify(formatted));
            } catch {
              /* ignore */
            }
            return formatted;
          } catch {
            const cached = getLocalGallery();
            return cached ?? DEFAULT_GALLERY_IMAGES;
          }
        },
        CACHE_TTL_MEDIUM
      );
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const cached = getLocalGallery();
      setState({
        data: cached ?? DEFAULT_GALLERY_IMAGES,
        loading: false,
        error: toErrMsg(err, 'Unable to load gallery.'),
      });
    }
  }, []);

  const refetch = useCallback(() => {
    invalidateCache('sb:gallery');
    return fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    fetchGallery();

    const handleGalleryUpdate = () => {
      const cached = getLocalGallery();
      if (cached) setState({ data: cached, loading: false, error: null });
    };

    window.addEventListener('pk_gallery_changed', handleGalleryUpdate);

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === 'GALLERY_CHANGED') {
        invalidateCache('sb:gallery');
        fetchGallery();
      }
    };
    syncBroadcastChannel?.addEventListener('message', handleBroadcast);

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('realtime-gallery')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
          invalidateCache('sb:gallery');
          fetchGallery();
        })
        .subscribe();
    } catch {
      channel = null;
    }

    const pollInterval = window.setInterval(() => {
      fetchGallery();
    }, 30_000);

    return () => {
      window.clearInterval(pollInterval);
      window.removeEventListener('pk_gallery_changed', handleGalleryUpdate);
      syncBroadcastChannel?.removeEventListener('message', handleBroadcast);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          /* ignore */
        }
      }
    };
  }, [fetchGallery]);

  return { ...state, refetch };
}

// ----------------------------------------------------
// 4. REVIEWS HOOK (CUSTOMER FACING)
// ----------------------------------------------------
export function useReviews() {
  const [state, setState] = useState<AsyncState<Review[]>>({
    data: INITIAL_PINNED_REVIEWS,
    loading: false,
    error: null,
  });

  const fetchReviews = useCallback(async () => {
    try {
      const deletedIds = getDeletedReviewIds();

      // 1. Fetch approved from Supabase
      const { data: supabaseFeedback } = await withTimeout(() =>
        supabase
          .from('feedback')
          .select('*')
          .eq('approved', true)
          .order('created_at', { ascending: false })
      ).catch(() => ({ data: null }));

      // 2. Read local approved feedback
      const localFeedback = getLocalFeedbackList().filter((f) => f.approved);

      const approvedReviews: Review[] = [];

      if (supabaseFeedback && supabaseFeedback.length > 0) {
        supabaseFeedback.forEach((f, i) => {
          if (!deletedIds.has(f.id)) {
            approvedReviews.push({
              id: f.id,
              rating: f.overall_rating,
              message: f.message || 'Delicious fresh Kachori and great taste!',
              customer_name: f.customer_name || 'Verified Customer',
              display_order: i + 1,
              created_at: f.created_at,
              source: 'verified',
            });
          }
        });
      }

      localFeedback.forEach((f, i) => {
        if (!deletedIds.has(f.id) && !approvedReviews.some((r) => r.id === f.id)) {
          approvedReviews.push({
            id: f.id,
            rating: f.overall_rating,
            message: f.message || 'Delicious fresh Kachori and great taste!',
            customer_name: f.customer_name || 'Verified Customer',
            display_order: i + 1,
            created_at: f.created_at,
            source: 'verified',
          });
        }
      });

      const seenIds = new Set<string>();
      const merged: Review[] = [];

      // Requirement #4: First Justdial reviews are shown
      INITIAL_PINNED_REVIEWS.forEach((r) => {
        if (!deletedIds.has(r.id) && !seenIds.has(r.id)) {
          seenIds.add(r.id);
          merged.push({ ...r, source: 'justdial' });
        }
      });

      // Requirement #4: After that, verified reviews are shown
      approvedReviews.forEach((r) => {
        if (!deletedIds.has(r.id) && !seenIds.has(r.id)) {
          seenIds.add(r.id);
          merged.push({ ...r, source: 'verified' });
        }
      });

      setState({ data: merged, loading: false, error: null });
    } catch (err) {
      const deletedIds = getDeletedReviewIds();
      const filteredPinned = INITIAL_PINNED_REVIEWS.filter((r) => !deletedIds.has(r.id));
      setState({
        data: filteredPinned,
        loading: false,
        error: toErrMsg(err, 'Unable to load reviews.'),
      });
    }
  }, []);

  const refetch = useCallback(() => {
    invalidateCache('sb:reviews');
    return fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    fetchReviews();

    const handleReviewsChange = () => {
      invalidateCache('sb:reviews');
      fetchReviews();
    };
    window.addEventListener('pk_reviews_changed', handleReviewsChange);

    const handleBroadcast = (e: MessageEvent) => {
      if (
        e.data?.type === 'NEW_FEEDBACK_SUBMITTED' ||
        e.data?.type === 'REVIEW_APPROVED_TOGGLED' ||
        e.data?.type === 'REVIEW_DELETED'
      ) {
        invalidateCache('sb:reviews');
        fetchReviews();
      }
    };
    syncBroadcastChannel?.addEventListener('message', handleBroadcast);

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('realtime-reviews-customer')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
          invalidateCache('sb:reviews');
          fetchReviews();
        })
        .subscribe();
    } catch {
      channel = null;
    }

    // 30-second periodic sync for real-time reviews across all users
    const pollInterval = window.setInterval(() => {
      fetchReviews();
    }, 30_000);

    return () => {
      window.clearInterval(pollInterval);
      window.removeEventListener('pk_reviews_changed', handleReviewsChange);
      syncBroadcastChannel?.removeEventListener('message', handleBroadcast);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          /* ignore */
        }
      }
    };
  }, [fetchReviews]);

  return { ...state, refetch };
}

// ----------------------------------------------------
// 5. ALL CUSTOMER FEEDBACK HOOK (AUTHOR PANEL)
// ----------------------------------------------------
export function useFeedbackList() {
  const [state, setState] = useState<AsyncState<Feedback[]>>(() => {
    const local = getLocalFeedbackList();
    const deleted = getDeletedReviewIds();
    const filtered = local.filter((f) => !deleted.has(f.id));
    return { data: filtered.length > 0 ? filtered : null, loading: filtered.length === 0, error: null };
  });

  const fetchFeedback = useCallback(async () => {
    try {
      const deletedIds = getDeletedReviewIds();

      // Fetch from Supabase
      const { data: remoteData, error: remoteError } = await withTimeout(() =>
        supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false })
      ).catch(() => ({ data: null, error: null }));

      const localData = getLocalFeedbackList();

      const combinedMap = new Map<string, Feedback>();

      if (remoteData && remoteData.length > 0) {
        remoteData.forEach((item: Feedback) => {
          if (!deletedIds.has(item.id)) {
            combinedMap.set(item.id, item);
          }
        });
      }

      localData.forEach((item) => {
        if (!deletedIds.has(item.id)) {
          if (!combinedMap.has(item.id)) {
            combinedMap.set(item.id, item);
          } else {
            // Keep latest approved status
            const existing = combinedMap.get(item.id)!;
            combinedMap.set(item.id, { ...existing, ...item });
          }
        }
      });

      const list = Array.from(combinedMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      saveLocalFeedbackList(list);
      setState({ data: list, loading: false, error: null });
    } catch (err) {
      const localData = getLocalFeedbackList();
      const deletedIds = getDeletedReviewIds();
      const filtered = localData.filter((f) => !deletedIds.has(f.id));
      setState({
        data: filtered,
        loading: false,
        error: toErrMsg(err, 'Failed to load feedback'),
      });
    }
  }, []);

  const refetch = useCallback(() => fetchFeedback(), [fetchFeedback]);

  useEffect(() => {
    fetchFeedback();

    const handleReviewsChange = () => {
      fetchFeedback();
    };
    window.addEventListener('pk_reviews_changed', handleReviewsChange);

    const handleBroadcast = (e: MessageEvent) => {
      if (
        e.data?.type === 'NEW_FEEDBACK_SUBMITTED' ||
        e.data?.type === 'REVIEW_APPROVED_TOGGLED' ||
        e.data?.type === 'REVIEW_DELETED'
      ) {
        fetchFeedback();
      }
    };
    syncBroadcastChannel?.addEventListener('message', handleBroadcast);

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('realtime-feedback-admin-panel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
          fetchFeedback();
        })
        .subscribe();
    } catch {
      channel = null;
    }

    // 30-second periodic sync for admin panel
    const pollInterval = window.setInterval(() => {
      fetchFeedback();
    }, 30_000);

    return () => {
      window.clearInterval(pollInterval);
      window.removeEventListener('pk_reviews_changed', handleReviewsChange);
      syncBroadcastChannel?.removeEventListener('message', handleBroadcast);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          /* ignore */
        }
      }
    };
  }, [fetchFeedback]);

  return { ...state, refetch };
}

// ----------------------------------------------------
// 6. PAGE INITIAL LOAD COORDINATOR
// ----------------------------------------------------
export function useInitialPageLoad(deps: Array<{ loading: boolean; error: string | null }>) {
  const readyRef = useRef(false);
  const allDone = deps.every((d) => !d.loading);
  const hasError = deps.some((d) => d.error);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(() => {
    return deps.length === 0 || allDone;
  });

  useEffect(() => {
    if (readyRef.current) return;
    if (allDone || hasError) {
      readyRef.current = true;
      setInitialLoadComplete(true);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      readyRef.current = true;
      setInitialLoadComplete(true);
    }, 400);
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [allDone, hasError, deps.length]);

  return initialLoadComplete;
}

// ----------------------------------------------------
// 7. SUBMIT FEEDBACK ACTION
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
  const overallRating = Number(payload.overall_rating);
  const message = payload.message.trim();

  if (!Number.isInteger(overallRating) || overallRating < 1 || overallRating > 5) {
    return { success: false, error: 'Please choose an overall rating from 1 to 5 stars.' };
  }
  if (message.length < 5) {
    return { success: false, error: 'Please share at least a few words of feedback.' };
  }

  const customerName = payload.customer_name.trim() || 'Anonymous Customer';
  const newId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  const newRecord: Feedback = {
    id: newId,
    overall_rating: overallRating,
    food_rating: payload.food_rating || null,
    service_rating: payload.service_rating || null,
    cleanliness_rating: payload.cleanliness_rating || null,
    message,
    customer_name: customerName,
    approved: false,
    created_at: nowIso,
  };

  // 1. Immediately store in local feedback records for instantaneous display
  try {
    const current = getLocalFeedbackList();
    const updated = [newRecord, ...current.filter((f) => f.id !== newId)];
    saveLocalFeedbackList(updated);
  } catch {
    /* ignore */
  }

  // 2. Insert into Supabase
  try {
    const { data: inserted, error: sbError } = await withTimeout(() =>
      supabase.from('feedback').insert({
        overall_rating: overallRating,
        food_rating: payload.food_rating || null,
        service_rating: payload.service_rating || null,
        cleanliness_rating: payload.cleanliness_rating || null,
        message,
        customer_name: customerName,
        approved: false,
      }).select().maybeSingle()
    );

    if (sbError) {
      console.warn('Supabase feedback insert notice:', sbError.message);
    } else if (inserted && inserted.id) {
      // Update local storage ID to match Supabase database ID for future admin edits
      newRecord.id = inserted.id;
      try {
        const current = getLocalFeedbackList();
        const updated = current.map((f) => (f.id === newId ? { ...f, id: inserted.id } : f));
        saveLocalFeedbackList(updated);
      } catch {
        /* ignore */
      }
    }
  } catch (err) {
    console.warn('Supabase feedback insert notice:', err);
  }

  // 3. Send to Google Sheets webhook in real-time
  void sendFeedbackToGoogleSheet({
    record_id: newRecord.id,
    customer_name: customerName,
    overall_rating: overallRating,
    food_rating: payload.food_rating,
    service_rating: payload.service_rating,
    cleanliness_rating: payload.cleanliness_rating,
    message,
  });

  // 4. Broadcast real-time events across all tabs/windows
  invalidateCache('sb:reviews');
  broadcastRealtimeEvent('NEW_FEEDBACK_SUBMITTED', newRecord);
  window.dispatchEvent(new Event('pk_reviews_changed'));

  return { success: true };
}

// ----------------------------------------------------
// 8. AUTHOR ACTIONS: STORE STATUS
// ----------------------------------------------------
export async function updateStoreStatus(status: {
  is_open: boolean;
  crowd_level: string;
  closed_for_date?: string | null;
  force_open_date?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const newStatus: StoreStatus = {
    id: 'store_status_main',
    is_open: status.is_open,
    crowd_level: status.crowd_level,
    last_updated: new Date().toISOString(),
    closed_for_date: status.closed_for_date ?? null,
    force_open_date: status.force_open_date ?? null,
  };

  // 1. Save to localStorage immediately
  try {
    localStorage.setItem(STORAGE_STATUS_KEY, JSON.stringify(newStatus));
  } catch {
    /* ignore */
  }

  // 2. Broadcast across tabs and window
  invalidateCache('sb:store_status');
  broadcastRealtimeEvent('STORE_STATUS_CHANGED', newStatus);
  window.dispatchEvent(new Event('pk_store_status_changed'));

  // 3. Update Supabase
  try {
    const { data: existing } = await withTimeout(() =>
      supabase.from('store_status').select('id').limit(1).maybeSingle()
    );
    if (existing && existing.id) {
      const { error } = await withTimeout(() =>
        supabase
          .from('store_status')
          .update({
            is_open: status.is_open,
            crowd_level: status.crowd_level,
            last_updated: newStatus.last_updated,
            closed_for_date: newStatus.closed_for_date,
            force_open_date: newStatus.force_open_date,
          })
          .eq('id', existing.id)
      );
      if (error) throw error;
    } else {
      const { error } = await withTimeout(() =>
        supabase.from('store_status').insert({
          is_open: status.is_open,
          crowd_level: status.crowd_level,
          last_updated: newStatus.last_updated,
          closed_for_date: newStatus.closed_for_date,
          force_open_date: newStatus.force_open_date,
        })
      );
      if (error) throw error;
    }
  } catch (err) {
    console.warn('Supabase remote status update notice:', err);
    return { success: false, error: toErrMsg(err, 'Unable to publish store status.') };
  }

  return { success: true };
}

// ----------------------------------------------------
// 9. AUTHOR ACTIONS: PRODUCT UPDATES
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
  } catch {
    /* ignore */
  }

  invalidateCache('sb:products');
  broadcastRealtimeEvent('PRODUCTS_CHANGED', { productId, updates });
  window.dispatchEvent(new Event('pk_products_changed'));

  try {
    const { error } = await withTimeout(() =>
      supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${productId},slug.eq.${productId}`)
    );

    if (error) {
      console.warn('Supabase product update notice:', error.message);
    }
  } catch (err) {
    console.warn('Remote sync product notice:', err);
  }

  return { success: true };
}

// ----------------------------------------------------
// 10. AUTHOR ACTIONS: GALLERY MANAGEMENT
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
  } catch {
    /* ignore */
  }

  invalidateCache('sb:gallery');
  broadcastRealtimeEvent('GALLERY_CHANGED');
  window.dispatchEvent(new Event('pk_gallery_changed'));

  try {
    const { data, error } = await withTimeout(() =>
      supabase
        .from('gallery')
        .insert({
          src: newImg.src,
          alt: newImg.alt,
          category: newImg.category,
          caption: newImg.caption,
          display_order: newImg.display_order,
        })
        .select()
        .maybeSingle()
    );

    if (error) {
      console.warn('Supabase gallery insert notice:', error.message);
    }
    if (data) {
      newImg.id = data.id;
    }
  } catch (err) {
    console.warn('Supabase gallery sync notice:', err);
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
  } catch {
    /* ignore */
  }

  invalidateCache('sb:gallery');
  broadcastRealtimeEvent('GALLERY_CHANGED');
  window.dispatchEvent(new Event('pk_gallery_changed'));

  try {
    await withTimeout(() => supabase.from('gallery').update(updates).eq('id', id));
  } catch (err) {
    console.warn('Gallery update notice:', err);
  }

  return { success: true };
}

export async function deleteGalleryImage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const current = getLocalGallery() ?? DEFAULT_GALLERY_IMAGES;
    const updated = current.filter((img) => img.id !== id);
    localStorage.setItem(STORAGE_GALLERY_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }

  invalidateCache('sb:gallery');
  broadcastRealtimeEvent('GALLERY_CHANGED');
  window.dispatchEvent(new Event('pk_gallery_changed'));

  try {
    await withTimeout(() => supabase.from('gallery').delete().eq('id', id));
  } catch (err) {
    console.warn('Gallery delete notice:', err);
  }

  return { success: true };
}

// ----------------------------------------------------
// 11. AUTHOR ACTIONS: FEEDBACK / REVIEWS MANAGEMENT
// ----------------------------------------------------
export async function toggleApproveFeedback(
  id: string,
  approved: boolean
): Promise<{ success: boolean; error?: string }> {
  // 1. Update in local storage list
  try {
    const list = getLocalFeedbackList();
    const updated = list.map((f) => (f.id === id ? { ...f, approved } : f));
    saveLocalFeedbackList(updated);
  } catch {
    /* ignore */
  }

  // 2. Broadcast immediately
  invalidateCache('sb:reviews');
  broadcastRealtimeEvent('REVIEW_APPROVED_TOGGLED', { id, approved });
  window.dispatchEvent(new Event('pk_reviews_changed'));

  // 3. Update Supabase
  try {
    const { error } = await withTimeout(() =>
      supabase.from('feedback').update({ approved }).eq('id', id)
    );
    if (error) {
      console.warn('Supabase toggle feedback notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase toggle feedback notice:', err);
  }

  return { success: true };
}

export async function deleteFeedback(feedbackId: string): Promise<{ success: boolean; error?: string }> {
  // 1. Permanently mark deleted locally
  markReviewDeleted(feedbackId);

  // 2. Remove from local feedback records
  try {
    const list = getLocalFeedbackList();
    const updated = list.filter((f) => f.id !== feedbackId);
    saveLocalFeedbackList(updated);
  } catch {
    /* ignore */
  }

  // 3. Broadcast deletion immediately across tabs & window
  invalidateCache('sb:reviews');
  broadcastRealtimeEvent('REVIEW_DELETED', { id: feedbackId });
  window.dispatchEvent(new Event('pk_reviews_changed'));

  // 4. Delete from Supabase
  try {
    const { error } = await withTimeout(() =>
      supabase.from('feedback').delete().eq('id', feedbackId)
    );
    if (error) {
      console.warn('Supabase delete feedback notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase delete feedback notice:', err);
  }

  return { success: true };
}
