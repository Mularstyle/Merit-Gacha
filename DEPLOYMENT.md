# Merit Gacha Deployment Guide

This guide provides step-by-step instructions for deploying the Merit Gacha application to production using Vercel, Supabase, and Google AI Studio.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Google AI Studio API Key Setup](#google-ai-studio-api-key-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have accounts for the following services:

- **GitHub Account**: For hosting your code repository
- **Vercel Account**: For deploying the Next.js application ([vercel.com](https://vercel.com))
- **Supabase Account**: For database and authentication ([supabase.com](https://supabase.com))
- **Google Account**: For accessing Google AI Studio ([aistudio.google.com](https://aistudio.google.com))

### Required Tools

- Git installed on your local machine
- Node.js 20.x or later
- npm or yarn package manager

---

## Supabase Setup

### Step 1: Create a New Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `merit-gacha` (or your preferred name)
   - **Database Password**: Choose a strong password (save this securely)
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

### Step 2: Configure Google OAuth Authentication

1. In your Supabase project dashboard, navigate to **Authentication** → **Providers**
2. Find **Google** in the provider list and click to expand
3. Toggle **"Enable Google provider"** to ON
4. You'll need to create OAuth credentials in Google Cloud Console:

#### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `Merit Gacha`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"** through the remaining steps
6. Back in Credentials, click **"Create Credentials"** → **"OAuth client ID"**
7. Application type: **Web application**
8. Name: `Merit Gacha`
9. **Authorized redirect URIs**: Add the following URL (replace `YOUR_PROJECT_REF` with your Supabase project reference):
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   - You can find your project reference in Supabase under **Settings** → **General** → **Reference ID**
10. Click **"Create"**
11. Copy the **Client ID** and **Client Secret**

#### Configure Google OAuth in Supabase

1. Return to Supabase **Authentication** → **Providers** → **Google**
2. Paste the **Client ID** and **Client Secret** from Google Cloud Console
3. Click **"Save"**

### Step 3: Run Database Migrations

You need to create the database schema by running the SQL migration files.

#### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase project dashboard, navigate to **SQL Editor**
2. Click **"New query"**
3. Copy the contents of `supabase/migrations/20240101000000_create_prayers_table.sql` from your project
4. Paste into the SQL Editor and click **"Run"**
5. Repeat for the following migration files in order:
   - `20240101000001_enable_rls_policies.sql`
   - `20240101000002_create_offerings_storage_bucket.sql`

#### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Step 4: Verify Database Setup

1. Navigate to **Table Editor** in Supabase dashboard
2. Verify the `prayers` table exists with the following columns:
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key)
   - `wish_text` (text)
   - `offering_image_url` (text)
   - `tier` (varchar)
   - `verdict` (text)
   - `comment` (text)
   - `created_at` (timestamp)
3. Check that RLS (Row Level Security) is enabled (shield icon should be visible)

### Step 5: Verify Storage Bucket

1. Navigate to **Storage** in Supabase dashboard
2. Verify the `offerings` bucket exists
3. Check that it's marked as **Public**
4. Click on the bucket → **Policies** tab
5. Verify the following policies exist:
   - "Users can upload offerings"
   - "Anyone can view offerings"
   - "Users can update own offerings"
   - "Users can delete own offerings"

### Step 6: Get Supabase API Credentials

1. Navigate to **Settings** → **API** in Supabase dashboard
2. Copy the following values (you'll need these for Vercel):
   - **Project URL**: `https://YOUR_PROJECT_REF.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

⚠️ **Important**: Keep these credentials secure. The `anon` key is safe to use in client-side code, but never commit it to public repositories.

---

## Google AI Studio API Key Setup

### Step 1: Access Google AI Studio

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Accept the terms of service if prompted

### Step 2: Create an API Key

1. Click on **"Get API key"** in the left sidebar (or navigate to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))
2. Click **"Create API key"**
3. Select an existing Google Cloud project or create a new one
4. Click **"Create API key in existing project"** or **"Create API key in new project"**
5. Copy the generated API key (it will look like: `AIzaSy...`)

⚠️ **Important**: Store this API key securely. You won't be able to see it again after closing the dialog.

### Step 3: Enable Gemini API

The API key should automatically have access to the Gemini API. To verify:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **Enabled APIs & services**
4. Verify **"Generative Language API"** is enabled
5. If not, search for it in **API Library** and enable it

---

## Vercel Deployment

### Step 1: Push Code to GitHub

1. Ensure your code is committed to a Git repository
2. Push your repository to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository:
   - If this is your first time, authorize Vercel to access your GitHub account
   - Select the `merit-gacha` repository
4. Click **"Import"**

### Step 3: Configure Project Settings

1. **Framework Preset**: Vercel should auto-detect **Next.js**
2. **Root Directory**: Leave as `./` (or set to `merit-gacha` if your project is in a subdirectory)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### Step 4: Configure Environment Variables

Before deploying, you need to add environment variables. Click **"Environment Variables"** and add the following:

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` | From Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | From Supabase Settings → API (anon public key) |
| `GOOGLE_AI_API_KEY` | `AIzaSy...` | From Google AI Studio |

⚠️ **Important**: 
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- `GOOGLE_AI_API_KEY` is server-side only and will not be exposed to clients
- Make sure to add these variables to **all environments** (Production, Preview, Development)

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your application (this takes 2-5 minutes)
3. Once complete, you'll see a success message with your deployment URL

### Step 6: Update Google OAuth Redirect URIs

After deployment, you need to add your Vercel domain to Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
4. Also add your Vercel domain for local testing:
   ```
   https://your-app.vercel.app
   ```
5. Click **"Save"**

---

## Environment Variables Configuration

### Summary of Required Environment Variables

Here's a complete reference of all environment variables needed:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google AI Studio API Key
GOOGLE_AI_API_KEY=your-gemini-api-key-here

# App Configuration (optional, auto-detected by Vercel)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Setting Environment Variables in Vercel Dashboard

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. For each variable:
   - Enter the **Key** (variable name)
   - Enter the **Value**
   - Select which environments to apply to:
     - ✅ **Production**: Live deployment
     - ✅ **Preview**: Pull request previews
     - ✅ **Development**: Local development (optional)
   - Click **"Save"**

### Updating Environment Variables

If you need to update environment variables after deployment:

1. Go to **Settings** → **Environment Variables**
2. Find the variable you want to update
3. Click the **"..."** menu → **"Edit"**
4. Update the value and click **"Save"**
5. **Redeploy** your application for changes to take effect:
   - Go to **Deployments** tab
   - Click **"..."** on the latest deployment → **"Redeploy"**

---

## Post-Deployment Verification

After deployment, verify that everything is working correctly:

### Step 1: Test Authentication

1. Visit your deployed application URL (e.g., `https://your-app.vercel.app`)
2. You should be redirected to the login page
3. Click the Google login button
4. Complete the Google OAuth flow
5. Verify you're redirected back to the application and logged in

### Step 2: Test Prayer Submission

1. Navigate to the Shrine page (`/shrine`)
2. Enter a wish in Thai (e.g., "ขอให้รวยๆ")
3. Upload an offering image (JPEG, PNG, or WebP, < 10MB)
4. Click **"ขอพร"** (Submit)
5. Wait for the AI evaluation (should take 5-15 seconds)
6. Verify the result displays with:
   - Tier badge (SSR, SR, R, or เกลือ)
   - Verdict text
   - Comment text

### Step 3: Test Prayer History

1. Navigate to the History page (`/history`)
2. Verify your submitted prayer appears in the list
3. Check that all fields are displayed:
   - Offering image
   - Wish text
   - Tier badge
   - Verdict and comment
   - Timestamp

### Step 4: Test Logout

1. Click the logout button in the navigation
2. Verify you're redirected to the login page
3. Verify you cannot access protected routes without logging in

### Step 5: Check Vercel Logs

1. Go to your project in Vercel dashboard
2. Navigate to **Deployments** → Click on your deployment
3. Click **"Functions"** tab to see serverless function logs
4. Verify there are no errors in the logs

### Step 6: Check Supabase Logs

1. Go to your Supabase project dashboard
2. Navigate to **Logs** → **API Logs**
3. Verify authentication and database operations are successful
4. Check **Storage Logs** to verify image uploads

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Invalid API Key" Error

**Symptoms**: Prayer submission fails with API key error

**Solutions**:
1. Verify `GOOGLE_AI_API_KEY` is set correctly in Vercel environment variables
2. Check that the API key is valid in Google AI Studio
3. Ensure Generative Language API is enabled in Google Cloud Console
4. Redeploy the application after updating environment variables

#### Issue: Authentication Redirect Loop

**Symptoms**: After Google login, you're redirected back to login page repeatedly

**Solutions**:
1. Verify Google OAuth redirect URI matches your Supabase project URL exactly
2. Check that Google OAuth is enabled in Supabase Authentication settings
3. Verify Client ID and Client Secret are correct in Supabase
4. Clear browser cookies and try again

#### Issue: "Failed to Upload Image" Error

**Symptoms**: Image upload fails during prayer submission

**Solutions**:
1. Verify the `offerings` storage bucket exists in Supabase
2. Check that storage policies are correctly configured
3. Verify the image is < 10MB and in JPEG/PNG/WebP format
4. Check Supabase Storage logs for detailed error messages

#### Issue: Database Connection Error

**Symptoms**: Cannot save or retrieve prayers

**Solutions**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
2. Check that database migrations have been run successfully
3. Verify RLS policies are enabled on the `prayers` table
4. Check Supabase API logs for detailed error messages

#### Issue: "Cannot Read Property of Undefined" Error

**Symptoms**: Application crashes with JavaScript errors

**Solutions**:
1. Check Vercel function logs for stack traces
2. Verify all required environment variables are set
3. Ensure the build completed successfully without warnings
4. Check that all dependencies are installed correctly

#### Issue: Slow AI Response Times

**Symptoms**: Prayer evaluation takes > 30 seconds or times out

**Solutions**:
1. Check Google AI Studio API quota and rate limits
2. Verify your API key has sufficient quota
3. Consider upgrading to a paid Google Cloud plan for higher limits
4. Check Vercel function logs for timeout errors

#### Issue: 401 Unauthorized on API Routes

**Symptoms**: API calls fail with 401 status code

**Solutions**:
1. Verify user is authenticated before making API calls
2. Check that Supabase session cookie is being sent with requests
3. Verify middleware is correctly protecting routes
4. Clear browser cookies and log in again

### Getting Help

If you encounter issues not covered here:

1. **Check Vercel Logs**: Detailed error messages in function logs
2. **Check Supabase Logs**: Database and storage operation logs
3. **Review Documentation**:
   - [Next.js Documentation](https://nextjs.org/docs)
   - [Supabase Documentation](https://supabase.com/docs)
   - [Vercel Documentation](https://vercel.com/docs)
   - [Google AI Studio Documentation](https://ai.google.dev/docs)
4. **GitHub Issues**: Check the project repository for known issues

---

## Additional Configuration

### Custom Domain Setup

To use a custom domain with your Vercel deployment:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Domains**
3. Click **"Add"**
4. Enter your domain name (e.g., `merit-gacha.com`)
5. Follow the instructions to configure DNS records
6. Update Google OAuth redirect URIs to include your custom domain

### Production Environment Variables

For production deployments, consider:

1. **Separate Supabase Projects**: Use different projects for development and production
2. **API Key Rotation**: Regularly rotate Google AI API keys
3. **Monitoring**: Set up Vercel Analytics and Supabase monitoring
4. **Backups**: Enable Supabase automatic backups for production database

### Performance Optimization

1. **Enable Vercel Analytics**: Monitor performance metrics
2. **Configure Caching**: Set appropriate cache headers for static assets
3. **Image Optimization**: Use Next.js Image component for offering images
4. **Database Indexing**: Verify indexes are created on `prayers` table

---

## Security Checklist

Before going to production, ensure:

- ✅ All environment variables are set correctly
- ✅ Google OAuth redirect URIs are configured for production domain
- ✅ Supabase RLS policies are enabled and tested
- ✅ API keys are not committed to version control
- ✅ Storage bucket policies restrict uploads to authenticated users
- ✅ CORS is configured correctly in Supabase
- ✅ Rate limiting is considered for API routes
- ✅ Error messages don't expose sensitive information

---

## Maintenance

### Regular Tasks

1. **Monitor Logs**: Check Vercel and Supabase logs weekly for errors
2. **Update Dependencies**: Keep Next.js and other packages up to date
3. **Review API Usage**: Monitor Google AI API quota usage
4. **Database Backups**: Verify Supabase backups are running
5. **Security Updates**: Apply security patches promptly

### Scaling Considerations

As your application grows:

1. **Upgrade Supabase Plan**: Free tier has limits on storage and database size
2. **Upgrade Vercel Plan**: Consider Pro plan for better performance
3. **Optimize Database**: Add indexes for frequently queried columns
4. **CDN Configuration**: Use Vercel's edge network for global performance
5. **Caching Strategy**: Implement caching for prayer history queries

---

## Conclusion

You should now have a fully deployed Merit Gacha application! Users can:

- ✅ Log in with Google OAuth
- ✅ Submit prayers with offering images
- ✅ Receive AI-generated evaluations
- ✅ View their prayer history

For questions or issues, refer to the troubleshooting section or consult the project documentation.

**Happy deploying! 🙏✨**
