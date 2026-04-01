# LeakLens Starter (Groq)

A Next.js App Router starter for an AI money-leak detector powered by Groq.

## Features
- Paste email / receipt text
- Upload screenshot as base64 image
- Server-side AI agent route
- Structured output schema
- Rendered result cards
- Basic cancel-step knowledge base

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Create `.env.local`
   ```bash
   GROQ_API_KEY=your_key_here
   ```

3. Run dev server
   ```bash
   npm run dev
   ```

## Notes
- The route handler is in `app/api/agent/route.ts`.
- Groq is OpenAI-compatible, so this starter uses the OpenAI SDK with `baseURL: "https://api.groq.com/openai/v1"`.
- The AI response uses structured outputs so the app gets valid JSON shaped like the schema.
- This starter is intentionally conservative: it suggests next steps instead of auto-canceling anything.
