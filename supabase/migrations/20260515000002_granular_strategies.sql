-- Update nutritional_strategies to support granular meal targets
ALTER TABLE nutritional_strategies ADD COLUMN IF NOT EXISTS meal_targets JSONB;

-- Update RLS (already enabled, just ensuring column access)
-- No changes needed to policies as they cover the whole table.
