# Lunette Implementation Plan

**Approach:** Vertical slices — each slice delivers end-to-end functionality that can be tested and demonstrated.

**Audience:** AI coding assistant (Claude, Cursor, etc.)

---

## Prerequisites

Before starting, ensure:
- Node.js 20.9.0+ installed (required for Next.js 16)
- pnpm installed (latest)
- Neon account created (free tier)
- Vercel account created
- OpenRouter account (for testing)

## Version Lock

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | ^16.0.0 | Turbopack default, proxy.ts, React 19.2 |
| React | ^19.2.0 | Bundled with Next 16 |
| Tailwind CSS | ^4.0.0 | CSS-first config, @import "tailwindcss" |
| Vercel AI SDK | ^5.0.0 | UIMessage types, SSE streaming |
| TypeScript | ^5.1.0 | Minimum for Next 16 |
| Drizzle ORM | latest | |
| Better Auth | latest | |
| CodeMirror | ^6.0.0 | |
| @strudel/web | latest | Pin if issues arise |

---

## Slice 0: Project Setup

**Goal:** Scaffold Next.js 16 project with all dependencies configured.

**Dependencies:** None

**Steps:**

1. Create Next.js 16 project:
```bash
pnpm create next-app@latest lunette --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd lunette
```

2. Verify Next.js 16 and Tailwind 4 installed:
```bash
pnpm list next tailwindcss
# Should show next@16.x.x and tailwindcss@4.x.x
```

3. Install core dependencies:
```bash
# Database
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Auth
pnpm add better-auth

# Editor
pnpm add @codemirror/state @codemirror/view @codemirror/lang-javascript @codemirror/theme-one-dark

# Strudel
pnpm add @strudel/web @strudel/core @strudel/mini @strudel/webaudio

# UI utilities
pnpm add clsx tailwind-merge lucide-react

# AI (v5)
pnpm add ai@^5.0.0
```

4. Create folder structure:
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── callback/
│   ├── (main)/
│   │   ├── page.tsx
│   │   ├── browse/
│   │   ├── pattern/[id]/
│   │   ├── learn/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/[...all]/
│   │   ├── chat/
│   │   ├── patterns/
│   │   └── runtime/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── editor/
│   ├── chat/
│   ├── patterns/
│   └── ui/
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── auth.ts
│   ├── strudel/
│   │   ├── runtime.ts
│   │   ├── tools.ts
│   │   └── reference.ts
│   └── utils.ts
└── types/
    └── index.ts
```

5. Configure environment variables (`.env.local`):
```
DATABASE_URL=
BETTER_AUTH_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

6. Tailwind v4 setup — verify `src/app/globals.css` uses new syntax:
```css
@import "tailwindcss";

/* Custom theme variables */
@theme {
  --color-background: oklch(0.13 0.02 260);
  --color-foreground: oklch(0.95 0.01 260);
  --color-muted: oklch(0.25 0.02 260);
  --color-accent: oklch(0.65 0.15 260);
}
```

Note: Tailwind v4 uses CSS-first configuration. No `tailwind.config.ts` needed for basic setup. The `@theme` directive replaces the old `theme.extend` in JS config.

7. Set up base layout with dark mode (`src/app/layout.tsx`):
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lunette",
  description: "Learn music through code",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
