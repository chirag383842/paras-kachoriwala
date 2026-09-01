export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  available: boolean;
  stock: number | null;
  featured: boolean;
  display_order: number;
};

export type StoreStatus = {
  id: string;
  is_open: boolean;
  crowd_level: string;
  last_updated: string;
  updated_by?: string;
  closed_for_date?: string | null;
};

export type Feedback = {
  id: string;
  overall_rating: number;
  food_rating: number | null;
  service_rating: number | null;
  cleanliness_rating: number | null;
  message: string | null;
  customer_name: string | null;
  approved: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  rating: number;
  message: string;
  customer_name: string;
  display_order?: number;
  created_at?: string;
};

export type GalleryCategory = 'all' | 'food' | 'shop' | 'customers' | 'about' | 'home';

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  category: 'food' | 'shop' | 'customers' | 'about' | 'home';
  caption?: string;
  display_order?: number;
  created_at?: string;
};
