/**
 * OpenAI Client
 * Using GPT-4o for intelligent recipe extraction and chat
 */

import OpenAI from 'openai';

// Get OpenAI client (lazy initialization)
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in .env.local! Please add your OpenAI API key.');
  }
  
  return new OpenAI({ apiKey });
}

/**
 * Send a chat message to GPT-4o
 * @param messages - Array of chat messages
 * @param model - Model to use (default: gpt-4o)
 * @returns AI response
 */
export async function chatWithAI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string = 'gpt-4o'
) {
  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      messages,
      model,
      temperature: 0.7,
      max_tokens: 2000,
    });

    return {
      response: completion.choices[0]?.message?.content || '',
      error: null,
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return {
      response: null,
      error: error.message || 'Failed to get AI response',
    };
  }
}

/**
 * Extract structured recipe data from text using GPT-4o
 * @param recipeText - Raw recipe text from OCR or website
 * @returns Structured recipe data
 */
export async function extractRecipeData(recipeText: string) {
  const systemPrompt = `You are a smart recipe extraction assistant. Extract structured recipe information from ANY input format — clean recipe text, messy blog posts, voice-style text, ingredient lists, or casual descriptions.

## EXTRACTION RULES

1. **Clean up blog fluff**: Remove personal stories, ads, and irrelevant text. Extract ONLY the recipe.

2. **Handle messy input**: Parse casual text like "yo save my curry recipe onions garlic ginger chicken turmeric simmer done" into proper format.

3. **Ingredients only**: If user gives just ingredients (e.g., "chicken, soy sauce, honey, garlic"), still extract them and set recipe_text to list the ingredients.

4. **Missing info**: If servings, time, or other details aren't mentioned, use null (don't guess).

5. **Be smart about titles**: If no title given, create one from main ingredient (e.g., "Garlic Spaghetti" from "spaghetti, garlic, olive oil").

## OUTPUT FORMAT

Return JSON with these fields:
- recipe_name: string (title, or create from main ingredient if missing)
- main_ingredient: string (primary ingredient)
- cuisine: string (e.g., "Italian", "Indian", "Mexican" — guess from ingredients if clear)
- difficulty: number (1-5, where 1 is easy and 5 is expert — estimate from complexity)
- time_minutes: number (total cooking time — null if not mentioned)
- notes: string (tips, substitutions, or "No additional notes")
- recipe_text: string (cleaned ingredients + instructions, or just ingredients if that's all provided)

## EXAMPLES

Input: "Spaghetti, olive oil, garlic. Boil pasta, sauté garlic, mix."
Output: {
  "recipe_name": "Garlic Spaghetti",
  "main_ingredient": "spaghetti",
  "cuisine": "Italian",
  "difficulty": 1,
  "time_minutes": 20,
  "notes": "Quick and simple",
  "recipe_text": "Ingredients: Spaghetti, olive oil, garlic\\n\\nInstructions:\\n1. Boil spaghetti\\n2. Sauté garlic in olive oil\\n3. Mix together"
}

Input: "chicken, soy sauce, honey, garlic"
Output: {
  "recipe_name": "Honey Garlic Chicken",
  "main_ingredient": "chicken",
  "cuisine": "Asian",
  "difficulty": 2,
  "time_minutes": null,
  "notes": "Ingredients only — cooking steps not provided",
  "recipe_text": "Ingredients:\\n- Chicken\\n- Soy sauce\\n- Honey\\n- Garlic"
}

Be accurate, clean up messy text, and extract the recipe clearly!`;

  const userPrompt = `Extract recipe information from this text:\n\n${recipeText}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'gpt-4o',
      temperature: 0.3, // Lower temperature for more consistent extraction
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const extractedData = JSON.parse(response);
    return {
      data: extractedData,
      error: null,
    };
  } catch (error: any) {
    console.error('Recipe extraction error:', error);
    return {
      data: null,
      error: error.message || 'Failed to extract recipe data',
    };
  }
}

/**
 * Parse natural language query into database filters
 * @param query - User's natural language query
 * @returns Database filter object
 */
export async function parseNaturalLanguageQuery(query: string) {
  const systemPrompt = `You are a STRICT query parser for a recipe database. Your job is to detect when someone wants to SEARCH/FIND recipes by specific criteria.

**CRITICAL RULE**: If the query is a single word or simple confirmation (yes/no/ok), return EMPTY object {}. These are NOT searches!

Return a JSON object with these optional fields ONLY for actual search queries:
- main_ingredient: string (filter by ingredient)
- cuisine: string (filter by cuisine type)
- difficulty: number (1-5)
- max_time: number (maximum cooking time in minutes)
- search_term: string (general text search)
- user_name: string (if asking for recipes by a specific person like "Mom" or "Dad")

Examples of SEARCH queries (return filters):
- "Show me chicken recipes" → {"main_ingredient": "chicken"}
- "Easy Italian recipes under 30 minutes" → {"cuisine": "Italian", "difficulty": 2, "max_time": 30}
- "Find Mom's recipes" → {"user_name": "Mom"}
- "Show me all recipes" → {"search_all": true}
- "Do I have any recipes?" → {"search_all": true}
- "What recipes do I have?" → {"search_all": true}

Examples of NON-SEARCH queries (return empty object):
- "I want to add a recipe" → {}
- "How do I add recipes?" → {}
- "Help me upload a recipe" → {}
- "Hello" → {}
- "What can you do?" → {}
- "save this" → {}
- "save my recipe" → {}
- "help" → {}
- "yes" → {}
- "yeah" → {}
- "sure" → {}
- "ok" → {}
- "okay" → {}
- "yep" → {}
- "what are the instructions" → {}
- "show me the instructions" → {}
- "what are the ingredients" → {}
- "can you show me the recipe" → {}
- "what are the recipe instructions" → {}
- "show me that recipe" → {}
- "tell me about that recipe" → {}
- "give me the details" → {}

**STRICT FILTERING RULES**:

Return {} (empty object) for:
1. Single-word responses: "yes", "no", "ok", "sure", "yeah", "yep", "nope"
2. Greetings: "hello", "hi", "hey"
3. Questions about the AI itself: "Can you...", "Do you...", "What can you..."
4. Requests to ADD/SAVE recipes: "I want to add", "add a recipe", "save this", "add recipe", "I want to save", "let me add"
5. Questions about ALREADY SHOWN recipes: "show instructions", "what are the ingredients", "tell me about that"

Return filters ONLY for:
- Queries with EXPLICIT search intent COMBINED with criteria: "show chicken recipes", "find Italian recipes", "search for easy recipes"
- Queries asking "what recipes" or "show recipes" with SPECIFIC CRITERIA
- DO NOT return filters for "I want to add" or "I want to save" - these are ADD requests, not searches!

**EXAMPLES OF WHAT TO RETURN {}:**
- "yes" → {}
- "ok" → {}
- "I want to add a recipe" → {} (ADD request, not search)
- "I want to add another recipe" → {} (ADD request, not search)
- "add a recipe" → {} (ADD request, not search)
- "save this recipe" → {} (SAVE request, not search)
- "show me the instructions" → {} (asking about already-shown recipe)
- "what are the ingredients" → {} (asking about already-shown recipe)
- "Can you help me?" → {} (question about capability)

**EXAMPLES OF WHAT TO RETURN FILTERS:**
- "show chicken recipes" → {"main_ingredient": "chicken"}
- "find easy Italian recipes" → {"cuisine": "Italian", "difficulty": 2}
- "show me all recipes" → {"search_all": true}

If in doubt, return {}. Be CONSERVATIVE - only return filters for clear search requests!

Examples:
- "Can you suggest recipes based on what I have?" → {} (question about capability)
- "Show me recipes with chicken" → {"main_ingredient": "chicken"} (actual search)
- "What are the instructions for that?" → {} (asking about already-shown recipe)
- "Show me the recipe details" → {} (asking about already-shown recipe)
- "What are the ingredients?" → {} (asking about already-shown recipe)`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      model: 'gpt-4o',
      temperature: 0.1, // Lower temperature for more consistent, rule-following behavior
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const filters = JSON.parse(response);
    return {
      filters,
      error: null,
    };
  } catch (error: any) {
    console.error('Query parsing error:', error);
    return {
      filters: null,
      error: error.message || 'Failed to parse query',
    };
  }
}