```

8. Note on Next.js 16 changes:
   - `middleware.ts` is now `proxy.ts` — rename if needed
   - Turbopack is default bundler
   - React 19.2 features available (View Transitions, useEffectEvent)

**Acceptance Criteria:**
- [ ] `pnpm dev` runs without errors
- [ ] Dark background visible at localhost:3000
- [ ] All dependencies installed at correct versions
- [ ] No TypeScript errors

---

## Slice 1: Editor + Sound

**Goal:** CodeMirror editor that evaluates Strudel code and plays sound.

**Dependencies:** Slice 0

**Files to create:**

### `src/lib/strudel/runtime.ts`
```typescript
// Singleton Strudel runtime manager
// - initStrudel()
// - evaluate(code: string)
// - play()
// - stop()
// - getPlayingState()
// - getBpm()
// - setBpm(bpm: number)
// - getCurrentPattern()
// - onError callback
// - onTrigger callback (for playhead)
```

### `src/components/editor/Editor.tsx`
```typescript
// CodeMirror wrapper component
// Props:
// - value: string
// - onChange: (value: string) => void
// - onEvaluate: (code: string) => void
// - highlights: Array<{start: number, end: number}>
// 
// Features:
// - Cmd/Ctrl+Enter to evaluate
// - One Dark theme
// - JavaScript syntax highlighting
```

### `src/components/editor/Controls.tsx`
```typescript
// Play/Stop button
// BPM display/input
// Evaluate button
```

### `src/app/(main)/page.tsx`
```typescript
// Main page with:
// - Editor component (full width for now)
// - Controls bar
// - Initialize Strudel on mount
```

**Implementation Notes:**

1. Strudel initialization requires user gesture (click). Add a "Click to start" overlay that initializes audio context.

2. Use `@strudel/web` for simplest setup:
```typescript
import { initStrudel } from '@strudel/web';

// Call once after user gesture
await initStrudel();

// Evaluate code
const { evaluate } = await import('@strudel/core');
const pattern = await evaluate(code);
```

3. For CodeMirror, create an abstraction layer for future Monaco swap:
```typescript
interface EditorAdapter {
  getValue(): string;
  setValue(code: string): void;
  highlightRanges(ranges: Array<{start: number, end: number}>): void;
  clearHighlights(): void;
  onChange(callback: (code: string) => void): void;
}
```

**Acceptance Criteria:**
- [ ] Editor displays with syntax highlighting
- [ ] Typing code works
- [ ] Cmd+Enter evaluates code
- [ ] `s("bd hh sd hh").play()` produces sound
- [ ] Play/Stop buttons work
- [ ] BPM can be changed

---

## Slice 2: Playhead Highlighting

**Goal:** Code highlights in sync with playing music.

**Dependencies:** Slice 1

**Files to modify:**

### `src/lib/strudel/runtime.ts`
- Add event listener for pattern triggers
- Extract source location from haps (events)
- Expose `onHighlight(callback: (ranges) => void)`

### `src/components/editor/Editor.tsx`
- Accept `highlights` prop
- Apply CodeMirror decorations for active ranges
- Clear decorations on frame update

**Implementation Notes:**

1. Strudel patterns track source locations via `withMiniLocation`. When a hap triggers, it includes the character range from the original code.

2. Use `requestAnimationFrame` loop to query active events:
```typescript
function updateHighlights() {
  const now = getAudioContext().currentTime;
  const activeHaps = pattern.queryArc(now, now + 0.1);
  const ranges = activeHaps
    .filter(hap => hap.value?.locations)
    .flatMap(hap => hap.value.locations);
  setHighlights(ranges);
  requestAnimationFrame(updateHighlights);
}
```

3. CodeMirror decorations:
```typescript
import { Decoration, DecorationSet } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

const highlightMark = Decoration.mark({ class: 'cm-strudel-highlight' });

