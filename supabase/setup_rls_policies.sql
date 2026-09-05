-- =========================================================================
-- PARAS KACHORIWALA: REAL-TIME CLIENT ACCESS & RLS POLICIES
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nsvuwjtyevhiwkxokokt/sql
-- =========================================================================

-- 1. Enable Row Level Security
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS store_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gallery ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing conflicting policies
DROP POLICY IF EXISTS "allow_all_products" ON products;
DROP POLICY IF EXISTS "public_read_products" ON products;
DROP POLICY IF EXISTS "public_update_products" ON products;
DROP POLICY IF EXISTS "public_insert_products" ON products;

DROP POLICY IF EXISTS "allow_all_store_status" ON store_status;
DROP POLICY IF EXISTS "public_read_store_status" ON store_status;
DROP POLICY IF EXISTS "public_update_store_status" ON store_status;
DROP POLICY IF EXISTS "public_insert_store_status" ON store_status;

DROP POLICY IF EXISTS "allow_all_feedback" ON feedback;
DROP POLICY IF EXISTS "client_read_all_feedback" ON feedback;
DROP POLICY IF EXISTS "client_update_feedback" ON feedback;
DROP POLICY IF EXISTS "client_delete_feedback" ON feedback;
DROP POLICY IF EXISTS "public_delete_feedback" ON feedback;

DROP POLICY IF EXISTS "allow_all_gallery" ON gallery;
DROP POLICY IF EXISTS "public_read_gallery" ON gallery;
DROP POLICY IF EXISTS "public_insert_gallery" ON gallery;
DROP POLICY IF EXISTS "public_update_gallery" ON gallery;
DROP POLICY IF EXISTS "public_delete_gallery" ON gallery;

-- 3. PRODUCTS: Full read & write for website and author portal
CREATE POLICY "allow_all_products" ON products
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. STORE STATUS: Full read & write for live open/close & crowd levels
CREATE POLICY "allow_all_store_status" ON store_status
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. FEEDBACK / REVIEWS: Allow customers to insert, all users to view, and author to manage
CREATE POLICY "allow_all_feedback" ON feedback
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 6. GALLERY: Full read & write for author photo uploads and customer views
CREATE POLICY "allow_all_gallery" ON gallery
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Ensure publication includes tables for real-time WebSockets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'store_status'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE store_status;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'feedback'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'gallery'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE gallery;
  END IF;
END $$;
