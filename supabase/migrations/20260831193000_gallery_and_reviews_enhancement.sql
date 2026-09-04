-- Migration: Gallery management, store status closed_for_date, Kachori varieties, and reviews synchronization

-- 1. Create Gallery table if not exists
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  src text NOT NULL,
  alt text NOT NULL,
  category text NOT NULL DEFAULT 'food', -- 'food', 'shop', 'customers', 'about', 'home'
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery" ON gallery;
CREATE POLICY "public_read_gallery" ON gallery FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_gallery" ON gallery;
CREATE POLICY "public_insert_gallery" ON gallery FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_gallery" ON gallery;
CREATE POLICY "public_update_gallery" ON gallery FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_gallery" ON gallery;
CREATE POLICY "public_delete_gallery" ON gallery FOR DELETE
  TO anon, authenticated USING (true);

-- 2. Add closed_for_date to store_status if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store_status' AND column_name = 'closed_for_date'
  ) THEN
    ALTER TABLE store_status ADD COLUMN closed_for_date text;
  END IF;
END $$;

-- 3. Ensure feedback table has approved column with update policy
DROP POLICY IF EXISTS "public_update_feedback" ON feedback;
CREATE POLICY "public_update_feedback" ON feedback FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Seed gallery items if table is empty
INSERT INTO gallery (src, alt, category, caption, display_order)
VALUES
  ('/images/kachori.webp', 'Crispy signature Kachori served hot at Paras Kachoriwala', 'food', 'Signature Kachori', 1),
  ('/images/bhel.webp', 'Fresh Bhel topped with sev, chutneys, and coriander', 'food', 'Fresh Bhel', 2),
  ('/images/lari_pic.webp', 'Paras Kachoriwala food cart illuminated at night', 'shop', 'Our Food Cart', 3),
  ('/images/bhel.webp', 'Crispy sev and puffed rice ingredients for fresh Bhel', 'food', 'Full of Flavour', 4),
  ('/images/kachori.webp', 'Freshly prepared golden Kachoris ready for serving', 'food', 'Made Fresh Daily', 5),
  ('/images/lari_pic.webp', 'Customers enjoying fresh kachori at Paras Kachoriwala', 'customers', 'Serving with a Smile', 6)
ON CONFLICT DO NOTHING;

-- 5. Seed 3 Kachori varieties (Regular, Jain, Swaminarayan) + Bhel
INSERT INTO products (slug, name, price, description, image_url, available, stock, featured, display_order)
VALUES
  ('kachori', 'Regular Kachori', 40, 'Crispy, golden-fried puffed pastry stuffed with our classic spiced lentil and onion filling — served hot with tangy house chutneys.', '/images/kachori.webp', true, 80, true, 1),
  ('kachori-jain', 'Jain Kachori (No Onion / No Garlic)', 40, 'Prepared strictly per Jain dietary traditions without onion or garlic — packed with rich authentic spices and served with fresh sweet and spicy chutneys.', '', true, 50, false, 2),
  ('kachori-swaminarayan', 'Swaminarayan Kachori (Satvik)', 40, 'Pure satvik preparation crafted strictly without onion or garlic, following Swaminarayan dietary guidelines with fragrant spices and fresh chutneys.', '', true, 50, false, 3),
  ('bhel', 'Fresh Bhel', 50, 'Light, crunchy puffed rice tossed with fresh tomatoes, onions, sev and our house chutneys — a burst of flavour in every bite.', '/images/bhel.webp', true, 60, false, 4)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  display_order = EXCLUDED.display_order;
