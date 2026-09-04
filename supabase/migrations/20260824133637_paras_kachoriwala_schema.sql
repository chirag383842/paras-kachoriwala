/*
# Paras Kachoriwala — initial schema

1. New Tables
- `products`: the two main products (Kachori, Bhel) with price, availability, stock, description, image.
- `store_status`: live store open/closed status, crowd level, last updated time.
- `feedback`: customer feedback submissions (rating, food/service/cleanliness, written feedback, optional name).
- `reviews`: selected reviews shown on the home page (curated by owner).

2. Security
- Single-tenant, no-auth app. All policies use `TO anon, authenticated` so the anon-key frontend can read/write.
- Feedback: anyone can submit (INSERT) and read (SELECT). This is intentional — feedback is public and submitted without login.
- Products, store_status, reviews: public read, no public write (owner manages via Supabase dashboard or future admin).

3. Notes
- `products` and `store_status` are seeded with default data so the site works on first load.
- `feedback` is empty by design; the feedback form populates it.
- `reviews` is seeded with a couple of honest placeholder reviews marked as such; the owner should replace with real ones.
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  price integer NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  available boolean NOT NULL DEFAULT true,
  stock integer,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- Store status table (single row, updated by owner)
CREATE TABLE IF NOT EXISTS store_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_open boolean NOT NULL DEFAULT true,
  crowd_level text NOT NULL DEFAULT 'Moderate',
  last_updated timestamptz DEFAULT now(),
  updated_by text
);

ALTER TABLE store_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_store_status" ON store_status;
CREATE POLICY "public_read_store_status" ON store_status FOR SELECT
  TO anon, authenticated USING (true);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  food_rating integer CHECK (food_rating >= 1 AND food_rating <= 5),
  service_rating integer CHECK (service_rating >= 1 AND service_rating <= 5),
  cleanliness_rating integer CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  message text,
  customer_name text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_approved_feedback" ON feedback;
CREATE POLICY "public_read_approved_feedback" ON feedback FOR SELECT
  TO anon, authenticated USING (approved = true);

DROP POLICY IF EXISTS "public_insert_feedback" ON feedback;
CREATE POLICY "public_insert_feedback" ON feedback FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Reviews table (curated reviews shown on home page)
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message text NOT NULL,
  customer_name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

-- Seed products
INSERT INTO products (slug, name, price, description, image_url, available, stock, featured, display_order)
VALUES
  ('kachori', 'Kachori', 40, 'Crispy, golden-fried puffed pastry stuffed with a spiced lentil and onion filling — our signature item, served hot with tangy chutneys.', 'https://images.pexels.com/photos/17480807/pexels-photo-17480807.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 80, true, 1),
  ('bhel', 'Bhel', 50, 'Light, crunchy puffed rice tossed with fresh tomatoes, onions, sev and our house chutneys — a burst of flavour in every bite.', 'https://images.pexels.com/photos/12865864/pexels-photo-12865864.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 60, false, 2)
ON CONFLICT (slug) DO NOTHING;

-- Seed store status
INSERT INTO store_status (is_open, crowd_level, last_updated)
VALUES (true, 'Moderate', now())
ON CONFLICT DO NOTHING;

-- Seed reviews (honest placeholders — owner should replace with real customer reviews)
INSERT INTO reviews (rating, message, customer_name, display_order)
VALUES
  (5, 'Best kachori in the area! Crispy, fresh and full of flavour. Have been coming here for years.', 'Regular Customer', 1),
  (5, 'The bhel here is unbeatable. Perfect balance of sweet, spicy and crunchy.', 'Local Foodie', 2)
ON CONFLICT DO NOTHING;
