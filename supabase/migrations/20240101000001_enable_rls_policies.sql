-- Enable Row Level Security on prayers table
-- Requirements: 8.1

-- Enable RLS
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own prayers
-- This ensures users can only SELECT prayers where user_id matches their authenticated user ID
CREATE POLICY "Users can view own prayers"
  ON prayers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own prayers
-- This ensures users can only INSERT prayers with their own user_id
CREATE POLICY "Users can insert own prayers"
  ON prayers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON POLICY "Users can view own prayers" ON prayers IS 'Allows users to SELECT only their own prayer records';
COMMENT ON POLICY "Users can insert own prayers" ON prayers IS 'Allows users to INSERT prayers only with their own user_id';
