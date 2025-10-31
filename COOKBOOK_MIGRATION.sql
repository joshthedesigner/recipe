-- Add cookbook and source type columns to recipes table
-- Run this in your Supabase SQL editor

ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS cookbook_name TEXT,
ADD COLUMN IF NOT EXISTS cookbook_page TEXT,
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'none' CHECK (source_type IN ('url', 'cookbook', 'user_input', 'photo', 'none'));

-- Add comments to document the fields
COMMENT ON COLUMN recipes.source_link IS 'URL source for web-scraped recipes';
COMMENT ON COLUMN recipes.cookbook_name IS 'Name of cookbook for physical book recipes';
COMMENT ON COLUMN recipes.cookbook_page IS 'Page number in the cookbook (optional)';
COMMENT ON COLUMN recipes.source_type IS 'Type of source: url, cookbook, user_input, photo, or none';

-- Optional: Create an index for faster cookbook searches
CREATE INDEX IF NOT EXISTS idx_recipes_cookbook_name ON recipes(cookbook_name);
CREATE INDEX IF NOT EXISTS idx_recipes_source_type ON recipes(source_type);
