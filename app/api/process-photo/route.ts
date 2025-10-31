/**
 * Process Photo API Route
 * Handles OCR and AI extraction from recipe photos using OCR.space
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractRecipeData } from '@/lib/openai-client';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer and optimize
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    
    console.log('📸 Original image:', file.name, buffer.length, 'bytes');
    
    // Resize and optimize image to meet OCR.space's 1MB (1024KB) limit
    // We'll aim for 800KB to be safe
    let quality = 80;
    let width = 1200;
    
    // Compress with progressively lower quality until under 800KB
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        buffer = await sharp(buffer)
          .resize(width, null, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ quality })
          .toBuffer();
        
        console.log(`✅ Attempt ${attempt + 1}: ${width}px, ${quality}% quality = ${buffer.length} bytes (${(buffer.length / 1024).toFixed(0)}KB)`);
        
        // If under 800KB, we're good!
        if (buffer.length < 819200) {
          console.log('✅ Image optimized successfully!');
          break;
        }
        
        // Reduce quality and size for next attempt
        quality -= 10;
        width -= 200;
        
        if (quality < 40 || width < 600) {
          console.log('⚠️ Image still too large after aggressive compression');
          break;
        }
      } catch (sharpError: any) {
        console.error(`❌ Sharp error on attempt ${attempt + 1}:`, sharpError.message);
        // If first attempt fails, return error immediately
        if (attempt === 0) {
          return NextResponse.json({
            error: `Image processing failed: ${sharpError.message}. Try taking a screenshot or using a different image format.`,
          }, { status: 400 });
        }
        break;
      }
    }

    // Final check - if still too large, reject
    if (buffer.length > 1024000) {
      console.error('❌ Image still too large after compression:', buffer.length, 'bytes');
      return NextResponse.json({
        error: `Image is too large (${(buffer.length / 1024).toFixed(0)}KB) even after compression. Please try:\n• Taking a screenshot instead of a photo\n• Using a smaller/lower quality image\n• Pasting the recipe URL if available`,
      }, { status: 400 });
    }
    
    // Perform OCR with OCR.space API
    console.log('📸 Starting OCR with OCR.space...');
    const startTime = Date.now();
    
    const ocrFormData = new FormData();
    // Create a File object with proper extension
    const imageFile = new File([buffer], 'recipe.jpg', { type: 'image/jpeg' });
    ocrFormData.append('file', imageFile);
    ocrFormData.append('language', 'eng');
    ocrFormData.append('isOverlayRequired', 'false');
    ocrFormData.append('detectOrientation', 'true');
    ocrFormData.append('scale', 'true');
    ocrFormData.append('OCREngine', '2'); // Engine 2 is more accurate
    
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': process.env.OCR_SPACE_API_KEY || 'K87899142388957', // Free tier key (replace with your own)
      },
      body: ocrFormData,
    });

    const ocrResult = await ocrResponse.json();
    const ocrTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (!ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0 || ocrResult.IsErroredOnProcessing) {
      console.error('OCR failed:', ocrResult.ErrorMessage);
      return NextResponse.json({
        error: ocrResult.ErrorMessage || 'Could not extract text from image. Please try a clearer photo.',
      }, { status: 400 });
    }
    
    const text = ocrResult.ParsedResults[0].ParsedText;
    console.log(`✅ OCR completed in ${ocrTime}s, extracted ${text.length} characters`);

    if (!text || text.trim().length < 20) {
      return NextResponse.json({
        error: 'Could not extract enough text from the image. Please try a clearer photo.',
        extractedText: text,
      }, { status: 400 });
    }

    // Use AI to extract structured recipe data
    console.log('Extracting recipe data with AI...');
    console.log('OCR Text preview:', text.substring(0, 200) + '...');
    
    const { data: recipeData, error: extractError } = await extractRecipeData(text);

    if (extractError || !recipeData) {
      console.error('AI extraction failed:', extractError);
      return NextResponse.json({
        error: `Could not extract recipe information: ${extractError || 'AI returned no data'}. The OCR text was:\n\n${text.substring(0, 500)}...`,
        extractedText: text,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      extractedText: text,
      recipeData,
    });
  } catch (error: any) {
    console.error('Photo processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process photo: ' + error.message },
      { status: 500 }
    );
  }
}

