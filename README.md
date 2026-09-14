# NovaAI

AI Chat with 500+ models via Puter.js — User-Pays, Zero Backend, Zero API Keys

## Features

✅ Chat with 500+ AI models (GPT, Claude, Gemini, DeepSeek, Llama, etc.)
✅ RAG (Retrieval-Augmented Generation) — Upload files, auto-retrieve context
✅ User-Pays model — No backend costs, users pay directly to Puter
✅ Zero API keys — Secure authentication via Puter OAuth
✅ Dark mode support
✅ Responsive design (Tailwind CSS)
✅ Prompt library to save & manage prompts
✅ Admin panel for stats
✅ TypeScript strict mode
✅ Production-ready for Vercel/Cloudflare Pages

## Quick Start

### 1. Clone & Install

```bash
clone <this repo>
cd novaai
npm install
```

### 2. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Sign In

Click "เข้าสู่ระบบด้วย Puter" → Puter OAuth popup (dev mode accepts any credentials)

## Stack

- **Frontend**: Next.js 16 (App Router, RSC)
- **UI**: Tailwind CSS + shadcn components
- **AI**: Puter.js SDK (500+ models)
- **Auth**: Puter OAuth
- **Storage**: Puter KV (key-value) + FS (file system)
- **RAG**: Lexical retrieval (built-in, no embeddings needed)
- **Theme**: next-themes (dark/light)

## Architecture

```
┌─────────────────────────┐
│  Next.js 16 App Router  │
│  (RSC + Client)         │
└────────────┬────────────┘
             │
      ┌──────▼──────┐
      │ Puter.js    │
      │ SDK         │
      └──────┬──────┘
             │
   ┌─────────┴─────────┐
   │                   │
   ▼                   ▼
┌──────────┐      ┌──────────┐
│puter.ai  │      │puter.kv  │
│(Chat)    │      │(Storage) │
└──────────┘      └──────────┘
```

**No backend needed** — Auth, Database, and Storage all handled by Puter

## File Structure

```
novaai/
├─ app/
│  ├─ (marketing)/     → Landing page
│  ├─ (auth)/          → Login
│  ├─ (app)/           → Protected routes (dashboard, chat, library, etc.)
│  ├─ api/upload/      → Stub endpoint
│  └─ globals.css, layout.tsx, sitemap.ts, robots.ts
├─ components/
│  ├─ ui/              → Button, Input, Card, Textarea, Toast
│  ├─ chat/            → ChatWindow, MessageBubble, ModelPicker, Composer
│  ├─ layout/          → Sidebar, Topbar
│  ├─ auth/            → PuterSignIn, AuthGate
│  └─ theme/           → ThemeToggle
├─ lib/
│  ├─ puter.ts         → Puter SDK wrapper (auth)
│  ├─ ai.ts            → Chat & model listing
│  ├─ storage.ts       → KV & FS wrappers
│  ├─ rag.ts           → Chunking, retrieval, ingestion
│  ├─ rate-limit.ts    → Token bucket limiter
│  └─ utils.ts         → Helpers (cn, formatDate, uid)
├─ public/             → Static assets
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ next.config.mjs
└─ middleware.ts
```

## Environment

No secrets needed! Just set:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For production:
```env
NEXT_PUBLIC_APP_URL="https://novaai.vercel.app"
```

## Deploy

### Vercel (Recommended)

```bash
vercel deploy --prod
```

### Cloudflare Pages / Netlify

Connect your GitHub repo and deploy (Next.js is fully supported)

## Features in Detail

### 1. Chat with Any Model

- Real-time streaming responses
- 500+ models available
- Model picker dropdown
- Rate limiting (30 requests/min per conversation)

### 2. RAG (Retrieval-Augmented Generation)

- Upload TXT, MD, JSON, CSV files
- Automatic chunking (800 chars, 100 overlap)
- Lexical BM25-style retrieval
- Context injected into AI prompt

### 3. Conversation History

- Auto-save to Puter KV
- Access via sidebar "Recent"
- Persistent across sessions

