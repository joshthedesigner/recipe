# ✅ PRD & Instructions Updated: Recipe Attribution Feature

## What Changed

I've updated both the PRD and INSTRUCTIONS to include your new feature request: **Recipe Attribution by User**.

## New Feature: Recipe Attribution (Section 2.6)

### What It Does
- Every recipe now tracks **who added it** (the `user_id` of the family member)
- Users can search for recipes by family member (e.g., "Show me Mom's recipes")
- Recipe cards display who uploaded each recipe (e.g., "Added by Mom")
- Enables personal recipe collections within the family

## Database Changes

### `recipes` table now includes:
- **`user_id`** (uuid, foreign key to auth.users) - Tracks the recipe owner

This field will be automatically set when someone adds a recipe, linking it to their user account.

## New Functionality

### 1. Search Queries
Users can now ask:
- *"Show me all recipes added by Mom"*
- *"What recipes has Dad uploaded?"*
- *"Find Mom's chicken recipes"*

### 2. Recipe Display
Recipe cards will show:
- Recipe name
- Photo thumbnail
- **Who added it** (e.g., "Added by Sarah")

### 3. Backend Functions
Added new function:
- `getRecipesByUser(user_id)` - Fetches all recipes by a specific family member

Updated existing functions:
- `addRecipe(data, user_id)` - Now requires user_id parameter
- `searchRecipes(filters)` - Now supports filtering by user_id
- `getAllRecipes()` - Returns recipes with owner information

## New User Stories

Added two new user stories to the PRD:

| # | As a... | I want... | So that... |
|---|---------|-----------|------------|
| 6 | Family member | Search for recipes by family member | I can find "Mom's recipes" or "Dad's recipes" |
| 7 | Family member | See who added each recipe | I know which family member shared it |

## Why This Is Great

This feature makes the app more **family-oriented** because:
- ✅ **Recognition** - Family members get credit for their recipes
- ✅ **Organization** - Easy to find recipes from specific family members
- ✅ **Personalization** - "Mom's famous cookies" vs "Dad's BBQ recipes"
- ✅ **History** - Track who contributes what to the family collection

## Technical Implementation (Phase 2)

When we set up Supabase in the next phase, we'll:
1. Add `user_id` field to the `recipes` table
2. Set up a foreign key relationship to `auth.users`
3. Ensure every recipe save includes the current user's ID
4. Join user data when displaying recipes to show names

---

**Status:** ✅ Documentation updated and ready for Phase 2 implementation!



