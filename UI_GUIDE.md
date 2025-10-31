# 🎨 UI Guide: Family Recipe Genie

## Visual Overview of Your App

### 🏠 Main Page (http://localhost:3000)

```
┌────────────────────────────────────────────────────────────┐
│  🍳  [Chat] [Browse Recipes]      Welcome, user! [Sign Out]│ ← Navigation
├────────────────────────────────────────────────────────────┤
│                                                            │
│                     CHAT VIEW                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Family Recipe Genie 🍳                          │    │
│  │  Your AI cooking assistant                       │    │
│  ├──────────────────────────────────────────────────┤    │
│  │                                                   │    │
│  │  [AI Message Bubble]                             │    │
│  │  Hi! I can help you add and search recipes...    │    │
│  │                                                   │    │
│  │                   [Your Message Bubble]          │    │
│  │                   Show me chicken recipes        │    │
│  │                                                   │    │
│  ├──────────────────────────────────────────────────┤    │
│  │  📸  [Type your message...]         [Send]      │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
                                                    ┌────────┐
                                                    │⭐      │
                                                    │Favorites│
                                                    │Sidebar │
                                                    └────────┘
```

---

### 📚 Browse View

```
┌────────────────────────────────────────────────────────────┐
│  🍳  [Chat] [Browse Recipes]      Welcome, user! [Sign Out]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│  All Recipes (12)                                          │
│                                                            │
│  ┌────────┐  ┌────────┐  ┌────────┐                      │
│  │ Photo  │  │ Photo  │  │ Photo  │                      │
│  │────────│  │────────│  │────────│                      │
│  │Lasagna │  │  Curry │  │  Tacos │                      │
│  │Added by│  │Added by│  │Added by│                      │
│  │  Mom   │  │  Dad   │  │ Sarah  │                      │
│  │chicken │  │chicken │  │  beef  │                      │
│  │Italian │  │ Indian │  │ Mexican│                      │
│  │⏱️ 45m  │  │⏱️ 30m  │  │⏱️ 20m  │                      │
│  │[View]🤍│  │[View]❤️│  │[View]🤍│                      │
│  └────────┘  └────────┘  └────────┘                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 🔐 Login Page (http://localhost:3000/login)

```
┌────────────────────────────────────────┐
│                                        │
│              🍳                        │
│       Welcome Back!                    │
│  Sign in to your Family Recipe Genie  │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Email                           │ │
│  │  [you@example.com]              │ │
│  │                                  │ │
│  │  Password                        │ │
│  │  [••••••••]                     │ │
│  │                                  │ │
│  │  [ Sign In ]                    │ │
│  │                                  │ │
│  │  Don't have an account? Sign up │ │
│  └──────────────────────────────────┘ │
│                                        │
│         ← Back to home                 │
└────────────────────────────────────────┘
```

---

### ✍️ Signup Page (http://localhost:3000/signup)

```
┌────────────────────────────────────────┐
│                                        │
│              🍳                        │
│       Join the Family!                 │
│  Create your Recipe Genie account      │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Display Name                    │ │
│  │  [Mom, Dad, Sarah, etc.]        │ │
│  │  (Shows on recipes you add)      │ │
│  │                                  │ │
│  │  Email                           │ │
│  │  [you@example.com]              │ │
│  │                                  │ │
│  │  Password                        │ │
│  │  [At least 6 characters]        │ │
│  │                                  │ │
│  │  [ Sign Up ]                    │ │
│  │                                  │ │
│  │  Already have an account? Sign in│ │
│  └──────────────────────────────────┘ │
│                                        │
│         ← Back to home                 │
└────────────────────────────────────────┘
```

---

### 📖 Recipe Modal (Overlay)

```
┌────────────────────────────────────────────┐
│  Recipe Details                      [×]   │ ← Click to close
├────────────────────────────────────────────┤
│                                            │
│  [Large Recipe Photo]                      │
│                                            │
│  Classic Chicken Curry                     │
│  Added by Mom                              │
│                                            │
│  Main Ingredient: chicken                  │
│  Cuisine: Indian                           │
│  Cooking Time: 45 minutes                  │
│  Difficulty: Moderate                      │
│                                            │
│  Notes                                     │
│  This is grandma's secret recipe...        │
│                                            │
│  Instructions                              │
│  ┌──────────────────────────────────────┐ │
│  │ 1. Heat oil in a pan...              │ │
│  │ 2. Add onions and cook...            │ │
│  │ 3. Add chicken pieces...             │ │
│  │ ...                                  │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  View Original Source →                    │
│                                            │
│  [ Close ]                                 │
└────────────────────────────────────────────┘
```

---

### ⭐ Favorites Sidebar (Desktop)

```
                          ┌──────────────────┐
                          │  ⭐ Favorites    │
                          │  12 recipes      │
                          ├──────────────────┤
                          │ ┌──────────────┐ │
                          │ │ [Photo]      │ │
                          │ │ Lasagna      │ │
                          │ │ by Mom       │ │
                          │ │ ⏱️ 45m 📊 3/5│ │
                          │ │ [Remove]     │ │
                          │ └──────────────┘ │
                          │ ┌──────────────┐ │
                          │ │ [Photo]      │ │
                          │ │ Curry        │ │
                          │ │ by Dad       │ │
                          │ │ ⏱️ 30m 📊 2/5│ │
                          │ │ [Remove]     │ │
                          │ └──────────────┘ │
                          │ ...              │
                          └──────────────────┘
```

---

### 📱 Mobile View

On mobile, the favorites sidebar becomes a full-screen overlay with a floating button in the bottom-right corner.

```
┌────────────────────┐
│🍳 [☰] Recipe Genie │
├────────────────────┤
│                    │
│  Chat or Browse    │
│  Content Here      │
│                    │
│                    │
│              [⭐]  │ ← Floating button
└────────────────────┘
```

---

## 🎨 Color Reference

- **Orange (#F97316):** Primary buttons, active states
- **Pink (#EC4899):** Gradients, accents
- **Green:** Easy difficulty
- **Yellow:** Moderate difficulty
- **Red:** Hard difficulty, remove actions
- **Blue:** Tags, links
- **Purple:** Cuisine tags
- **Gray:** Neutral backgrounds, borders

---

## 💡 Interaction Guide

### Hover Effects:
- Recipe cards: Lift with shadow
- Buttons: Darker background
- Images: Slight zoom

### Click Actions:
- Recipe card → Opens modal
- Heart button → Toggle favorite
- [View Recipe] button → Opens modal
- Favorite in sidebar → Opens modal
- Outside modal → Closes modal

### Keyboard:
- Enter → Send chat message
- Shift+Enter → New line in chat
- ESC → Close modal

---

## 📐 Responsive Breakpoints

- **Mobile:** < 768px (Full width, stacked layout)
- **Tablet:** 768px - 1024px (2-column grid)
- **Desktop:** > 1024px (3-column grid, sidebar)

---

**Your app looks beautiful and professional!** 🎨✨