### 4. Prompt Library

- Save & organize prompts
- Tag-based filtering
- Copy to clipboard
- Full CRUD operations

### 5. Settings

- Display name
- Default model selection
- Persisted via KV

### 6. Admin Panel

- View stats (conversations, prompts, docs)
- Admin access for users with `admin` prefix

## Usage Examples

### Send a Chat Message

```typescript
const message = "Explain quantum computing";
const model = "gpt-4o-mini";

// Use the ChatWindow component — no manual code needed
// Or use lib/ai.ts functions directly:
import { chatStream } from '@/lib/ai';

for await (const delta of chatStream([{ role: 'user', content: message }], model)) {
  console.log(delta); // Stream text chunks
}
```

### Upload a File for RAG

```typescript
import { ingestFile } from '@/lib/rag';

const file = new File(["..."], "doc.txt");
const { id, chunks } = await ingestFile(file, 'me');
console.log(`Stored ${chunks} chunks`);
```

### Access Prompt Library

```typescript
import { kv } from '@/lib/storage';

// Save
await kv.set('prompt:my-prompt', { title: 'My Prompt', body: '...' });

// Load
const prompt = await kv.get('prompt:my-prompt');

// List all
const keys = await kv.list('prompt:*');
```

## Customization

### Change Colors

Edit `app/globals.css` CSS variables:

```css
:root {
  --primary: 262 83% 58%;      /* Purple */
  --primary-foreground: 0 0% 100%;
  /* ... */
}
```

### Add More Models

Update `lib/ai.ts`:

```typescript
export const DEFAULT_MODEL = 'claude-3-opus';
```

### Extend RAG

Add semantic embeddings by proxying through a backend:

```typescript
// In lib/rag.ts
export async function retrieveWithEmbeddings(query: string, chunks: string[]) {
  const queryEmbed = await fetch('/api/embed', { body: query });
  // ... cosine similarity ...
}
```

## Troubleshooting

### "Puter is not defined"

→ Ensure file has `'use client'` directive

### Models not loading

→ Check browser console for Puter SDK errors
→ Verify Puter account is active

### KV data not persisting

→ Puter KV is per-user; ensure logged in
→ Check browser LocalStorage isn't full

## Performance

- **Streaming**: Real-time AI responses via AsyncIterator
- **RAG**: Lexical retrieval (instant, no API calls)
- **Storage**: KV responses < 100ms, FS handles large files
- **Rate Limit**: In-memory token bucket, resets on deploy

## Security

✅ No API keys in code
✅ Per-user data isolation (Puter handles)
✅ CORS-safe (Puter proxy)
✅ TypeScript strict mode
✅ Auth middleware on protected routes

## Known Limitations

| Limitation | Workaround |
|-----------|----------|
| KV key max 400 KB | Split large docs into multiple keys |
| No true embeddings | Add `/api/embed` backend proxy |
| Rate limit resets on deploy | Move buckets to Puter KV |
| Admin sees only own data | Use `getUser()` to filter |

## Checklist (20/20 ✅)

- [x] Landing page with hero
- [x] Puter OAuth sign-in
- [x] AuthGate middleware
- [x] Dashboard with stats
- [x] Chat streaming (500+ models)
- [x] ModelPicker dropdown
- [x] Conversation history (KV)
- [x] Prompt Library (KV)
- [x] File upload + RAG
- [x] Lexical retrieval
- [x] Rate limiting
- [x] Settings page
- [x] Admin panel
- [x] Dark mode toggle
- [x] Responsive design
- [x] SEO (metadata, sitemap, robots)
- [x] API stub
- [x] TypeScript strict
- [x] Error handling + Toast
- [x] Vercel deploy ready

## Support

- **Puter Docs**: https://docs.puter.com/
- **Next.js Docs**: https://nextjs.org/docs
- **shadcn CLI**: https://ui.shadcn.com/docs/cli

## License

MIT

---

**Built with ❤️ using Next.js 16 + Puter.js**
