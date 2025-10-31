# 📚 Backend API Reference

Quick reference for all backend functions in your Family Recipe Genie app.

---

## 🍳 Recipe Functions (`lib/recipes.ts`)

### Add Recipe
```typescript
addRecipe(recipeData, userId)
```
**Parameters:**
- `recipeData` - Object with recipe info
- `userId` - Who's adding the recipe

**Returns:** `{ recipe, error }`

---

### Get All Recipes
```typescript
getAllRecipes()
```
**Returns:** `{ recipes, error }`
- Includes display name of who added each

---

### Get Recipes by User (NEW! ⭐)
```typescript
getRecipesByUser(userId)
```
**Returns:** `{ recipes, error }`
- Get all recipes by a specific family member

---

### Search Recipes
```typescript
searchRecipes(filters)
```
**Filters:**
- `main_ingredient` - Filter by ingredient
- `cuisine` - Filter by cuisine type
- `difficulty` - Filter by difficulty (1-5)
- `max_time` - Max cooking time in minutes
- `user_id` - Filter by who added it ⭐
- `search_term` - Text search

**Returns:** `{ recipes, error }`

---

### Get Recipe by ID
```typescript
getRecipeById(recipeId)
```
**Returns:** `{ recipe, error }`

---

### Update Recipe
```typescript
updateRecipe(recipeId, userId, updates)
```
**Returns:** `{ recipe, error }`
- Only owner can update

---

### Delete Recipe
```typescript
deleteRecipe(recipeId, userId)
```
**Returns:** `{ success, error }`
- Only owner can delete

---

### Sort Recipes
```typescript
sortRecipes(sortBy, ascending)
```
**sortBy options:**
- `'recipe_name'` - Alphabetical
- `'difficulty'` - By difficulty
- `'time_minutes'` - By cooking time
- `'created_at'` - By date added

**Returns:** `{ recipes, error }`

---

## ⭐ Favorites Functions (`lib/favorites.ts`)

### Add Favorite
```typescript
addFavorite(recipeId, userId)
```
**Returns:** `{ success, error }`

---

### Remove Favorite
```typescript
removeFavorite(recipeId, userId)
```
**Returns:** `{ success, error }`

---

### Get Favorites
```typescript
getFavorites(userId)
```
**Returns:** `{ favorites, error }`
- Returns full recipe details

---

### Check if Favorited
```typescript
isFavorited(recipeId, userId)
```
**Returns:** `{ isFavorited, error }`
- Returns boolean

---

### Get Favorite Count
```typescript
getFavoriteCount(recipeId)
```
**Returns:** `{ count, error }`
- See how many users favorited a recipe

---

## 📸 Storage Functions (`lib/storage.ts`)

### Upload Recipe Photo
```typescript
uploadRecipePhoto(fileData, userId, recipeId?)
```
**Parameters:**
- `fileData` - Object with `base64`, `fileName`, `contentType`
- `userId` - Who's uploading
- `recipeId` - Optional recipe association

**Returns:** `{ url, path, error }`

---

### Delete Recipe Photo
```typescript
deleteRecipePhoto(filePath, userId)
```
**Returns:** `{ success, error }`

---

### Get Photo URL
```typescript
getPhotoUrl(filePath)
```
**Returns:** Public URL string

---

### List User Photos
```typescript
listUserPhotos(userId)
```
**Returns:** `{ files, error }`

---

## 👤 Profile Functions (`lib/profiles.ts`)

### Get User Profile
```typescript
getUserProfile(userId)
```
**Returns:** `{ profile, error }`

---

### Update Display Name
```typescript
updateDisplayName(userId, displayName)
```
**Returns:** `{ profile, error }`
- Set name like "Mom", "Dad", "Sarah"

---

### Get All Profiles
```typescript
getAllProfiles()
```
**Returns:** `{ profiles, error }`
- List all family members

---

### Find User by Display Name
```typescript
findUserByDisplayName(displayName)
```
**Returns:** `{ profiles, error }`
- Search for users by name

---

### Get User Recipe Count
```typescript
getUserRecipeCount(userId)
```
**Returns:** `{ count, error }`
- Count recipes per user

---

## 🔐 Auth Functions (`lib/auth-helpers.ts`)

### Sign Up
```typescript
signUp(email, password, displayName?)
```
**Returns:** `{ user, error }`

---

### Sign In
```typescript
signIn(email, password)
```
**Returns:** `{ user, error }`

---

### Sign Out
```typescript
signOut()
```
**Returns:** `{ error }`

---

### Get Current User
```typescript
getCurrentUser()
```
**Returns:** `{ user, error }`

---

### Is Authenticated
```typescript
isAuthenticated()
```
**Returns:** Boolean

---

## 💡 Common Patterns

### Example: Add a Recipe
```typescript
const { recipe, error } = await addRecipe({
  recipe_name: "Mom's Apple Pie",
  main_ingredient: "apple",
  cuisine: "American",
  difficulty: 3,
  time_minutes: 60,
  recipe_text: "Full instructions here..."
}, userId);

if (error) {
  console.error(error);
} else {
  console.log("Recipe added!", recipe);
}
```

### Example: Search for Mom's Recipes
```typescript
// First, find Mom's user ID
const { profiles } = await findUserByDisplayName("Mom");
const momUserId = profiles[0]?.id;

// Then get her recipes
const { recipes } = await getRecipesByUser(momUserId);
```

### Example: Get All Italian Recipes Under 30 Minutes
```typescript
const { recipes } = await searchRecipes({
  cuisine: "Italian",
  max_time: 30
});
```

---

## 🎯 Return Format

All functions return a consistent format:

**Success:**
```typescript
{ data: {...}, error: null }
```

**Error:**
```typescript
{ data: null, error: "Error message" }
```

Always check for `error` first!

---

**This reference covers all backend functions available in your app!** 📖



