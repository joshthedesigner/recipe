/**
 * Favorites Management Functions
 * Handle adding, removing, and fetching favorite recipes
 */

'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Add a recipe to user's favorites
 * @param recipeId - The recipe to favorite
 * @param userId - The user adding the favorite
 * @returns Success status or an error
 */
export async function addFavorite(recipeId: string, userId: string) {
  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return { success: true, error: null, message: 'Already favorited' };
    }

    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert([
        {
          recipe_id: recipeId,
          user_id: userId,
        },
      ]);

    if (error) {
      console.error('Error adding favorite:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error adding favorite:', err);
    return { success: false, error: 'Failed to add favorite' };
  }
}

/**
 * Remove a recipe from user's favorites
 * @param recipeId - The recipe to unfavorite
 * @param userId - The user removing the favorite
 * @returns Success status or an error
 */
export async function removeFavorite(recipeId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing favorite:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error removing favorite:', err);
    return { success: false, error: 'Failed to remove favorite' };
  }
}

/**
 * Get all favorite recipes for a user
 * Includes full recipe details and who added each recipe
 * @param userId - The user whose favorites to fetch
 * @returns Array of favorite recipes or an error
 */
export async function getFavorites(userId: string) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        recipe_id,
        created_at,
        recipes (
          *,
          profiles!recipes_user_id_fkey (
            display_name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting favorites:', error);
      return { favorites: [], error: error.message };
    }

    // Transform the data to flatten the recipe information
    const favorites = data?.map((fav: any) => ({
      favorite_id: fav.recipe_id,
      favorited_at: fav.created_at,
      ...fav.recipes,
    })) || [];

    return { favorites, error: null };
  } catch (err) {
    console.error('Unexpected error getting favorites:', err);
    return { favorites: [], error: 'Failed to get favorites' };
  }
}

/**
 * Check if a recipe is favorited by a user
 * @param recipeId - The recipe to check
 * @param userId - The user to check for
 * @returns Boolean indicating if favorited
 */
export async function isFavorited(recipeId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      console.error('Error checking favorite status:', error);
      return { isFavorited: false, error: error.message };
    }

    return { isFavorited: !!data, error: null };
  } catch (err) {
    console.error('Unexpected error checking favorite status:', err);
    return { isFavorited: false, error: 'Failed to check favorite status' };
  }
}

/**
 * Get count of how many users have favorited a recipe
 * @param recipeId - The recipe to count favorites for
 * @returns Count of favorites or an error
 */
export async function getFavoriteCount(recipeId: string) {
  try {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('recipe_id', recipeId);

    if (error) {
      console.error('Error getting favorite count:', error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error('Unexpected error getting favorite count:', err);
    return { count: 0, error: 'Failed to get favorite count' };
  }
}



