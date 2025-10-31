/**
 * Chat API Route
 * Handles AI chat interactions for recipe queries and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI, parseNaturalLanguageQuery } from '@/lib/openai-client';
import { searchRecipes, getAllRecipes } from '@/lib/recipes';
import { findUserByDisplayName } from '@/lib/profiles';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, pendingRecipe, lastRecipes } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if message contains a URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex);
    
    if (urls && urls.length > 0) {
      return await handleUrlSubmission(urls[0], message);
    }

    // Check if user is pasting recipe text directly (contains ingredients/cooking words)
    const recipeKeywords = ['ingredient', 'cup', 'tablespoon', 'teaspoon', 'boil', 'bake', 'cook', 'mix', 'sauté', 'simmer', 'chop', 'dice', 'serves', 'servings'];
    const hasRecipeKeywords = recipeKeywords.some(keyword => message.toLowerCase().includes(keyword));
    const isLongText = message.split(/\s+/).length > 15; // More than 15 words
    
    if (hasRecipeKeywords && isLongText) {
      return await handleTextRecipe(message, pendingRecipe);
    }

    // Parse the natural language query
    const { filters, error: parseError } = await parseNaturalLanguageQuery(message);
    
    console.log('🔍 Query Parser Result:', { message, filters, parseError, lastRecipes: lastRecipes?.length });

    if (parseError) {
      // If parsing failed, just have a general conversation
      console.log('❌ Parse error, going to general chat');
      return await handleGeneralChat(message, conversationHistory || [], pendingRecipe, lastRecipes);
    }

    // Check if this is a recipe search query
    // Only treat as search if we got valid filters with actual meaningful values
    const hasValidFilters = filters && 
      Object.keys(filters).filter(key => key !== 'error').length > 0 && 
      Object.entries(filters)
        .filter(([key]) => key !== 'error')
        .some(([_, value]) => {
          // Check if value is meaningful (not null, undefined, empty string, or 0)
          if (value === null || value === undefined || value === '') return false;
          if (typeof value === 'number' && value === 0) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          return true;
        });
    
    console.log('🔎 Has valid filters?', hasValidFilters, 'Filters:', JSON.stringify(filters));
    
    if (hasValidFilters) {
      console.log('✅ Going to recipe search');
      return await handleRecipeSearch(message, filters);
    }

    // Otherwise, have a general conversation
    console.log('💬 Going to general chat with lastRecipes:', lastRecipes?.map((r: any) => ({ name: r.recipe_name, hasText: !!r.recipe_text })));
    
    // DEBUG MODE: If message is "debug yes", show debug info in the response
    if (message.toLowerCase().trim() === 'debug yes') {
      const debugInfo = {
        filters: JSON.stringify(filters),
        hasValidFilters,
        lastRecipesCount: lastRecipes?.length || 0,
        lastRecipes: lastRecipes?.map((r: any) => ({
          name: r.recipe_name,
          hasRecipeText: !!r.recipe_text,
          recipeTextLength: r.recipe_text?.length || 0,
          hasSourceLink: !!r.source_link,
        })),
      };
      
      return NextResponse.json({
        response: `DEBUG INFO:\n\n${JSON.stringify(debugInfo, null, 2)}\n\nThis shows me what data I have access to.`,
        debug: debugInfo,
      });
    }
    
    return await handleGeneralChat(message, conversationHistory || [], pendingRecipe, lastRecipes);
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle direct text recipe submission
 */
