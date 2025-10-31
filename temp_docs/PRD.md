# PRD: Family Recipe AI Assistant (Smart Conversational Entry)

## 1. Product Overview

**Product Name:** Family Recipe Genie 🍳

**Goal:** Provide a family-friendly AI assistant to store, search, and manage recipes entirely via natural-language conversation. AI is context-aware: it analyzes uploaded photos or website URLs to extract information and only asks the user to confirm or fill in missing data.

**Target Users:**
- Family members cooking together
- Non-technical users wanting easy recipe lookup and management

**Platform:**
- Web application (desktop + mobile)
- Deployable via Vercel

## 2. Key Features

### 2.1 Smart Conversational Recipe Entry
- Users provide photo of cookbook page or website URL
- AI automatically extracts structured recipe information:
  - `recipe_name`, `main_ingredient`, `cuisine`, `difficulty`, `time_minutes`, `notes`, `recipe_text`
- AI confirms extracted data with the user:
  - *"I see the recipe name is 'Classic Chicken Curry' and main ingredient is chicken. Is this correct?"*
- Asks only for missing or uncertain fields
- Structured data is stored in the database automatically with `user_id` (recipe owner)
- Chat conversation remains interactive and natural

### 2.2 Cookbook Photo Upload + AI Extraction
- Upload images of cookbook pages
- AI/OCR extracts recipe text (title, ingredients, instructions)
- Pre-fills metadata fields
- Confirms extracted information with the user
- Stores text in `recipe_text` and photo in `photo_url`

### 2.3 Website Recipes
- User provides a recipe website URL
- AI attempts to extract instructions and metadata
- Confirms any extracted info with the user
- Stores `recipe_text` if extracted; otherwise, stores only `source_link`

### 2.4 AI Chat Query
- Free AI model interprets natural language queries → SQL → fetches recipes
- Responses:
  - If `recipe_text` exists → display instructions + link to photo/website
  - If `recipe_text` missing → display recipe name + clickable link
- Example queries:
  - *"Show vegetarian Indian recipes under 30 minutes"*
  - *"Find chicken recipes difficulty 3+"*
  - *"Find all recipes with chocolate as main ingredient"*
  - *"Show me all recipes added by Mom"*
  - *"What recipes has Dad uploaded?"*

### 2.5 Favorites Sidebar
- Collapsible sidebar showing saved recipes
- Displays recipe name + optional photo thumbnail + recipe owner
- Remove favorites, persist across sessions

### 2.6 Recipe Attribution
- Every recipe is associated with the user who added it (`user_id`)
- Recipe cards display who uploaded the recipe (e.g., "Added by Mom")
- Users can search and filter recipes by family member
- Enables personal recipe collections within the family

## 3. Technical Requirements

### 3.1 Backend
**Database:** Supabase
- `recipes` table: stores `recipe_text`, `photo_url`, `source_link`, `user_id` (recipe owner), metadata
- `favorites` table
- `users` table: stores user profile info (name, email) for attribution

**Functions:**
- `addRecipe(data, user_id)`
- `searchRecipes(filters)` - supports filtering by `user_id`
- `sortRecipes(field)`
- `getAllRecipes()`
- `getRecipesByUser(user_id)`
- `addFavorite(recipe_id, user_id)`
- `getFavorites(user_id)`

### 3.2 AI/OCR
**Free AI model + Tesseract.js**

**Responsibilities:**
- Extract structured recipe info from photos
- Extract recipe instructions from websites if allowed
- Drive smart conversational recipe entry: confirm extracted data, only ask missing info
- Pre-fill structured fields in DB (`recipe_text`, metadata, photo/url)

### 3.3 Frontend
**Framework:** Next.js + TypeScript

**Components:**
- Chat interface (main interaction mode)
- Recipe cards for query results
- Favorites sidebar
- Modal overlay for photo viewing (optional)

**UX:**
- Conversational recipe creation
- Chat returns recipe text + clickable link
- Smart confirmation: AI only asks for missing/uncertain fields
- Clean, responsive, family-friendly

## 4. User Stories

| # | As a... | I want... | So that... |
|---|---------|-----------|------------|
| 1 | Family member | Provide a photo or website URL | AI extracts recipe info automatically |
| 2 | Family member | Confirm extracted recipe info | AI only asks for missing/uncertain fields |
| 3 | Family member | Query recipes via chat | I get recipe text if available, plus link to photo/website |
| 4 | Family member | Save recipes to favorites | I can quickly access commonly used recipes |
| 5 | Family member | See chat results cleanly | Recipe instructions are readable; photos/links optional |
| 6 | Family member | Search for recipes by family member | I can find "Mom's recipes" or "Dad's recipes" |
| 7 | Family member | See who added each recipe | I know which family member shared it |

## 5. Success Metrics
- Users can add recipes entirely via conversation
- AI correctly extracts ≥90% of recipe text from photos and allowed websites
- Chat displays text when available, otherwise clickable link
- Favorites persist across sessions
- Users report AI workflow feels smart and efficient

## 6. Deployment & Hosting
- **Frontend:** Vercel
- **Backend:** Supabase
- Environment variables for Supabase and AI model config

---

*This version now includes smart prefill + confirmation, which makes the conversational AI efficient, intelligent, and user-friendly.*

