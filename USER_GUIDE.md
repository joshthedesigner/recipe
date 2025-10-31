# 📖 Family Recipe Genie - User Guide

Welcome to your AI-powered family recipe assistant! This guide will show you how to use all the features.

---

## 🚀 Getting Started

### **1. Sign Up / Sign In**

1. Go to **http://localhost:3000**
2. Click **"Sign Up"** in the top right
3. Enter your email and password
4. Click **"Sign Up"**
5. You're ready to go!

**If you already have an account:**
- Click **"Sign In"**
- Enter your credentials

---

## 📸 Adding Recipes from Photos

### **Perfect for cookbook recipes!**

1. Click the **Chat** tab (left tab in top navigation)
2. Click the **camera icon** 📸 (bottom right of input box)
3. Select a photo from your computer
4. Wait while the AI extracts the recipe (10-15 seconds)
5. Review the extracted information
6. Type **"save recipe"** and press Enter
7. ✅ Done! Your recipe is saved

**Tips for best results:**
- Use good lighting
- Take a clear, focused photo
- Get close to the text
- Avoid shadows and glare
- Hold phone/camera straight

---

## 🌐 Adding Recipes from Websites

### **Grab recipes from any cooking site!**

1. Find a recipe online (AllRecipes, Food Network, etc.)
2. **Copy the URL** (the website address)
3. Go to the **Chat** tab
4. **Paste the URL** into the chat
5. Press Enter
6. Wait while the AI extracts the recipe (5-10 seconds)
7. Review the extracted information
8. Type **"yes"** or **"save recipe"**
9. ✅ Done!

**Supported sites:**
- AllRecipes
- Food Network
- Bon Appétit
- NYT Cooking
- Most recipe blogs
- Any site with Schema.org markup

---

## 🔍 Searching for Recipes

### **Use natural language - just ask!**

**By Ingredient:**
- "Show me chicken recipes"
- "Find pasta recipes"
- "Recipes with salmon"

**By Cuisine:**
- "Italian recipes"
- "Find Mexican food"
- "Show me Indian recipes"

**By Time:**
- "Quick recipes under 30 minutes"
- "Fast dinner ideas"
- "Recipes under 20 minutes"

**By Difficulty:**
- "Easy recipes"
- "Simple dinner ideas"
- "Beginner-friendly recipes"

**By Family Member:** ⭐
- "Show me Mom's recipes"
- "Find Dad's recipes"
- "What has Sarah uploaded?"

**Combining Filters:**
- "Easy Italian recipes under 30 minutes"
- "Quick chicken recipes"
- "Show me Mom's desserts"

---

## 💬 Chatting with the AI

Your Recipe Genie is smart and conversational!

**Try asking:**
- "Hello!"
- "How do I add a recipe?"
- "What can you do?"
- "Give me cooking tips for chicken"
- "What's the easiest way to add recipes?"

The AI will respond naturally and help guide you!

---

## 📚 Browsing All Recipes

1. Click the **"Browse Recipes"** tab (top navigation)
2. See all recipes in card view
3. Each card shows:
   - Recipe name
   - Main ingredient
   - Cooking time
   - Difficulty level
   - Who added it
4. Click **"View Recipe"** to see full details

---

## ⭐ Favoriting Recipes

### **Save your go-to recipes for quick access!**

1. Browse recipes or view a recipe
2. Click the **heart icon** ❤️
3. Recipe is added to your favorites
4. Click again to unfavorite

### **View Your Favorites:**
- Look for the **"Favorites"** panel on the right side
- Click any favorite to view it quickly
- Remove from favorites with the **X** button

---

## 👁️ Viewing Full Recipe Details

1. Find a recipe (Browse or Favorites)
2. Click **"View Recipe"** button
3. A modal opens with:
   - Full recipe name
   - Main ingredient
   - Cuisine type
   - Difficulty (1-5 stars)
   - Cooking time
   - Notes
   - Full recipe text/instructions
   - Photo (if available)
   - Source link (if from website)
   - Who added it

4. Click outside or press **ESC** to close

---

## 👥 Family Features

### **Recipe Attribution**

Every recipe shows who added it!

- See "Added by Mom" on recipe cards
- Search for specific family member's recipes
- Track your family's recipe collection

### **Sharing Recipes**

All recipes are visible to everyone in your family account:
- Upload recipes once
- Everyone can view
- Everyone can search
- Only uploader can edit/delete (future feature)

---

## 🎓 Pro Tips

### **1. Use Display Names**

When signing up, use recognizable names:
- Instead of "jane.smith@email.com"
- Update your profile to show "Mom" or "Jane"
- Makes attribution clearer

### **2. Add Notes**

The AI might miss some details:
- You can add notes manually (future feature)
- Include serving sizes, substitutions, or tips

### **3. Source Links**

URL recipes automatically save the link:
- Click to visit original recipe
- Helpful for step-by-step photos
- Credit to recipe creators

### **4. Clear Photos**

For cookbook photos:
- Natural light is best
- Avoid flash if possible
- Straight-on angle
- Fill the frame with recipe text

### **5. Edit Before Saving**

If the AI extracts something wrong:
- You can tell it to change details (future feature)
- Example: "Change main ingredient to beef"
- Or manually edit after saving (future feature)

---

## ❓ FAQ

### **Q: Can I edit a recipe after saving?**
A: Not yet, but this feature is coming in Phase 6!

### **Q: Can I delete recipes?**
A: Not from the UI yet, but you can only delete your own recipes.

### **Q: What if the photo OCR doesn't work?**
A: Try:
- Better lighting
- Clearer photo
- Closer to the text
- Or try uploading a different photo

### **Q: What if a website blocks scraping?**
A: The AI will save just the URL, and you can add details manually later.

### **Q: Can I use this on mobile?**
A: Yes! The interface is responsive and works on phones/tablets.

### **Q: How many recipes can I store?**
A: Unlimited! Supabase free tier is very generous.

### **Q: Is my data secure?**
A: Yes! Row Level Security ensures you can only edit your own recipes.

---

## 🐛 Troubleshooting

### **Photo upload not working:**
- Check file size (under 10MB recommended)
- Use JPG or PNG format
- Make sure you're signed in

### **URL not extracting:**
- Some sites block scrapers
- Try a different recipe site
- The link will still be saved

### **Can't save recipe:**
- Make sure you're signed in
- Check internet connection
- Try refreshing the page

### **AI not responding:**
- Check internet connection
- Refresh the page
- Try signing out and back in

---

## 🎉 Have Fun!

Your Family Recipe Genie is here to make recipe management easy and fun. Upload your grandmother's recipes, share family favorites, and discover new dishes together!

**Happy Cooking! 👨‍🍳👩‍🍳**

---

## 📞 Need Help?

If you encounter issues:
1. Refresh the page
2. Sign out and sign in
3. Check the browser console for errors
4. Reach out for support

---

**Version:** Phase 5 Complete  
**Last Updated:** 2025-10-31  
**Built with:** Next.js, Supabase, Groq AI, Material-UI