async function handleTextRecipe(recipeText: string, pendingRecipe?: any) {
  try {
    const { extractRecipeData } = await import('@/lib/openai-client');
    
    console.log('Extracting recipe from text...');
    const { data: recipeData, error: extractError } = await extractRecipeData(recipeText);

    if (extractError || !recipeData) {
      return NextResponse.json({
        response: "I tried to extract the recipe but had trouble understanding it. Could you paste it again or try uploading a photo instead?",
      });
    }

    // Preserve source_link from pendingRecipe if it exists (user correcting a previous URL extraction)
    if (pendingRecipe?.source_link && !recipeData.source_link) {
      recipeData.source_link = pendingRecipe.source_link;
      console.log('✅ Preserved source_link from pendingRecipe:', recipeData.source_link);
    }

    let responseText = `Got it ✅ Here's the recipe I extracted:\n\n`;
    responseText += `**${recipeData.recipe_name || 'Recipe'}**\n\n`;
    
    if (recipeData.main_ingredient) responseText += `Main Ingredient: ${recipeData.main_ingredient}\n`;
    if (recipeData.cuisine) responseText += `Cuisine: ${recipeData.cuisine}\n`;
    if (recipeData.difficulty) responseText += `Difficulty: ${recipeData.difficulty}/5\n`;
    if (recipeData.time_minutes) responseText += `Time: ${recipeData.time_minutes} minutes\n`;
    if (recipeData.source_link) responseText += `Source: ${recipeData.source_link}\n`;
    
    // Show the full recipe text
    if (recipeData.recipe_text && recipeData.recipe_text.length > 0) {
      responseText += `\n---\n\n${recipeData.recipe_text}\n\n---\n`;
    }
    
    responseText += `\nReply "save recipe" or "yes" to add it to your collection!`;

    return NextResponse.json({
      response: responseText,
      recipeData,
    });
  } catch (error: any) {
    console.error('Text recipe processing error:', error);
    return NextResponse.json({
      response: 'Sorry, I encountered an error processing that recipe text. Please try again!',
    });
  }
}

/**
 * Handle URL submission for recipe extraction
 */
async function handleUrlSubmission(url: string, userMessage: string) {
  try {
    // Call the scrape-url API internally
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/scrape-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({
        response: `I tried to extract the recipe from that URL, but encountered an error: ${data.error}\n\nThe website might be blocking automated access. You can still save the link manually!`,
      });
    }

    const { recipeData, partialSuccess } = data;
    let responseText = '';
    
    if (partialSuccess) {
      // Could not extract full recipe, but saved the URL
      responseText = `I got the recipe link and basic info, but couldn't extract the full ingredients and instructions (the website is blocking automatic extraction).\n\n`;
      responseText += `**${recipeData.recipe_name || 'Recipe'}**\n\n`;
      if (recipeData.main_ingredient) responseText += `Main Ingredient: ${recipeData.main_ingredient}\n`;
      if (recipeData.cuisine) responseText += `Cuisine: ${recipeData.cuisine}\n`;
      if (recipeData.difficulty) responseText += `Difficulty: ${recipeData.difficulty}/5\n`;
      responseText += `\nSource: ${url}\n\n`;
      responseText += `⚠️ I only got the basic info - you'll need to click the link to see the full recipe.\n\n`;
      responseText += `Reply "save recipe" to save the link, or open the URL and copy/paste the recipe text for full extraction.`;
    } else {
      // Successfully extracted recipe - SHOW FULL CONTENT
      responseText = `✅ Extracted recipe from website! Here's what I got:\n\n`;
      responseText += `**${recipeData.recipe_name || 'Recipe'}**\n\n`;
      
      if (recipeData.main_ingredient) responseText += `Main Ingredient: ${recipeData.main_ingredient}\n`;
      if (recipeData.cuisine) responseText += `Cuisine: ${recipeData.cuisine}\n`;
      if (recipeData.difficulty) responseText += `Difficulty: ${recipeData.difficulty}/5\n`;
      if (recipeData.time_minutes) responseText += `Time: ${recipeData.time_minutes} minutes\n`;
      
      // Show the full recipe text if available
      if (recipeData.recipe_text && recipeData.recipe_text.length > 0) {
        responseText += `\n---\n\n${recipeData.recipe_text}\n\n---\n`;
      }
      
      responseText += `\nSource: ${url}\n\n`;
      responseText += `Reply "save recipe" to add it to your collection, or tell me what needs to be changed!`;
    }

    return NextResponse.json({
      response: responseText,
      recipeData,
    });
  } catch (error: any) {
    console.error('URL processing error:', error);
    return NextResponse.json({
      response: 'Sorry, I encountered an error processing that URL. Please try again or paste a different recipe link!',
    });
  }
}

/**
 * Handle recipe search queries
 */
