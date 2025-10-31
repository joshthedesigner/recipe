/**
 * User Profile Functions
 * Manage user display names and profile information
 */

'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get a user's profile by their user ID
 * @param userId - The user ID to look up
 * @returns User profile or an error
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      return { profile: null, error: error.message };
    }

    return { profile: data, error: null };
  } catch (err) {
    console.error('Unexpected error getting user profile:', err);
    return { profile: null, error: 'Failed to get user profile' };
  }
}

/**
 * Update a user's display name
 * @param userId - The user ID
 * @param displayName - The new display name
 * @returns Updated profile or an error
 */
export async function updateDisplayName(userId: string, displayName: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating display name:', error);
      return { profile: null, error: error.message };
    }

    return { profile: data, error: null };
  } catch (err) {
    console.error('Unexpected error updating display name:', err);
    return { profile: null, error: 'Failed to update display name' };
  }
}

/**
 * Get all user profiles (for searching recipes by family member)
 * @returns Array of all user profiles or an error
 */
export async function getAllProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error getting all profiles:', error);
      return { profiles: [], error: error.message };
    }

    return { profiles: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error getting all profiles:', err);
    return { profiles: [], error: 'Failed to get all profiles' };
  }
}

/**
 * Search for a user by display name
 * Useful for queries like "Show me Mom's recipes"
 * @param displayName - The display name to search for
 * @returns Matching user profile or an error
 */
export async function findUserByDisplayName(displayName: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('display_name', `%${displayName}%`);

    if (error) {
      console.error('Error finding user by display name:', error);
      return { profiles: [], error: error.message };
    }

    return { profiles: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error finding user by display name:', err);
    return { profiles: [], error: 'Failed to find user' };
  }
}

/**
 * Get recipe count for a user
 * @param userId - The user ID
 * @returns Count of recipes added by this user
 */
export async function getUserRecipeCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting recipe count:', error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error('Unexpected error getting recipe count:', err);
    return { count: 0, error: 'Failed to get recipe count' };
  }
}