// Create StateEffect and StateField to manage decorations
```

4. CSS for highlight:
```css
.cm-strudel-highlight {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}
```

**Acceptance Criteria:**
- [ ] Playing `s("bd hh sd hh")` highlights each sound as it plays
- [ ] Highlights clear when playback stops
- [ ] Highlights sync accurately with audio (no noticeable lag)
- [ ] Multiple simultaneous highlights work (for stacked patterns)

---

## Slice 3: Split Pane + Chat UI

**Goal:** Split-pane layout with chat panel (no AI yet, just UI).

**Dependencies:** Slice 2

**Files to create:**

### `src/components/chat/Chat.tsx`
```typescript
// Chat container
// - Message list
// - Input field
// - Send button
// Props:
// - messages: Array<{role: 'user' | 'assistant', content: string}>
// - onSend: (message: string) => void
// - isLoading: boolean
```

### `src/components/chat/Message.tsx`
```typescript
// Single message bubble
// - User messages: right-aligned, muted background
// - Assistant messages: left-aligned, includes code blocks with "Apply" button
```

### `src/components/chat/CodeSuggestion.tsx`
```typescript
// Renders code block from assistant with:
// - Syntax highlighted code
// - "Apply" button
// - "Copy" button
// Props:
// - code: string
// - onApply: (code: string) => void
```

### `src/components/layout/SplitPane.tsx`
```typescript
// Resizable split pane
// - Left: Editor
// - Right: Chat
// - Draggable divider
// - Remembers size in localStorage
```

### Update `src/app/(main)/page.tsx`
- Use SplitPane layout
- Wire up chat state (messages array)
- Pass `onApply` to replace editor content

**Implementation Notes:**

1. For split pane, use CSS grid or flexbox with a draggable divider. Keep it simple — no library needed:
```typescript
const [splitRatio, setSplitRatio] = useState(0.6); // 60% editor, 40% chat
```

2. Message state structure:
```typescript
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  codeBlocks?: Array<{ code: string; language: string }>;
};
```

3. For code blocks in assistant messages, parse markdown code fences and render with Apply button.

**Acceptance Criteria:**
- [ ] Split pane shows editor on left, chat on right
- [ ] Divider can be dragged to resize
- [ ] Can type and send messages (appear in list)
- [ ] Code blocks render with syntax highlighting
- [ ] "Apply" button replaces editor content
- [ ] Layout looks clean and minimal (dark theme)

---

## Slice 4: LLM Integration

**Goal:** Chat connected to OpenRouter, streaming responses.

**Dependencies:** Slice 3

**Files to create:**

### `src/app/api/chat/route.ts`
```typescript
// POST handler
// - Receives messages array
// - Gets API key from request headers or user session
// - Calls OpenRouter with streaming
// - Returns streamed response
```

### `src/lib/strudel/reference.ts`
```typescript
// Condensed Strudel API reference for system prompt
// Export as string constant (~5-8k tokens)
// Include: core functions, modifiers, effects, mini-notation
```

### `src/lib/ai/system-prompt.ts`
```typescript
// System prompt for Lunette assistant
// - Role: music teacher using Strudel
// - Include Strudel API reference
// - Instructions for code suggestions
// - Tone: encouraging, educational
```

### `src/app/(main)/settings/page.tsx`
```typescript
// Settings page
// - API key input (stored in localStorage)
// - Model selection (optional)
```

### Update `src/app/(main)/page.tsx`
- Fetch to /api/chat with messages
- Handle streaming response
- Update messages state as chunks arrive

**Implementation Notes:**

1. AI SDK v5 uses new streaming patterns:
```typescript
import { streamText } from 'ai';

// Simple approach - use model string with OpenRouter base URL
const result = await streamText({
  model: openrouter('anthropic/claude-3.5-sonnet'), // or user's chosen model
  system: systemPrompt,
  messages: userMessages,
});

return result.toDataStreamResponse();
```

2. AI SDK v5 message types:
   - `UIMessage`: Source of truth for UI state (use for persistence)
   - `ModelMessage`: What gets sent to the LLM
   - Convert between them as needed

3. API key handling:
   - Store in localStorage on client
   - Send in `Authorization` header or custom header
   - Never log or persist on server

4. For OpenRouter, create a custom provider or use fetch directly:
```typescript
import { createOpenAI } from '@ai-sdk/openai';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: userApiKey, // from request header
});
```

5. System prompt structure:
```
You are Lunette, an AI music teacher that uses Strudel to teach music theory and live coding.

## Your Role
- Teach music concepts through Strudel code examples
- Explain what patterns do sonically
- Encourage experimentation and creativity
- Be warm, patient, and encouraging

## Strudel API Reference
[condensed reference here]