async function handleRecipeSearch(userMessage: string, filters: any) {
  try {
    // If searching for ALL recipes, use getAllRecipes
    if (filters.search_all) {
      const { recipes, error } = await getAllRecipes();
      
      if (error) {
        return NextResponse.json({
          response: `I encountered an error searching for recipes: ${error}`,
          recipes: [],
        });
      }

      // Format response
      let responseText = '';
      
      if (recipes.length === 0) {
        responseText = "You don't have any recipes saved yet! Try adding one by uploading a photo, pasting a URL, or typing recipe text.";
      } else {
        responseText = `You have ${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'} saved!\n\n`;
        
        recipes.slice(0, 5).forEach((recipe: any, index: number) => {
          responseText += `${index + 1}. **${recipe.recipe_name}**\n`;
          if (recipe.main_ingredient) {
            responseText += `   Main ingredient: ${recipe.main_ingredient}\n`;
          }
          if (recipe.time_minutes) {
            responseText += `   Time: ${recipe.time_minutes} minutes\n`;
          }
          responseText += '\n';
        });

        if (recipes.length > 5) {
          responseText += `...and ${recipes.length - 5} more! Click "Browse Recipes" to see all of them.\n\n`;
        } else {
          responseText += `Click "Browse Recipes" to see them all!\n\n`;
        }
        
        // Ask if they want to see full instructions
        responseText += `Want me to show you the full instructions and ingredients for any of these? Just ask!`;
      }

      return NextResponse.json({
        response: responseText,
        recipes: recipes,
      });
    }

    // If searching by user name, find the user first
    let searchFilters = { ...filters };
    
    if (filters.user_name) {
      const { profiles } = await findUserByDisplayName(filters.user_name);
      if (profiles && profiles.length > 0) {
        searchFilters.user_id = profiles[0].id;
      }
      delete searchFilters.user_name;
    }

    // Remove search_all from filters
    delete searchFilters.search_all;

    // Search recipes
    const { recipes, error } = await searchRecipes(searchFilters);

    if (error) {
      return NextResponse.json({
        response: `I encountered an error searching for recipes: ${error}`,
        recipes: [],
      });
    }

    // Format response
    let responseText = '';
    
    if (recipes.length === 0) {
      responseText = "I couldn't find any recipes matching your criteria. Try adjusting your search or add some recipes first!";
    } else {
      responseText = `I found ${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'} for you!\n\n`;
      
      recipes.slice(0, 5).forEach((recipe: any, index: number) => {
        responseText += `${index + 1}. **${recipe.recipe_name}**\n`;
        if (recipe.profiles?.display_name) {
          responseText += `   Added by ${recipe.profiles.display_name}\n`;
        }
        if (recipe.main_ingredient) {
          responseText += `   Main ingredient: ${recipe.main_ingredient}\n`;
        }
        if (recipe.time_minutes) {
          responseText += `   Time: ${recipe.time_minutes} minutes\n`;
        }
        responseText += '\n';
      });

      if (recipes.length > 5) {
        responseText += `...and ${recipes.length - 5} more! Click "Browse Recipes" to see all results.\n\n`;
      }
      
      // Ask if they want to see full instructions
      responseText += `\nWant me to show you the full instructions and ingredients? Just ask!`;
    }

    return NextResponse.json({
      response: responseText,
      recipes: recipes,
      filters: searchFilters,
    });
  } catch (error: any) {
    console.error('Recipe search error:', error);
    return NextResponse.json({
      response: 'Sorry, I encountered an error while searching for recipes.',
      recipes: [],
    });
  }
}

/**
 * Handle general chat (not a recipe search)
 */
