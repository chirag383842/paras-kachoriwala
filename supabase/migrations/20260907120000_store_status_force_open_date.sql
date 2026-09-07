-- Allow author to open the stall before the regular 7:00 PM IST schedule
-- without changing timezone or the automatic 7:00 PM – 11:30 PM hours.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store_status' AND column_name = 'force_open_date'
  ) THEN
    ALTER TABLE store_status ADD COLUMN force_open_date text;
  END IF;
END $$;
