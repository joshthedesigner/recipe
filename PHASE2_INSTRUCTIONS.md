# ✅ Phase 2: Supabase Setup - Action Required!

## What I've Done So Far

I've created the code files that connect your app to Supabase:

### 1. **Supabase Client Files** (`lib/` folder)
- `supabase.ts` - Main connection to your database
- `supabase-browser.ts` - For use in browser components
- `auth-helpers.ts` - Easy functions for login, signup, logout

### 2. **Setup Instructions**
- Created `SUPABASE_SETUP_INSTRUCTIONS.md` with step-by-step SQL scripts

### 3. **Installed Packages**
- Added `@supabase/ssr` for authentication

---

## 🎯 What You Need to Do Now

I need you to run some SQL scripts in your Supabase dashboard to create the database tables. Don't worry - I'll guide you through it!

### Step-by-Step Guide:

#### 1. Create Your `.env.local` File

In your project folder (`/Users/jogold/tmp/recipeapp`), create a new file called `.env.local` and paste this:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rqqbftwvkforopamavbp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcWJmdHd2a2Zvcm9wYW1hdmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjQ3MjcsImV4cCI6MjA3NzQ0MDcyN30.sdAs2FaZMDfQYt_IGzd7vMGoxnZpWpsv4v87TNALBFo
OPENAI_API_KEY=your-openai-api-key-here
```

#### 2. Run SQL Scripts

Open the file **`SUPABASE_SETUP_INSTRUCTIONS.md`** I just created - it has detailed instructions with 3 SQL scripts to run:

1. **Script 1:** Creates the `recipes` table (with `user_id` for attribution!)
2. **Script 2:** Creates the `favorites` table
3. **Script 3:** Creates the `profiles` table (for display names like "Mom" or "Dad")

**How to run them:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project
3. Click **SQL Editor** (left sidebar)
4. Click **"New query"**
5. Copy and paste each script from the instructions file
6. Click **"Run"**

#### 3. Create Storage Bucket

In your Supabase dashboard:
1. Click **Storage** (left sidebar)
2. Click **"New bucket"**
3. Name it: `recipe-photos`
4. Make it **Public**
5. Click **"Create bucket"**

(Full details are in `SUPABASE_SETUP_INSTRUCTIONS.md`)

---

## 📊 What Gets Created

### Database Tables:

**1. `recipes` table** - Stores all recipes
- `id` - Unique recipe ID
- **`user_id`** - Who added this recipe (YOUR NEW FEATURE! 🎉)
- `recipe_name` - Recipe title
- `main_ingredient` - Main ingredient
- `cuisine` - Type of cuisine (Italian, Indian, etc.)
- `difficulty` - 1 to 5 scale
- `time_minutes` - Cooking time
- `notes` - Extra notes
- `recipe_text` - Full instructions
- `photo_url` - Link to photo
- `source_link` - Original website if from URL
- `created_at` - When it was added

**2. `favorites` table** - Stores user favorites
- Links users to their favorite recipes

**3. `profiles` table** - User display names
- Shows "Mom", "Dad", "Sarah" instead of just email addresses

### Storage:

**`recipe-photos` bucket** - Stores uploaded cookbook photos

---

## 🔒 Security (Row Level Security)

The SQL scripts set up security so:
- ✅ Everyone can **view** all recipes
- ✅ Users can only **edit/delete** their own recipes
- ✅ Users can only manage their own favorites
- ✅ Recipe photos are publicly viewable but only uploadable by logged-in users

---

## ✅ Verification Checklist

Once you've completed the steps, you should have:

- [ ] `.env.local` file created with your credentials
- [ ] `recipes` table created (run Script 1)
- [ ] `favorites` table created (run Script 2)
- [ ] `profiles` table created (run Script 3)
- [ ] `recipe-photos` storage bucket created
- [ ] Storage policies set up for photos

---

## 📱 Next Steps

After you complete these steps, let me know by saying:
- **"Done"** or **"Complete"** 

Then I'll:
1. Verify the setup works
2. Test a database connection
3. Move to Phase 3 (Backend API Functions)

---

## 💡 Need Help?

If you get stuck:
- Open `SUPABASE_SETUP_INSTRUCTIONS.md` for detailed steps
- Check your Supabase dashboard for any error messages
- Let me know what error you see, and I'll help fix it!

The SQL scripts are all ready to copy-and-paste - no coding required on your part! 🎉



