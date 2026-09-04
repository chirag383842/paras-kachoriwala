-- Migration: Secure feedback/review update policy
-- Only the authenticated Author/Admin can change the 'approved' (featured) status of reviews.
-- Anonymous visitors can still INSERT new feedback and SELECT approved reviews.

-- Drop the insecure policy that allowed anon users to UPDATE feedback (including approved status)
DROP POLICY IF EXISTS "public_update_feedback" ON feedback;

-- Create a secure policy: only authenticated (logged-in Author) can update any feedback row
CREATE POLICY "author_update_feedback" ON feedback FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Ensure anon SELECT still only shows approved reviews (unchanged, just re-confirmed)
DROP POLICY IF EXISTS "public_read_approved_feedback" ON feedback;
CREATE POLICY "public_read_approved_feedback" ON feedback FOR SELECT
  TO anon USING (approved = true);

-- Authenticated (Author) can read ALL feedback (approved and not)
DROP POLICY IF EXISTS "author_read_all_feedback" ON feedback;
CREATE POLICY "author_read_all_feedback" ON feedback FOR SELECT
  TO authenticated USING (true);
