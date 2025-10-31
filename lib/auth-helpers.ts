/**
 * Authentication Helper Functions
 * These make it easy to sign up, log in, and log out users
 */

import { createClient } from './supabase-browser';

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, displayName?: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0], // Use email username as default
      },
    },
  });

  if (error) {
    console.error('Sign up error:', error.message);
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error.message);
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error.message);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Get the current logged-in user
 */
export async function getCurrentUser() {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    // This is normal when user is not signed in, don't log as error
    if (error.message !== 'Auth session missing!') {
      console.error('Get user error:', error.message);
    }
    return { user: null, error: error.message };
  }

  return { user, error: null };
}

/**
 * Check if a user is logged in
 */
export async function isAuthenticated() {
  const { user } = await getCurrentUser();
  return !!user;
}

