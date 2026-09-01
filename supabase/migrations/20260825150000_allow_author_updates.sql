-- Enable UPDATE / INSERT policies for products and store_status so the Author can manage live updates from the frontend portal

DROP POLICY IF EXISTS "public_update_products" ON products;
CREATE POLICY "public_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_products" ON products;
CREATE POLICY "public_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_store_status" ON store_status;
CREATE POLICY "public_update_store_status" ON store_status FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_store_status" ON store_status;
CREATE POLICY "public_insert_store_status" ON store_status FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_feedback" ON feedback;
CREATE POLICY "public_delete_feedback" ON feedback FOR DELETE
  TO anon, authenticated USING (true);