## Response Format
- When suggesting code, wrap in ```strudel code blocks
- Keep explanations concise but clear
- One concept at a time for beginners
```

**Acceptance Criteria:**
- [ ] Can enter API key in settings
- [ ] Sending message gets streamed response
- [ ] Response appears word-by-word
- [ ] Code blocks in responses have "Apply" button
- [ ] Applying code updates editor and can be played
- [ ] Error handling for invalid API key

---

## Slice 5: Runtime Tools

**Goal:** LLM can read and control the Strudel runtime via tool calls.

**Dependencies:** Slice 4

**Files to create:**

### `src/lib/strudel/tools.ts`
```typescript
// Tool definitions for LLM
export const strudelTools = [
  {
    name: 'evaluate_pattern',
    description: 'Evaluate Strudel code in the runtime',
    parameters: { code: 'string' },
  },
  {
    name: 'get_current_pattern',
    description: 'Get the code currently in the editor',
    parameters: {},
  },
  {
    name: 'get_error',
    description: 'Get the last error message if evaluation failed',
    parameters: {},
  },
  {
    name: 'get_playing_state',
    description: 'Check if playback is running',
    parameters: {},
  },
  {
    name: 'get_bpm',
    description: 'Get current tempo in BPM',
    parameters: {},
  },
  {
    name: 'list_samples',
    description: 'List available samples',
    parameters: {},
  },
  {
    name: 'set_bpm',
    description: 'Set tempo',
    parameters: { bpm: 'number' },
  },
  {
    name: 'play',
    description: 'Start playback',
    parameters: {},
  },
  {
    name: 'stop',
    description: 'Stop playback',
    parameters: {},
  },
];
```

### `src/app/api/runtime/route.ts`
```typescript
// POST handler for tool calls
// Receives tool name and parameters
// Returns result
// Note: This communicates with client state via response
```

### `src/hooks/useStrudelTools.ts`
```typescript
// Hook that:
// - Registers tool handlers
// - Executes tool calls from LLM
// - Returns results to chat flow
```

### Update `src/app/api/chat/route.ts`
- Add tools to OpenRouter request
- Handle tool_calls in response
- Execute tools and continue conversation

**Implementation Notes:**

1. Tool execution flow:
```
User sends message
  → API calls LLM with tools
  → LLM returns tool_call (e.g., get_current_pattern)
  → API returns tool_call to client
  → Client executes tool locally (reads editor state)
  → Client sends tool result back
  → API continues LLM conversation with result
  → LLM responds with final answer
```

2. This requires a back-and-forth between client and server. Use a state machine or recursive fetch pattern.

3. Alternative simpler approach for MVP: Send runtime state WITH each chat request:
```typescript
// Client sends:
{
  messages: [...],
  runtimeState: {
    currentPattern: "s('bd hh')",
    isPlaying: true,
    bpm: 120,
    lastError: null,
  }
}
```
Then LLM doesn't need tools to READ state, only to WRITE (play/stop/setBpm). This simplifies the architecture significantly.

**Recommendation:** Start with the simpler approach (state sent with request). Add full tool calling later if needed.

**Acceptance Criteria:**
- [ ] LLM can see what's in the editor
- [ ] LLM can check if pattern is playing
- [ ] LLM can read current BPM
- [ ] LLM can start/stop playback (with user confirmation)
- [ ] LLM can change BPM (with user confirmation)
- [ ] Errors are captured and LLM can help debug

---

## Slice 6: Authentication

**Goal:** User accounts with GitHub OAuth.

**Dependencies:** Slice 0 (can be done in parallel with Slices 1-5)

**Files to create:**

### `src/lib/db/schema.ts`
```typescript
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  githubId: text('github_id').unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
});
```

### `src/lib/db/index.ts`
```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### `src/lib/auth.ts`
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

### `src/app/api/auth/[...all]/route.ts`
```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

