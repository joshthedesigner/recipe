/**
 * Save Recipe API Route
 * Saves extracted recipe data to the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { addRecipe } from '@/lib/recipes';
import { uploadRecipePhoto } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { recipeData, userId, photoBase64 } = await request.json();

    if (!recipeData || !userId) {
      return NextResponse.json(
        { error: 'Recipe data and user ID are required' },
        { status: 400 }
      );
    }

    let photoUrl = recipeData.photo_url;

    // Upload photo if provided
    if (photoBase64 && !photoUrl) {
      const uploadResult = await uploadRecipePhoto(
        {
          base64: photoBase64,
          fileName: `recipe-${Date.now()}.jpg`,
          contentType: 'image/jpeg',
        },
        userId
      );

      if (uploadResult.url) {
        photoUrl = uploadResult.url;
      }
    }

    // Save recipe to database
    const { recipe, error } = await addRecipe(
      {
        recipe_name: recipeData.recipe_name,
        main_ingredient: recipeData.main_ingredient,
        cuisine: recipeData.cuisine,
        difficulty: recipeData.difficulty,
        time_minutes: recipeData.time_minutes,
        notes: recipeData.notes,
        recipe_text: recipeData.recipe_text,
        photo_url: photoUrl,
        source_link: recipeData.source_link,
      },
      userId
    );

    if (error) {
      return NextResponse.json(
        { error: `Failed to save recipe: ${error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recipe,
      message: 'Recipe saved successfully!',
    });
  } catch (error: any) {
    console.error('Save recipe error:', error);
    return NextResponse.json(
      { error: 'Failed to save recipe: ' + error.message },
      { status: 500 }
    );
  }
}



