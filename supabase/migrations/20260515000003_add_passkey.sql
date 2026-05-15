-- Add passkey column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS passkey TEXT;

-- Update RLS (already enabled, just ensuring column access)
-- No changes needed to policies as they cover the whole table.