### `src/app/(auth)/login/page.tsx`
```typescript
// Login page with:
// - GitHub OAuth button
// - Magic link input (optional for MVP)
```

### `src/components/layout/UserMenu.tsx`
```typescript
// Shows user avatar when logged in
// Dropdown with: Settings, Logout
// Shows "Sign in" button when logged out
```

**Implementation Notes:**

1. Run Drizzle migration:
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

2. Set up GitHub OAuth app:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Callback URL: `http://localhost:3000/api/auth/callback/github`

3. Protect routes that require auth using middleware or layout checks.

**Acceptance Criteria:**
- [ ] Can click "Sign in with GitHub"
- [ ] Redirects to GitHub and back
- [ ] User created in database
- [ ] User avatar shows in header
- [ ] Can log out
- [ ] Session persists across page refresh

---

## Slice 7: Pattern Save/Load

**Goal:** Users can save and load their own patterns.

**Dependencies:** Slice 6

**Files to create:**

### `src/lib/db/schema.ts` (add)
```typescript
export const patterns = pgTable('patterns', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  originalAuthorId: uuid('original_author_id').references(() => users.id),
  forkedFromId: uuid('forked_from_id').references(() => patterns.id),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### `src/app/api/patterns/route.ts`
```typescript
// GET - List user's patterns
// POST - Create new pattern
```

### `src/app/api/patterns/[id]/route.ts`
```typescript
// GET - Get single pattern
// PUT - Update pattern
// DELETE - Delete pattern
```

### `src/components/patterns/SaveDialog.tsx`
```typescript
// Modal dialog
// - Name input
// - Public/Private toggle
// - Save button
```

### `src/components/patterns/PatternList.tsx`
```typescript
// Sidebar or dropdown showing user's patterns
// - Click to load
// - Shows name, last modified
```

### Update `src/app/(main)/page.tsx`
- Add Save button to controls
- Add pattern selector/list
- Load pattern into editor on select

**Implementation Notes:**

1. Auto-save consideration: For MVP, explicit save only. Auto-save adds complexity.

2. Pattern selector UX options:
   - Dropdown in controls bar
   - Sidebar panel (collapsible)
   - Command palette (Cmd+P)
   
   Recommend: Simple dropdown for MVP.

3. Unsaved changes warning: Show indicator when editor content differs from last saved state.

**Acceptance Criteria:**
- [ ] Can save current pattern with a name
- [ ] Can see list of saved patterns
- [ ] Can click pattern to load it
- [ ] Can update existing pattern
- [ ] Can delete pattern
- [ ] Unsaved changes indicator works

---

## Slice 8: Pattern Sharing + Forking

**Goal:** Public URLs for patterns, fork with attribution.

**Dependencies:** Slice 7

**Files to create:**

### `src/app/(main)/pattern/[id]/page.tsx`
```typescript
// Public pattern view
// - Shows code (read-only or forkable)
// - Shows author info
// - Play button
// - Fork button (if logged in)
// - "Open in editor" button
```

### `src/components/patterns/ShareDialog.tsx`
```typescript
// Modal with:
// - Public URL to copy
// - Toggle public/private
// - Social share buttons (optional)
```

### `src/components/patterns/ForkButton.tsx`
```typescript
// Creates a copy of the pattern
// Sets forkedFromId and originalAuthorId
// Opens in editor
```

### `src/components/patterns/Attribution.tsx`
```typescript
// Shows fork chain:
// "Forked from [parent] by [author]"
// "Originally by [original_author]"
```

### Update `src/app/api/patterns/route.ts`
- POST with `forkedFromId` creates a fork
- Set `originalAuthorId` by traversing fork chain

**Implementation Notes:**

1. Fork chain traversal:
```typescript
async function getOriginalAuthorId(forkedFromId: string): Promise<string> {
  const parent = await db.query.patterns.findFirst({
    where: eq(patterns.id, forkedFromId),
  });
  return parent?.originalAuthorId ?? parent?.authorId;
}
```

2. Public URL structure: `/pattern/[id]`

3. OG meta tags for social sharing:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const pattern = await getPattern(params.id);
  return {
    title: `${pattern.name} | Lunette`,
    description: `Listen to "${pattern.name}" by ${pattern.author.name}`,
    openGraph: { ... },
  };
}
```

