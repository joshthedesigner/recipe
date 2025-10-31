/**
 * Recipe Management Functions
 * These functions handle all recipe operations: add, update, delete, search, filter
 */

'use server';

import { createClient } from './supabase-server';
import { Recipe } from './supabase';

/**
 * Add a new recipe to the database
 * @param recipeData - The recipe information
 * @param userId - The ID of the user adding the recipe
 * @returns The created recipe or an error
 */
export async function addRecipe(
  recipeData: {
    recipe_name: string;
    main_ingredient?: string;
    cuisine?: string;
    difficulty?: number;
    time_minutes?: number;
    notes?: string;
    recipe_text?: string;
    photo_url?: string;
    source_link?: string;
  },
  userId: string
) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          ...recipeData,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding recipe:', error);
      return { recipe: null, error: error.message };
    }

    return { recipe: data, error: null };
  } catch (err) {
    console.error('Unexpected error adding recipe:', err);
    return { recipe: null, error: 'Failed to add recipe' };
  }
}

/**
 * Get a single recipe by ID
 * @param recipeId - The recipe ID
 * @returns The recipe with user profile info or an error
 */
export async function getRecipeById(recipeId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (error) {
      console.error('Error getting recipe:', error);
      return { recipe: null, error: error.message };
    }

    return { recipe: data, error: null };
  } catch (err) {
    console.error('Unexpected error getting recipe:', err);
    return { recipe: null, error: 'Failed to get recipe' };
  }
}

/**
 * Get all recipes from the database
 * Includes the display name of who added each recipe
 * @returns Array of recipes or an error
 */
export async function getAllRecipes() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting recipes:', error);
      return { recipes: [], error: error.message };
    }

    return { recipes: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error getting recipes:', err);
    return { recipes: [], error: 'Failed to get recipes' };
  }
}

/**
 * Get all recipes by a specific user (family member)
 * Example: Get all of "Mom's recipes"
 * @param userId - The user ID to filter by
 * @returns Array of recipes by that user or an error
 */
export async function getRecipesByUser(userId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting recipes by user:', error);
      return { recipes: [], error: error.message };
    }

    return { recipes: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error getting recipes by user:', err);
    return { recipes: [], error: 'Failed to get recipes by user' };
  }
}

/**
 * Search recipes with filters
 * @param filters - Object with optional filter criteria
 * @returns Filtered recipes or an error
 */
export async function searchRecipes(filters: {
  main_ingredient?: string;
  cuisine?: string;
  difficulty?: number;
  max_time?: number;
  user_id?: string;
  search_term?: string;
}) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('recipes')
      .select('*');

    // Apply filters
    if (filters.main_ingredient) {
      query = query.ilike('main_ingredient', `%${filters.main_ingredient}%`);
    }

    if (filters.cuisine) {
      query = query.ilike('cuisine', `%${filters.cuisine}%`);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.max_time) {
      query = query.lte('time_minutes', filters.max_time);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    // Search in recipe name or recipe text
    if (filters.search_term) {
      query = query.or(
        `recipe_name.ilike.%${filters.search_term}%,recipe_text.ilike.%${filters.search_term}%`
      );
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching recipes:', error);
      return { recipes: [], error: error.message };
    }

    return { recipes: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error searching recipes:', err);
    return { recipes: [], error: 'Failed to search recipes' };
  }
}

/**
 * Update an existing recipe
 * @param recipeId - The recipe ID to update
 * @param userId - The user ID (must match recipe owner)
 * @param updates - The fields to update
 * @returns Updated recipe or an error
 */
export async function updateRecipe(
  recipeId: string,
  userId: string,
  updates: Partial<Recipe>
) {
  try {
    const supabase = await createClient();
    
    // First check if user owns this recipe
    const { data: existing, error: checkError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', recipeId)
      .single();

    if (checkError || !existing) {
      return { recipe: null, error: 'Recipe not found' };
    }

    if (existing.user_id !== userId) {
      return { recipe: null, error: 'You can only edit your own recipes' };
    }

    // Update the recipe
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', recipeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating recipe:', error);
      return { recipe: null, error: error.message };
    }

    return { recipe: data, error: null };
  } catch (err) {
    console.error('Unexpected error updating recipe:', err);
    return { recipe: null, error: 'Failed to update recipe' };
  }
}

/**
 * Delete a recipe
 * @param recipeId - The recipe ID to delete
 * @param userId - The user ID (must match recipe owner)
 * @returns Success status or an error
 */
export async function deleteRecipe(recipeId: string, userId: string) {
  try {
    const supabase = await createClient();
    
    // First check if user owns this recipe
    const { data: existing, error: checkError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', recipeId)
      .single();

    if (checkError || !existing) {
      return { success: false, error: 'Recipe not found' };
    }

    if (existing.user_id !== userId) {
      return { success: false, error: 'You can only delete your own recipes' };
    }

    // Delete the recipe
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId);

    if (error) {
      console.error('Error deleting recipe:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error deleting recipe:', err);
    return { success: false, error: 'Failed to delete recipe' };
  }
}

/**
 * Get recipes sorted by a specific field
 * @param sortBy - Field to sort by
 * @param ascending - Sort direction
 * @returns Sorted recipes or an error
 */
export async function sortRecipes(
  sortBy: 'recipe_name' | 'difficulty' | 'time_minutes' | 'created_at' = 'created_at',
  ascending: boolean = false
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order(sortBy, { ascending });

    if (error) {
      console.error('Error sorting recipes:', error);
      return { recipes: [], error: error.message };
    }

    return { recipes: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error sorting recipes:', err);
    return { recipes: [], error: 'Failed to sort recipes' };
  }
}

