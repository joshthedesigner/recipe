/**
 * Storage Functions for Recipe Photos
 * Handle uploading, deleting, and getting photo URLs
 */

'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'recipe-photos';

/**
 * Upload a recipe photo to Supabase storage
 * @param file - The image file (as base64 or File object)
 * @param userId - The user uploading the photo
 * @param recipeId - Optional recipe ID to associate with
 * @returns The public URL of the uploaded photo or an error
 */
export async function uploadRecipePhoto(
  fileData: {
    base64: string;
    fileName: string;
    contentType: string;
  },
  userId: string,
  recipeId?: string
) {
  try {
    // Generate a unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = fileData.fileName.split('.').pop();
    const fileName = `${userId}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert base64 to buffer
    const base64Data = fileData.base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: fileData.contentType,
        upsert: false,
      });

    if (error) {
      console.error('Error uploading photo:', error);
      return { url: null, path: null, error: error.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      error: null,
    };
  } catch (err) {
    console.error('Unexpected error uploading photo:', err);
    return { url: null, path: null, error: 'Failed to upload photo' };
  }
}

/**
 * Delete a recipe photo from storage
 * @param filePath - The path to the file in storage
 * @param userId - The user deleting the photo (must be owner)
 * @returns Success status or an error
 */
export async function deleteRecipePhoto(filePath: string, userId: string) {
  try {
    // Check if the file belongs to the user (path starts with userId)
    if (!filePath.startsWith(`${userId}/`)) {
      return { success: false, error: 'You can only delete your own photos' };
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting photo:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error deleting photo:', err);
    return { success: false, error: 'Failed to delete photo' };
  }
}

/**
 * Get the public URL for a photo
 * @param filePath - The path to the file in storage
 * @returns The public URL
 */
export async function getPhotoUrl(filePath: string) {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * List all photos for a user
 * @param userId - The user whose photos to list
 * @returns Array of file paths or an error
 */
export async function listUserPhotos(userId: string) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(userId);

    if (error) {
      console.error('Error listing photos:', error);
      return { files: [], error: error.message };
    }

    return { files: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error listing photos:', err);
    return { files: [], error: 'Failed to list photos' };
  }
}