**Acceptance Criteria:**
- [ ] Can make pattern public
- [ ] Public URL is shareable
- [ ] Visiting URL shows pattern with play button
- [ ] Can fork a pattern (logged in)
- [ ] Fork shows attribution to original
- [ ] Fork chain is preserved (fork of fork works)

---

## Slice 9: Gallery Browse

**Goal:** SoundCloud-style gallery with inline playback.

**Dependencies:** Slice 8

**Files to create:**

### `src/app/(main)/browse/page.tsx`
```typescript
// Gallery page
// - Grid/list of public patterns
// - Search/filter (optional for MVP)
// - Pagination or infinite scroll
```

### `src/components/patterns/PatternCard.tsx`
```typescript
// Card component showing:
// - Pattern name
// - Author avatar + name
// - Play/pause button (inline playback)
// - Visual indicator (waveform placeholder or animation)
// - Fork count (optional)
// - Click to open full view
```

### `src/hooks/useInlinePlayer.ts`
```typescript
// Manages inline playback
// - Only one pattern plays at a time
// - Clicking another stops the current
// - Returns { play, stop, isPlaying, currentPatternId }
```

### `src/app/api/patterns/public/route.ts`
```typescript
// GET - List public patterns
// Query params: limit, offset, sort (recent, popular)
```

**Implementation Notes:**

1. Inline playback challenge: Each card needs to be able to play, but only one Strudel instance exists. Solution:
   - Global player state
   - Card calls `playPattern(id, code)` which loads and plays
   - Currently playing card shows stop button, others show play

2. Visual representation options:
   - Simple animated bars/dots while playing
   - Static icon when not playing
   - (Post-MVP: Generate waveform preview)

3. Performance: Don't initialize Strudel until first play click (lazy init).

**Acceptance Criteria:**
- [ ] Gallery shows grid of public patterns
- [ ] Can play pattern inline (without leaving page)
- [ ] Only one pattern plays at a time
- [ ] Currently playing pattern is visually indicated
- [ ] Can click to view full pattern page
- [ ] Can fork from gallery (if logged in)

---

## Slice 10: Learning Paths

**Goal:** Structured learning with progress tracking.

**Dependencies:** Slice 6

**Files to create:**

### `src/lib/db/schema.ts` (add)
```typescript
export const userProgress = pgTable('user_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  pathId: text('path_id').notNull(),
  topicId: text('topic_id').notNull(),
  status: text('status').notNull().default('not_started'), // not_started, in_progress, completed
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
});
```

### `src/lib/curriculum/paths.ts`
```typescript
// Learning path definitions
export const learningPaths = [
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    description: 'Start here. Learn the basics of patterns and sounds.',
    topics: [
      {
        id: 'what-is-pattern',
        name: 'What is a Pattern?',
        starterCode: 's("bd")',
        systemPromptAddition: '...', // Teaching context for this topic
      },
      // ...
    ],
  },
  // ... other paths
];
```

### `src/app/(main)/learn/page.tsx`
```typescript
// Learning paths overview
// - List of paths with progress indicators
// - Expandable to show topics
// - Click topic to start
```

### `src/components/learn/PathCard.tsx`
```typescript
// Shows path name, description
// Progress bar
// Expandable topic list
```

### `src/components/learn/TopicItem.tsx`
```typescript
// Shows topic name
// Status icon (not started / in progress / completed)
// Click to start
```

### `src/app/(main)/learn/[pathId]/[topicId]/page.tsx`
```typescript
// Topic learning view
// - Same split pane (editor + chat)
// - Editor pre-loaded with starter code
// - Chat context includes topic-specific teaching prompt
// - "Mark Complete" button
```