async function handleGeneralChat(userMessage: string, conversationHistory: any[], pendingRecipe?: any, lastRecipes?: any[]) {
  // Build context about pending recipe if exists
  let recipeContext = '';
  if (pendingRecipe) {
    recipeContext = `\n\n**CURRENT CONTEXT**: The user just shared a recipe that's pending save:
- Recipe Name: ${pendingRecipe.recipe_name || 'Unknown'}
- Main Ingredient: ${pendingRecipe.main_ingredient || 'Unknown'}
- Cuisine: ${pendingRecipe.cuisine || 'Unknown'}
- Difficulty: ${pendingRecipe.difficulty || 'Unknown'}/5
- Time: ${pendingRecipe.time_minutes || 'Unknown'} minutes
- Notes: ${pendingRecipe.notes || 'None'}

**FULL RECIPE TEXT:**
${pendingRecipe.recipe_text || '⚠️ Full recipe text NOT available - only basic metadata was extracted. The website blocked automatic extraction.'}

**IMPORTANT**: 
- If they ask about "the recipe I just shared", refer to THIS recipe by name!
- If they ask "did you get the instructions" or "show me what you extracted":
  * If recipe_text exists: Show the FULL RECIPE TEXT!
  * If recipe_text is missing/null: Tell them "I only got the basic info (name, cuisine, etc.) but couldn't extract the full ingredients and instructions. The website blocked automatic extraction. You can click the source link to view the full recipe, or copy/paste the recipe text for full extraction."
- If they ask for ingredients or instructions specifically and recipe_text is missing, be honest that you don't have that detail!`;
  }

  // Build context about recently shown recipes from search results
  if (lastRecipes && lastRecipes.length > 0) {
    recipeContext += `\n\n**RECENTLY SHOWN RECIPES**: The user just searched and I showed them these recipes:\n`;
    lastRecipes.slice(0, 3).forEach((recipe: any, index: number) => {
      recipeContext += `\n${index + 1}. **${recipe.recipe_name}**\n`;
      if (recipe.main_ingredient) recipeContext += `   - Main Ingredient: ${recipe.main_ingredient}\n`;
      if (recipe.cuisine) recipeContext += `   - Cuisine: ${recipe.cuisine}\n`;
      if (recipe.time_minutes) recipeContext += `   - Time: ${recipe.time_minutes} minutes\n`;
      
      // Check if we have full recipe text
      if (recipe.recipe_text && recipe.recipe_text.trim().length > 0) {
        recipeContext += `   - ✅ HAS FULL RECIPE TEXT (${recipe.recipe_text.length} chars)\n`;
        recipeContext += `   - Full Recipe Preview:\n${recipe.recipe_text.substring(0, 800)}\n`;
      } else {
        recipeContext += `   - ❌ NO FULL RECIPE TEXT - only basic metadata saved\n`;
      }
      
      if (recipe.source_link) {
        recipeContext += `   - Source Link: ${recipe.source_link}\n`;
      }
    });
    
    recipeContext += `\n**CRITICAL INSTRUCTIONS FOR SHOWING RECIPES**:
- If user asks for "instructions", "ingredients", "recipe", or says "yes" after I offered to show details:
  * CHECK if recipe_text exists and has content (marked with ✅ above)
  * If ✅ YES: Show the FULL recipe_text with proper formatting
  * If ❌ NO: Tell them "I don't have the full recipe saved - only basic info (name, ingredient, cuisine). The website blocked the extraction when it was added. You can view the full recipe at [source_link] or ask me to re-add it if you paste the recipe text!"
- DO NOT say "here's the recipe" if recipe_text is missing or empty!
- BE HONEST about what data I have vs. don't have!`;
  }

  const systemPrompt = `You are Family Recipe Genie, a friendly AI assistant that helps families save and manage recipes. You're smart, conversational, and handle messy inputs gracefully.${recipeContext}

## CORE BEHAVIORS

**REMEMBER CONTEXT**: Pay attention to conversation history and pending recipes. If user asks "what recipe did I just share?" or "what was that recipe?", refer to the pending recipe details or recent conversation!

**ASK ONE QUESTION RULE**: When clarifying, ask ONE thing at a time. Don't overwhelm users.

**BE ENCOURAGING**: Use ✅ checkmarks, friendly tone, casual language. Say "Got it", "Perfect", "Great".

**HANDLE MESSY INPUT**: Clean up blog fluff, voice-style text, casual descriptions. Extract the recipe cleanly.

## EXAMPLE INTERACTIONS

### Case: User pastes recipe ingredients only
User: "chicken, soy sauce, honey, garlic"
You: "Got it ✅ Those are great ingredients! Want me to save this as a quick recipe, or would you like to add cooking steps first?"

### Case: User asks to save but gives no input
User: "save this"
You: "Sure! Send me the recipe — you can:
• Paste recipe text
• Share a URL from any cooking site
• Upload a photo (click 📸)"

### Case: Missing details
User: (pastes recipe without servings or time)
You: "Recipe extracted ✅ I didn't catch the servings or cook time — want to add those, or should I save it as-is?"

### Case: Link doesn't work
User: (invalid URL)
You: "That link didn't work — could you try a different link, or upload a screenshot of the recipe instead?"

### Case: Two recipes at once
User: "pasta: olive oil garlic ... and also salad: lettuce tomato ..."
You: "I see two recipes here ✅ Want me to save both separately?"

### Case: Correction needed
User: "I said Thai basil, not sweet basil"
You: "Sorry about that — corrected ✅ Using Thai basil now. Ready to save?"

### Case: User wants substitutions
User: "save but swap butter with ghee"
You: "Perfect ✅ I'll swap butter for ghee in the recipe. Confirm to save?"

### Case: Search request
User: "show my vegan recipes"
You: "Let me search your collection for vegan recipes..."

### Case: Messy blog text
User: (pastes long blog story with recipe buried inside)
You: "Got it — cleaned up the blog text ✅ Here's the recipe: [recipe details]. Save it?"

### Case: User asks about pending recipe
User: "What recipe did I just share with you?"
You: "You just shared **Garlic Spaghetti** — an Italian recipe with spaghetti as the main ingredient, about 20 minutes to make. Ready to save it?"

### Case: User asks if you got specific details (FULL extraction success)
User: "Did you get the instructions?" or "Did it have ingredients?"
You: "Yes! Here's what I extracted:

**Garlic Spaghetti**

**Ingredients:**
- Spaghetti
- Olive oil
- Garlic

**Instructions:**
1. Boil spaghetti
2. Sauté garlic in olive oil
3. Mix together

Ready to save?"

### Case: User asks for details but only partial extraction (website blocked)
User: "Did you get the instructions?" or "What did you extract?"
You: "I only got the basic info (recipe name, cuisine, main ingredient) but couldn't extract the full ingredients and instructions. The website blocked automatic extraction. 

I saved:
- Recipe: **Pad Kra Pao Chicken**
- Cuisine: Thai
- Main Ingredient: chicken

⚠️ Click the source link to view the full recipe on the original site, or you can copy/paste the recipe text here for full extraction!

Still want to save the link?"

### Case: User asks to show what was extracted
User: "Show me what you got" or "What did it say?"
You: (Show the full recipe_text from pending recipe, formatted nicely)

### Case: User asks to modify pending recipe
User: "Change the time to 30 minutes"
You: "Got it ✅ Updated the cook time to 30 minutes for your Garlic Spaghetti recipe. Ready to save now?"

### Case: User asks for instructions after seeing search results
User: (after being shown recipe list) "yes" or "show me the instructions" or "what are the ingredients"
You: (If recipe_text exists for the first recipe shown)
"Here's the full recipe for **Pad Kra Pao Chicken**:

[Full recipe_text with ingredients and instructions]

Want to see another one?"

You: (If recipe_text is missing/null)
"I don't have the full instructions for **Pad Kra Pao Chicken** - only the basic info was saved. You can click 'Browse Recipes' to see the source link, or I can help you add the full recipe if you copy/paste it!"

## WHAT I CAN DO (Answer these questions clearly!)

### When user asks: "What can you do?" or "How does this work?"
You: "I help your family save and find recipes! Here's what I can do:

📸 **Save Recipes 3 Ways:**
1. Upload photos (cookbook pages, handwritten recipes, screenshots)
2. Paste website URLs (from any cooking site)
3. Type or paste recipe text directly

🔍 **Search Recipes:**
- By ingredient ("find chicken recipes")
- By family member ("show Mom's recipes")
- By cuisine, time, or difficulty
- Combine filters ("easy Italian under 30 minutes")

⭐ **Organize:**
- Favorite your go-to recipes
- Browse all recipes in card view
- See who added each recipe

Just ask me anything!"

### When user asks: "Can you do X?"

**Things I CAN do:**
✅ Extract recipes from photos (OCR)
✅ Scrape recipes from website URLs
✅ Accept pasted recipe text
✅ Clean up messy blog text
✅ Handle ingredients-only lists
✅ Search by ingredient, cuisine, time, difficulty, family member
✅ Save recipes to your family collection
✅ Show who added each recipe
✅ Answer cooking questions

**Things I CANNOT do (yet):**
❌ Edit saved recipes (coming soon!)
❌ Delete recipes from chat (use Browse tab)
❌ Suggest recipes based on ingredients you have (future feature)
❌ Calculate nutrition info (future feature)
❌ Create shopping lists (future feature)
❌ Meal planning (future feature)

## HOW TO ADD RECIPES

**Photo Upload**: Click 📸 camera icon — works with cookbook pages, handwritten recipes, screenshots

**Website URL**: Paste any recipe link from sites like AllRecipes, Food Network, TikTok, Instagram, YouTube (I'll extract from captions/descriptions)

**Text**: Just paste or type the recipe — I'll clean it up

## SEARCH & RETRIEVAL

Users can search by:
- Ingredient ("find chicken recipes")
- Family member ("show Mom's recipes")
- Cuisine, time, difficulty
- Multiple filters ("easy Italian under 30 minutes")

## TONE & STYLE

✅ Casual, friendly, encouraging
✅ Use emojis sparingly (✅, 📸, 👇)
✅ Keep responses concise
✅ Confirm actions clearly
✅ Guide users step-by-step when confused

## COMMON QUESTIONS & ANSWERS

**Q: "Can you edit recipes?"**
A: "Not yet from chat, but that's coming soon! For now, you can delete and re-add recipes if needed."

**Q: "Can you suggest recipes I can make with what I have?"**
A: "That's a great idea! I can't do that yet, but it's on the roadmap. For now, search by ingredient and see what you can make!"

**Q: "Does this work on mobile?"**
A: "Yes! The interface works great on phones and tablets. Upload photos, paste links, and search recipes anywhere!"

**Q: "How do I delete a recipe?"**
A: "Currently, recipes can only be deleted by the person who added them, and it's done from the Browse Recipes view (not in chat yet)."

**Q: "Can I share recipes with others?"**
A: "All recipes are visible to everyone in your family account! Anyone can view, search, and favorite them. Only the person who uploaded can edit/delete (future feature)."

**Q: "What websites work for scraping?"**
A: "Most recipe sites work great: AllRecipes, Food Network, Bon Appétit, food blogs with Schema.org markup. Some sites with paywalls or heavy bot-blocking might only save the link."

**Q: "Can you convert measurements?"**
A: "Not automatically yet, but it's on the roadmap! For now, save recipes as they are."

**Q: "Do you save photos?"**
A: "Yes! Photos from cookbook uploads can be saved with the recipe (feature in development). Website recipe images are linked but not stored locally."

## EDGE CASES

- If extraction fails → offer alternatives
- If info is missing → ask if they want to add it OR save as-is
- If user is unsure → suggest specific next steps
- If correction needed → acknowledge and fix immediately
- If they ask about missing features → be honest it's coming soon

Remember: You're helpful, smart, and make recipe saving EASY. Handle messy inputs gracefully, answer ALL questions about functionality clearly, and guide users to success! 🧞‍♂️`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory.map((msg: any) => ({
      role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const { response, error } = await chatWithAI(messages);

  if (error) {
    console.error('💬 OpenAI chat error:', error);
    
    // Check if it's a rate limit error
    if (error.includes('rate') || error.includes('limit') || error.includes('429')) {
      return NextResponse.json({
        response: "⏱️ I'm getting too many requests right now (OpenAI rate limit). Please wait a moment and try again!",
      });
    }
    
    return NextResponse.json({
      response: `I'm having trouble thinking right now: ${error}\n\nPlease try again in a moment!`,
    });
  }

  return NextResponse.json({
    response: response || "I'm not sure how to respond to that.",
  });
}

