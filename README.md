# Lunette

Learn music through live coding. Lunette is an AI-powered music education platform that uses [Strudel](https://strudel.cc/) for pattern-based music creation.

## Features

- **Live coding editor** with real-time sound playback and playhead highlighting
- **AI tutor** that helps explain music theory concepts as you create
- **Pattern library** to save, share, and fork patterns from the community
- **Reference panel** with searchable Strudel function documentation
- **Concept explorer** to discover music theory through your creations

## Tech Stack

- **Framework:** Next.js 16 (Turbopack, React 19)
- **Styling:** Tailwind CSS 4
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Auth:** Better Auth (GitHub OAuth)
- **Editor:** CodeMirror 6
- **Music:** Strudel (@strudel/web)
- **AI:** Vercel AI SDK v5 + OpenAI

## Prerequisites

- Node.js 20.9.0+ (required for Next.js 16)
- pnpm (latest)
- [Neon](https://neon.tech/) account (free tier available)
- [GitHub OAuth App](https://github.com/settings/developers) for authentication
- [OpenAI API key](https://platform.openai.com/api-keys) for AI features

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/lunette.git
cd lunette
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then fill in your values (see [Environment Variables](#environment-variables) below).

### 4. Set up the database

Create a new database on [Neon](https://console.neon.tech/) and copy the connection string to `DATABASE_URL`.

Push the schema to your database:

```bash
pnpm db:push
```

### 5. Set up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local`

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Random secret for session encryption (generate with `openssl rand -base64 32`) | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `NEXT_PUBLIC_APP_URL` | Public URL of your app (e.g., `http://localhost:3000`) | Yes |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push schema changes to database |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth routes (login, callback)
│   ├── (main)/           # Main app routes
│   │   ├── browse/       # Community pattern gallery
│   │   ├── gallery/      # User's saved patterns
│   │   ├── editor/       # Pattern editor
│   │   ├── pattern/[id]/ # Public pattern view
│   │   ├── explore/      # Concept explorer
│   │   └── settings/     # User settings
│   └── api/              # API routes
├── components/
│   ├── editor/           # CodeMirror editor components
│   ├── chat/             # Chat UI components
│   ├── patterns/         # Pattern cards, lists
│   ├── reference/        # Reference panel
│   ├── learn/            # Learning/concept components
│   └── ui/               # Shared UI components (shadcn/ui)
├── lib/
│   ├── db/               # Drizzle schema + client
│   ├── strudel/          # Runtime, tools, reference
│   ├── ai/               # AI prompts and utilities
│   └── annotations/      # AI code annotation system
└── hooks/                # React hooks
```

## Development

### Database Migrations

When you modify the schema in `lib/db/schema.ts`, push changes to your database:

```bash
pnpm db:push
```

### Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). To add new components:

```bash
pnpm dlx shadcn@latest add button
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables in Vercel's dashboard
4. Deploy

Make sure to update `NEXT_PUBLIC_APP_URL` to your production URL and update your GitHub OAuth callback URL.

## License

MIT
