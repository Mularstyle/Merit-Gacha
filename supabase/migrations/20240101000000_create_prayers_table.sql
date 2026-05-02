-- Create prayers table with schema
-- Requirements: 12.1, 12.2, 12.3, 12.4, 12.5

CREATE TABLE prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wish_text TEXT NOT NULL,
  offering_image_url TEXT NOT NULL,
  tier VARCHAR(10) NOT NULL CHECK (tier IN ('SSR', 'SR', 'R', 'เกลือ')),
  verdict TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_prayers_user_id ON prayers(user_id);
CREATE INDEX idx_prayers_created_at ON prayers(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE prayers IS 'Stores user prayer submissions with AI evaluations';
COMMENT ON COLUMN prayers.id IS 'Unique identifier for each prayer';
COMMENT ON COLUMN prayers.user_id IS 'Foreign key to auth.users table';
COMMENT ON COLUMN prayers.wish_text IS 'User wish/prayer text';
COMMENT ON COLUMN prayers.offering_image_url IS 'Public URL of the offering image in Supabase Storage';
COMMENT ON COLUMN prayers.tier IS 'Gacha tier assigned by AI: SSR, SR, R, or เกลือ';
COMMENT ON COLUMN prayers.verdict IS 'Short verdict text from AI evaluation';
COMMENT ON COLUMN prayers.comment IS 'Detailed comment from AI evaluation';
COMMENT ON COLUMN prayers.created_at IS 'Timestamp when prayer was created (auto-generated)';
