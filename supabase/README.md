# Supabase Migrations

This directory contains SQL migration files for the Merit Gacha database schema.

## Running Migrations

### Option 1: Using Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste and execute the SQL

### Option 3: Manual Execution

Connect to your Supabase database using a PostgreSQL client and execute the migration files in order.

## Migration Files

- `20240101000000_create_prayers_table.sql` - Creates the prayers table with all required columns, foreign keys, indexes, and constraints
- `20240101000001_enable_rls_policies.sql` - Enables Row Level Security and creates policies for user data access control
- `20240101000002_create_offerings_storage_bucket.sql` - Creates the 'offerings' storage bucket with public read access and user upload policies

## Schema Overview

The `prayers` table stores user prayer submissions with AI evaluations:

- **id**: UUID primary key (auto-generated)
- **user_id**: Foreign key to auth.users (CASCADE delete)
- **wish_text**: User's wish/prayer text
- **offering_image_url**: Public URL of offering image
- **tier**: Gacha tier (SSR, SR, R, or เกลือ) with CHECK constraint
- **verdict**: Short verdict from AI
- **comment**: Detailed comment from AI
- **created_at**: Timestamp (auto-generated)

### Indexes

- `idx_prayers_user_id`: Index on user_id for efficient user-specific queries
- `idx_prayers_created_at`: Descending index on created_at for chronological ordering

### Constraints

- Foreign key constraint on user_id referencing auth.users(id) with CASCADE delete
- CHECK constraint on tier column to ensure only valid values (SSR, SR, R, เกลือ)

### Row Level Security (RLS)

RLS is enabled on the prayers table with the following policies:

- **Users can view own prayers**: Users can only SELECT prayer records where user_id matches their authenticated user ID (auth.uid())
- **Users can insert own prayers**: Users can only INSERT prayer records with their own user_id

## Storage Bucket

The `offerings` storage bucket stores user-uploaded offering images:

- **Bucket name**: offerings
- **Public access**: Enabled (anyone can view images)
- **File organization**: Files are organized by user_id folders (e.g., `{user_id}/image.jpg`)

### Storage Policies

- **Users can upload offerings**: Authenticated users can upload images to their own folder (named with their user_id)
- **Anyone can view offerings**: Public read access to all offering images
- **Users can update own offerings**: Users can replace/update images in their own folder
- **Users can delete own offerings**: Users can delete images from their own folder

## Verifying Setup

After running the migrations, you can verify the setup in the Supabase Dashboard:

1. **Check the prayers table**:
   - Navigate to Table Editor → prayers
   - Verify all columns exist (id, user_id, wish_text, offering_image_url, tier, verdict, comment, created_at)
   - Check that RLS is enabled (shield icon should be visible)

2. **Check the storage bucket**:
   - Navigate to Storage
   - Verify the 'offerings' bucket exists
   - Check that it's marked as public
   - Click on the bucket → Policies to verify all 4 policies are created

3. **Test authentication**:
   - Navigate to Authentication → Providers
   - Ensure Google OAuth is enabled and configured