### `src/app/api/progress/route.ts`
```typescript
// GET - Get user's progress
// POST - Update progress (start topic, complete topic)
```

**Implementation Notes:**

1. Progress state machine:
```
not_started → in_progress → completed
                    ↑
                    └── (can revisit)
```

2. Topic-specific system prompt:
```typescript
const systemPrompt = `
${baseSystemPrompt}

## Current Lesson: ${topic.name}

The user is learning about ${topic.description}.
Guide them through this concept step by step.
Their editor has this starter code: ${topic.starterCode}

Focus on:
${topic.learningObjectives.join('\n')}
`;
```

3. Completion criteria: For MVP, manual "Mark Complete". Later: LLM judges understanding, or challenges.

4. Progress persistence: Save to database, load on app start.

**Acceptance Criteria:**
- [ ] Can see all learning paths
- [ ] Progress shows on each path
- [ ] Can click topic to start learning
- [ ] Editor loads starter code
- [ ] Chat is contextualized for topic
- [ ] Can mark topic complete
- [ ] Progress persists across sessions

---

## Slice 11: Polish + Launch Prep

**Goal:** Production-ready quality.

**Dependencies:** All previous slices

**Tasks:**

### Error Handling
- [ ] Global error boundary
- [ ] Friendly error messages for common issues
- [ ] API error handling with user feedback
- [ ] Strudel syntax error display

### Loading States
- [ ] Skeleton loaders for gallery
- [ ] Loading spinner for chat responses
- [ ] Strudel initialization state

### Responsive Design
- [ ] Mobile: Stack panes vertically
- [ ] Tablet: Collapsible chat
- [ ] Handle small screens gracefully (even if not optimized)

### Performance
- [ ] Lazy load non-critical components
- [ ] Optimize Strudel bundle (dynamic import)
- [ ] Image optimization for avatars

### Accessibility
- [ ] Keyboard navigation in editor
- [ ] ARIA labels on controls
- [ ] Focus management in modals

### SEO + Meta
- [ ] OG tags for shared patterns
- [ ] Proper page titles
- [ ] Favicon

### Analytics (optional)
- [ ] Basic usage tracking
- [ ] Error tracking (Sentry or similar)

### Documentation
- [ ] README with setup instructions
- [ ] Environment variable documentation
- [ ] Contributing guide (if open source)

### Deployment
- [ ] Vercel project setup
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Custom domain (if ready)

**Acceptance Criteria:**
- [ ] No console errors in production
- [ ] Works on Chrome, Firefox, Safari
- [ ] Graceful degradation on mobile
- [ ] Shared links show preview cards
- [ ] 404 page exists
- [ ] Site loads in under 3 seconds

---

## Implementation Order Summary

```
Week 1-2:   Slice 0 (Setup) + Slice 1 (Editor+Sound) + Slice 2 (Playhead)
Week 3:     Slice 3 (Split Pane + Chat UI)
Week 4:     Slice 4 (LLM Integration)
Week 5:     Slice 5 (Runtime Tools) + Slice 6 (Auth) [parallel]
Week 6:     Slice 7 (Save/Load)
Week 7:     Slice 8 (Sharing + Fork)
Week 8:     Slice 9 (Gallery)
Week 9:     Slice 10 (Learning Paths)
Week 10-11: Slice 11 (Polish)
Week 12:    Buffer + Launch
```

---

## Notes for AI Assistant

When implementing each slice:

1. **Read the full slice before starting.** Understand the acceptance criteria.

2. **Create files in order listed.** Dependencies matter.

3. **Test after each file.** Don't move on until it works.

4. **Commit after each slice.** Clean git history.

5. **Ask clarifying questions** if requirements are ambiguous.

6. **Keep code simple.** Avoid over-engineering. This is an MVP.

7. **Match existing patterns.** Look at completed slices for conventions.

8. **When stuck**, refer back to PRD for context and intent.

---

*End of implementation plan.*
