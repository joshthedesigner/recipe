/**
 * Test Supabase Connection
 * Quick script to verify database setup
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function testConnection() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test 1: Check if we can connect
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('count');
    
    if (recipesError) {
      console.error('❌ Recipes table error:', recipesError.message);
      return false;
    }
    
    // Test 2: Check favorites table
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('count');
    
    if (favoritesError) {
      console.error('❌ Favorites table error:', favoritesError.message);
      return false;
    }
    
    // Test 3: Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count');
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      return false;
    }
    
    console.log('✅ All tables connected successfully!');
    console.log('✅ Recipes table: OK');
    console.log('✅ Favorites table: OK');
    console.log('✅ Profiles table: OK');
    
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error);
    return false;
  }
}



