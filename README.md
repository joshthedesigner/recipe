# Family Recipe Genie 🍳

A family-friendly AI assistant for storing, searching, and managing recipes through natural conversation.

## Features

- 📸 **Smart Recipe Entry** - Upload photos of cookbook pages or paste website URLs
- 🤖 **AI Extraction** - Automatically extracts recipe information with OCR and AI
- 💬 **Conversational Search** - Find recipes using natural language queries
- ⭐ **Favorites** - Save and organize your most-used recipes
- 📱 **Responsive Design** - Works beautifully on desktop and mobile

## Tech Stack

- **Frontend:** Next.js 14+, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** OpenAI GPT-4o-mini
- **OCR:** Tesseract.js
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account ([supabase.com](https://supabase.com))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Documentation

- [PRD.md](./temp_docs/PRD.md) - Product Requirements Document
- [INSTRUCTIONS.md](./temp_docs/INSTRUCTIONS.md) - Development Instructions
- [CURSOR_AI_INSTRUCTIONS.md](./temp_docs/CURSOR_AI_INSTRUCTIONS.md) - AI Working Guidelines

## Project Status

🚧 **Phase 1 Complete** - Project scaffold and dependencies installed

## License

ISC



