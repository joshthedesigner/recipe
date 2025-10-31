/**
 * Supabase Client Configuration
 * This creates a connection to your Supabase database
 */

import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and API key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create and export the Supabase client
// This is what we'll use throughout the app to interact with the database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Recipe = {
  id: string;
  user_id: string;
  recipe_name: string;
  main_ingredient: string | null;
  cuisine: string | null;
  difficulty: number | null;
  time_minutes: number | null;
  notes: string | null;
  recipe_text: string | null;
  photo_url: string | null;
  source_link: string | null;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
};



