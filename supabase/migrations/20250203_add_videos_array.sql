-- Add videos array column to listings table
ALTER TABLE "public"."listings" 
ADD COLUMN IF NOT EXISTS "videos" text[] DEFAULT '{}';

-- Migrate any existing video_url data to the new videos array
UPDATE "public"."listings"
SET "videos" = ARRAY[video_url]
WHERE video_url IS NOT NULL;
