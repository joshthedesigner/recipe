# 🗄️ Supabase Database Setup Instructions

## Step 1: Create Your .env.local File

Create a file called `.env.local` in the root of your project with this content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rqqbftwvkforopamavbp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcWJmdHd2a2Zvcm9wYW1hdmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjQ3MjcsImV4cCI6MjA3NzQ0MDcyN30.sdAs2FaZMDfQYt_IGzd7vMGoxnZpWpsv4v87TNALBFo

# OpenAI Configuration (add your key when ready)
OPENAI_API_KEY=your-openai-api-key-here
```

## Step 2: Run SQL Scripts in Supabase

Go to your Supabase dashboard and follow these steps:

1. Open your project at [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click on the **SQL Editor** icon in the left sidebar (looks like a document with code)
3. Click **"New query"**
4. Copy and paste each SQL script below, one at a time
5. Click **"Run"** after pasting each script

---

### Script 1: Enable Row Level Security and Create Recipes Table

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_name TEXT NOT NULL,
  main_ingredient TEXT,
  cuisine TEXT,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  time_minutes INTEGER,
  notes TEXT,
  recipe_text TEXT,
  photo_url TEXT,
  source_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all recipes
CREATE POLICY "Anyone can view recipes"
  ON public.recipes
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own recipes
CREATE POLICY "Users can insert their own recipes"
  ON public.recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recipes
CREATE POLICY "Users can update their own recipes"
  ON public.recipes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own recipes
CREATE POLICY "Users can delete their own recipes"
  ON public.recipes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX recipes_user_id_idx ON public.recipes(user_id);
CREATE INDEX recipes_main_ingredient_idx ON public.recipes(main_ingredient);
CREATE INDEX recipes_cuisine_idx ON public.recipes(cuisine);
CREATE INDEX recipes_difficulty_idx ON public.recipes(difficulty);
```

---

### Script 2: Create Favorites Table

```sql
-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, recipe_id)
);

-- Enable Row Level Security on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX favorites_recipe_id_idx ON public.favorites(recipe_id);
```

---

### Script 3: Create User Profiles Table (Optional - for display names)

```sql
-- Create profiles table for user display names
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view profiles (for recipe attribution)
CREATE POLICY "Anyone can view profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 3: Create Storage Bucket for Recipe Photos

1. In your Supabase dashboard, click on **Storage** in the left sidebar
2. Click **"New bucket"**
3. Set the following:
   - **Name:** `recipe-photos`
   - **Public:** Toggle ON (so photos can be viewed)
   - **File size limit:** 5 MB (recommended)
   - **Allowed MIME types:** `image/*`
4. Click **"Create bucket"**

### Set Storage Policies

After creating the bucket, click on the `recipe-photos` bucket, then click **"Policies"**:

1. Click **"New policy"** for INSERT
   - Name: "Users can upload recipe photos"
   - Policy definition: Use this SQL:
   ```sql
   (bucket_id = 'recipe-photos'::text) AND (auth.uid() IS NOT NULL)
   ```

2. Click **"New policy"** for SELECT
   - Name: "Anyone can view recipe photos"
   - Policy definition: Use this SQL:
   ```sql
   (bucket_id = 'recipe-photos'::text)
   ```

3. Click **"New policy"** for DELETE
   - Name: "Users can delete their own photos"
   - Policy definition: Use this SQL:
   ```sql
   (bucket_id = 'recipe-photos'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
   ```

---

## Step 4: Enable Email Authentication

1. In your Supabase dashboard, click on **Authentication** in the left sidebar
2. Click on **"Providers"**
3. Find **Email** and make sure it's **enabled** (it should be by default)
4. Scroll down and configure:
   - **Enable email confirmations:** You can toggle this OFF for development (faster testing)
   - **Enable email signup:** Make sure this is ON

---

## Verification

Once you've completed all steps, you should have:

- ✅ `.env.local` file created with your credentials
- ✅ `recipes` table created with `user_id` field
- ✅ `favorites` table created
- ✅ `profiles` table created (for display names)
- ✅ `recipe-photos` storage bucket created
- ✅ Email authentication enabled
- ✅ Row Level Security policies set up

---

**When you're done, please let me know and I'll verify the setup!**



