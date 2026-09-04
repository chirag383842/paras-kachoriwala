-- The owner portal uses its own browser login rather than Supabase Auth.
-- Keep the database policy aligned with that client-side model so owner review
-- management and anonymous feedback submission work through the anon key.

DROP POLICY IF EXISTS "author_read_all_feedback" ON feedback;
DROP POLICY IF EXISTS "author_update_feedback" ON feedback;
DROP POLICY IF EXISTS "public_delete_feedback" ON feedback;
DROP POLICY IF EXISTS "client_read_all_feedback" ON feedback;
DROP POLICY IF EXISTS "client_update_feedback" ON feedback;
DROP POLICY IF EXISTS "client_delete_feedback" ON feedback;

CREATE POLICY "client_read_all_feedback" ON feedback FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "client_update_feedback" ON feedback FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "client_delete_feedback" ON feedback FOR DELETE
  TO anon, authenticated USING (true);
