# Lunette - AI Assistant Guide

## Project Overview

Lunette is a web app for learning music through live coding using Strudel. Users interact with an AI tutor while writing and playing musical patterns.

## Tech Stack

- **Framework:** Next.js 16 (Turbopack, React 19.2)
- **Styling:** Tailwind CSS 4 (CSS-first config)
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Auth:** Better Auth (GitHub OAuth)
- **Editor:** CodeMirror 6
- **Music:** Strudel (@strudel/web, @strudel/core)
- **AI:** Vercel AI SDK v5 + OpenRouter

## Implementation Approach

Vertical slices - each slice delivers end-to-end functionality that can be tested and demonstrated.

See `docs/implementation-plan.md` for full slice breakdown and acceptance criteria.

## When Implementing

1. **Read the full slice before starting.** Understand the acceptance criteria.

2. **Create files in order listed.** Dependencies matter.

3. **Test after each file.** Don't move on until it works.

4. **Ask clarifying questions** if requirements are ambiguous.

5. **Keep code simple.** Avoid over-engineering. This is an MVP.

6. **Match existing patterns.** Look at completed slices for conventions.

7. **When stuck**, refer back to `docs/prd.md` for context and intent.

## Project Structure

```
app/
├── (auth)/           # Auth routes (login, callback)
├── (main)/           # Main app routes
│   ├── browse/       # Pattern gallery
│   ├── learn/        # Learning paths
│   ├── pattern/[id]/ # Public pattern view
│   └── settings/     # User settings
├── api/              # API routes
│   ├── auth/         # Better Auth handler
│   ├── chat/         # LLM chat endpoint
│   ├── patterns/     # Pattern CRUD
│   └── runtime/      # Strudel tool calls
components/
├── editor/           # CodeMirror wrapper
├── chat/             # Chat UI components
├── patterns/         # Pattern cards, lists
└── ui/               # Shared UI components
lib/
├── db/               # Drizzle schema + client
├── strudel/          # Runtime, tools, reference
└── utils.ts          # cn() helper
types/
└── index.ts          # Shared types
```

## Design System

Using custom dark theme with IBM Plex Mono. Key tokens:

- `bg-default-background` - Main background (rgb(3, 7, 18))
- `text-default-font` - Primary text
- `text-subtext-color` - Muted text
- `bg-brand-600` / `text-brand-600` - Primary cyan accent
- `border-neutral-border` - Borders

See `app/globals.css` for full token definitions.

## Commands

```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm lint     # Run ESLint
```
