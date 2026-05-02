-- Create Supabase Storage bucket for offerings
-- Requirements: 3.3, 3.4

-- Create public 'offerings' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('offerings', 'offerings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Users can upload offerings to their own folder
-- This allows authenticated users to upload files to a folder named with their user_id
CREATE POLICY "Users can upload offerings"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'offerings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policy: Anyone can view offerings (public bucket)
-- This allows public read access to all files in the offerings bucket
CREATE POLICY "Anyone can view offerings"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'offerings');

-- Storage policy: Users can update their own offerings
-- This allows users to replace/update files in their own folder
CREATE POLICY "Users can update own offerings"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'offerings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policy: Users can delete their own offerings
-- This allows users to delete files from their own folder
CREATE POLICY "Users can delete own offerings"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'offerings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add comments for documentation
COMMENT ON POLICY "Users can upload offerings" ON storage.objects IS 'Allows authenticated users to upload offering images to their own folder (user_id)';
COMMENT ON POLICY "Anyone can view offerings" ON storage.objects IS 'Allows public read access to all offering images';
COMMENT ON POLICY "Users can update own offerings" ON storage.objects IS 'Allows users to update their own offering images';
COMMENT ON POLICY "Users can delete own offerings" ON storage.objects IS 'Allows users to delete their own offering images';
