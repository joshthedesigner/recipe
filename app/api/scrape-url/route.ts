/**
 * Scrape URL API Route
 * Extracts recipe information from website URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { extractRecipeData } from '@/lib/openai-client';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the website
    console.log('Fetching URL:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      // Try to save just the URL with basic info
      console.log(`Fetch failed with status ${response.status}, saving URL only`);
      return NextResponse.json({
        success: true,
        recipeData: {
          recipe_name: validUrl.hostname.replace('www.', '') + ' Recipe',
          source_link: url,
          recipe_text: null,
          notes: `Could not fetch recipe content (HTTP ${response.status}). Visit the link to view the full recipe.`,
        },
        extractedText: '',
        source_link: url,
        partialSuccess: true,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try to extract recipe content
    // Look for common recipe HTML structures
    let recipeText = '';

    // Try schema.org Recipe markup first
    const recipeSchema = $('script[type="application/ld+json"]').filter((_, el) => {
      const content = $(el).html();
      return content && content.includes('"@type":"Recipe"');
    }).first();

    if (recipeSchema.length > 0) {
      try {
        const schemaData = JSON.parse(recipeSchema.html() || '{}');
        if (schemaData['@type'] === 'Recipe' || (Array.isArray(schemaData['@graph']) && 
            schemaData['@graph'].some((item: any) => item['@type'] === 'Recipe'))) {
          
          const recipe = schemaData['@type'] === 'Recipe' ? schemaData : 
            schemaData['@graph'].find((item: any) => item['@type'] === 'Recipe');

          recipeText = `
Recipe: ${recipe.name || ''}
Description: ${recipe.description || ''}

Ingredients:
${Array.isArray(recipe.recipeIngredient) ? recipe.recipeIngredient.join('\n') : ''}

Instructions:
${Array.isArray(recipe.recipeInstructions) ? 
  recipe.recipeInstructions.map((step: any) => 
    typeof step === 'string' ? step : step.text || ''
  ).join('\n') : 
  recipe.recipeInstructions || ''}

Prep Time: ${recipe.prepTime || 'N/A'}
Cook Time: ${recipe.cookTime || 'N/A'}
Total Time: ${recipe.totalTime || 'N/A'}
Servings: ${recipe.recipeYield || 'N/A'}
          `.trim();
        }
      } catch (e) {
        console.error('Error parsing recipe schema:', e);
      }
    }

    // Fallback: Extract text from common recipe selectors
    if (!recipeText) {
      const selectors = [
        '.recipe-content',
        '.recipe-instructions',
        '.recipe',
        '[itemprop="recipeInstructions"]',
        '.recipe-body',
        '.entry-content',
        '.post-content',
        '[class*="recipe"]',
        '[class*="Recipe"]',
        '[id*="recipe"]',
        'article',
        'main',
      ];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().trim();
          console.log(`Trying selector ${selector}: found ${text.length} chars`);
          if (text.length > recipeText.length) {
            recipeText = text;
          }
          if (recipeText.length > 500) break; // Found enough content
        }
      }
      
      console.log(`Final extracted text length: ${recipeText.length}`);
    }

    // Get page title as fallback recipe name
    const pageTitle = $('title').text().trim() || 
                     $('h1').first().text().trim() ||
                     'Recipe from ' + validUrl.hostname;

    if (!recipeText || recipeText.length < 50) {
      // Not enough content extracted - just return the URL
      console.log('Not enough content extracted, saving URL only');
      return NextResponse.json({
        success: true,
        recipeData: {
          recipe_name: pageTitle,
          source_link: url,
          recipe_text: null,
          notes: 'Could not extract recipe text automatically. Click the source link to view the full recipe, or add details manually.',
        },
        extractedText: recipeText || 'No recipe content found',
        source_link: url,
        partialSuccess: true,
      });
    }

    // Use AI to structure the recipe data
    console.log('Extracting recipe data with AI...');
    const { data: recipeData, error: extractError } = await extractRecipeData(recipeText);

    if (extractError || !recipeData) {
      return NextResponse.json({
        success: true,
        recipeData: {
          recipe_name: pageTitle,
          source_link: url,
          recipe_text: recipeText,
          notes: 'AI extraction failed. Review and edit as needed.',
        },
        extractedText: recipeText,
        source_link: url,
      });
    }

    // Add source link to extracted data
    recipeData.source_link = url;

    return NextResponse.json({
      success: true,
      extractedText: recipeText,
      recipeData,
      source_link: url,
    });
  } catch (error: any) {
    console.error('URL scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape URL: ' + error.message },
      { status: 500 }
    );
  }
}

