# Cursor Step-by-Step Instructions: Smart Conversational Recipe AI

## Project Goal
Build a family-friendly AI assistant that stores, queries, and manages recipes entirely via natural-language conversation, using context-aware AI to extract information from photos and website URLs.

## General Rules for AI
- **Never make changes without explicit approval**
- **Stop at the end of each phase and request confirmation**
- **Only proceed when the user explicitly says "approve"**
- Comment code clearly and provide short status updates

---

## Phase 0: Setup Confirmation

**Action:**
- Present the PRD and scope to the user:
  > *"I am ready to start building the Family Recipe AI Assistant as described. Please confirm before I proceed."*
- Wait for user approval.

---

## Phase 1: Project Scaffold

**Tasks:**
- Scaffold Next.js + TypeScript project
- Install dependencies:
  - Tailwind CSS (styling)
  - Supabase client (database)
  - Tesseract.js (OCR for photos)
  - OpenAI SDK (GPT-4o-mini for AI chat and extraction)
- Commit scaffolded project

**Stop and ask for confirmation before moving to Phase 2.**

---

## Phase 2: Supabase Setup

**Tasks:**
- Create tables:
  - **`recipes`** with fields:
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to auth.users - recipe owner)
    - `recipe_name` (text)
    - `main_ingredient` (text)
    - `cuisine` (text)
    - `difficulty` (integer, 1-5)
    - `time_minutes` (integer)
    - `notes` (text)
    - `recipe_text` (text, full instructions)
    - `photo_url` (text, URL to stored image)
    - `source_link` (text, original website URL if applicable)
    - `created_at` (timestamp)
  
  - **`favorites`** with fields:
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to auth.users)
    - `recipe_id` (uuid, foreign key to recipes)
    - `created_at` (timestamp)

- Create Supabase storage bucket for recipe photos (`recipe-photos`)
- Set up simple Supabase Auth (email/password)
- Note: Supabase Auth automatically creates a `users` table with user profile info

**Stop and ask for confirmation before adding API functions.**

---

## Phase 3: Backend API Functions

**Tasks:**
- Implement serverless API functions (Next.js API routes or server actions):
  - `addRecipe(data, user_id)` → add structured recipe to DB with owner
  - `searchRecipes(filters)` → filter recipes by ingredients, cuisine, difficulty, user_id, etc.
  - `sortRecipes(field)` → sort results
  - `getAllRecipes()` → return all recipes with owner info
  - `getRecipesByUser(user_id)` → get all recipes by a specific family member
  - `addFavorite(recipe_id, user_id)` → save favorite
  - `getFavorites(user_id)` → fetch favorites
  - `removeFavorite(recipe_id, user_id)` → remove favorite

- Ensure all functions return structured JSON
- Add error handling

**Stop and ask for confirmation before moving to frontend.**

---

## Phase 4: Frontend Layout & Chat Skeleton

**Tasks:**
- Create main components/pages:
  - **Chat interface** (main interaction)
  - **Recipe cards** for query results
  - **Favorites sidebar** (collapsible)
  - **Modal overlay** for photo viewing
  - **Login/Signup page** (simple Supabase Auth)

- Implement Tailwind styling (clean, modern, family-friendly)
- Create responsive layout (desktop + mobile)

**Stop and ask for confirmation before adding interactivity.**

---

## Phase 5: Smart Conversational Recipe Entry

**Tasks:**
- Implement AI-driven conversation for adding recipes:
  1. User can provide **photo** or **website URL**
  2. AI first extracts information automatically:
     - For photos: Use Tesseract.js OCR → send to OpenAI for structured extraction
     - For URLs: Attempt to scrape recipe (with fallback to just store link if blocked)
  3. AI confirms extracted info with user:
     > *"I see the recipe name is 'Classic Chicken Curry' and main ingredient is chicken. Is this correct?"*
  4. **Manual edit mode:** If user says "no" or "edit", allow manual corrections
  5. AI only asks for missing or uncertain fields
  6. Once confirmed, save structured data to Supabase:
     - `recipe_text`
     - `photo_url` (upload photo to Supabase Storage)
     - `source_link` (if from URL)
     - All metadata fields

**Stop and ask for confirmation before adding chat query functionality.**

---

## Phase 6: AI Chat Query Integration

**Tasks:**
- Integrate OpenAI GPT-4o-mini to handle natural-language queries
- AI converts queries → structured filters → SQL → fetches recipes
- Chat response logic:
  - If `recipe_text` exists → display full instructions + link to photo/website
  - If `recipe_text` missing → display recipe name + clickable link to `source_link`

**Example queries:**
- *"Show vegetarian Indian recipes under 30 minutes"*
- *"Find chicken recipes difficulty 3+"*
- *"Show me all recipes added by Mom"*
- *"What has Dad uploaded?"*
- *"Find all recipes with chocolate as main ingredient"*

**Stop and ask for confirmation before adding modal photo display.**

---

## Phase 7: Modal for Photo Display

**Tasks:**
- Clicking a recipe photo opens a modal overlay with full-size image
- Modal features:
  - Full-size image display
  - Close button ("X")
  - Click outside to close
  - Smooth animations

**Stop and ask for confirmation before adding favorites sidebar functionality.**

---

## Phase 8: Favorites Sidebar

**Tasks:**
- Collapsible sidebar showing saved recipes
- Each card displays:
  - Recipe name
  - Optional thumbnail photo
  - "Remove" button
- Features:
  - Add/remove recipes from favorites
  - Persist across sessions (stored in Supabase)
  - Smooth collapse/expand animation

**Stop and ask for confirmation before QA and deployment.**

---

## Phase 9: QA and Deployment

**Tasks:**
- Test full workflow:
  1. User signup/login
  2. Add recipe via photo (with OCR + manual edit if needed)
  3. Add recipe via URL (with scraping fallback)
  4. Confirm extracted info
  5. Query recipes via chat (various filters)
  6. Modal photo viewing
  7. Save/remove favorites
  8. Sidebar persistence

- Deploy to Vercel:
  - Set environment variables securely:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `OPENAI_API_KEY`
  - Test production build

**Stop and ask for final confirmation before marking project complete.**

---

## Summary

This workflow ensures:
- ✅ Smart, context-aware AI: pre-extracts info from photo/URL, confirms with user, asks only missing data
- ✅ Manual edit mode for corrections
- ✅ Conversational recipe entry with no manual forms
- ✅ Query responses return recipe text + link
- ✅ Fallback for blocked websites (just store URL)
- ✅ Simple authentication for multi-user support
- ✅ User always confirms changes, AI never edits without approval

---

## Technical Stack Summary
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** OpenAI GPT-4o-mini (chat + extraction)
- **OCR:** Tesseract.js
- **Deployment:** Vercel
- **Scraping:** node-html-parser or cheerio (with graceful fallback)

