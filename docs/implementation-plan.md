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
| shadcn/ui | latest | Component library (Radix + Tailwind) |
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

# UI Components (shadcn/ui)
pnpm dlx shadcn@latest init --defaults
pnpm dlx shadcn@latest add button input
# Add more components as needed: dialog, dropdown-menu, tabs, etc.
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
OPENROUTER_API_KEY=
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
- [x] `pnpm dev` runs without errors
- [x] Dark background visible at localhost:3000
- [x] All dependencies installed at correct versions
- [x] No TypeScript errors

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
- [x] Editor displays with syntax highlighting
- [x] Typing code works
- [x] Cmd+Enter evaluates code
- [x] `s("bd hh sd hh").play()` produces sound
- [x] Play/Stop buttons work
- [x] BPM can be changed

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
- [x] Playing `s("bd hh sd hh")` highlights each sound as it plays
- [x] Highlights clear when playback stops
- [x] Highlights sync accurately with audio (no noticeable lag)
- [x] Multiple simultaneous highlights work (for stacked patterns)

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
- [x] Split pane shows editor on left, chat on right
- [x] Divider can be dragged to resize
- [x] Can type and send messages (appear in list)
- [x] Code blocks render with syntax highlighting
- [x] "Apply" button replaces editor content
- [x] Layout looks clean and minimal (dark theme)

---

## Slice 4: LLM Integration

**Goal:** Chat connected to OpenRouter, streaming responses.

**Dependencies:** Slice 3

**Files to create:**

### `src/app/api/chat/route.ts`
```typescript
// POST handler
// - Requires authentication (return 401 if not logged in)
// - Receives messages array
// - Uses server-side OPENROUTER_API_KEY
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
// - User preferences (future: theme, etc.)
// - Account info display
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
   - Use server-side `OPENROUTER_API_KEY` environment variable
   - Require authentication before allowing chat requests

4. For OpenRouter, create a custom provider:
```typescript
import { createOpenAI } from '@ai-sdk/openai';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
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
- [x] Unauthenticated users see prompt to sign in for AI chat
- [x] Authenticated users can send messages
- [x] Sending message gets streamed response
- [x] Response appears word-by-word
- [x] Applying code updates editor and can be played

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
- [x] LLM can see what's in the editor
- [x] LLM can check if pattern is playing
- [x] LLM can read current BPM
- [x] LLM can start/stop playback (no confirmation needed for playback controls)
- [x] LLM can change BPM (no confirmation needed for BPM)
- [x] Errors are captured and LLM can help debug

**Implementation Notes (Actual):**

We implemented using the AI SDK v5 properly with OpenAI:
1. Runtime state is sent WITH each chat request via `sendMessage` options
2. LLM can READ state from the system prompt context
3. LLM can control playback via tools (set_bpm, play, stop) - but NOT modify editor
4. Tool calls are executed client-side via `onToolCall` callback

**Important Design Decision:** The AI cannot directly modify the editor. Code suggestions are provided in markdown code blocks, and users click "Apply" or "Play" to use them. This prevents unwanted code changes.

Available tools (playback control only):
- `set_bpm` - Change tempo
- `play` - Start playback of current editor content
- `stop` - Stop playback

Files created/modified:
- `lib/strudel/tools.ts` - RuntimeState type definition
- `lib/ai/system-prompt.ts` - Added buildSystemPrompt() with runtime state context and tool instructions
- `app/api/chat/route.ts` - Uses AI SDK's `streamText` with OpenAI provider and tool definitions
- `app/page.tsx` - Uses `useChat` with `onToolCall` callback for client-side tool execution

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
- [x] Can click "Sign in with GitHub"
- [x] Redirects to GitHub and back
- [x] User created in database
- [x] User avatar shows in header
- [x] Can log out
- [x] Session persists across page refresh

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
- [x] Can save current pattern with a name
- [x] Can see list of saved patterns
- [x] Can click pattern to load it
- [x] Can update existing pattern
- [x] Can delete pattern
- [x] Unsaved changes indicator works

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
- [x] Can make pattern public
- [x] Public URL is shareable
- [x] Visiting URL shows pattern with play button
- [x] Can fork a pattern (logged in)
- [x] Fork shows attribution to original
- [x] Fork chain is preserved (fork of fork works)

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
- [x] Gallery shows grid of public patterns
- [x] Can play pattern inline (without leaving page)
- [x] Only one pattern plays at a time
- [x] Currently playing pattern is visually indicated
- [x] Can click to view full pattern page
- [x] Can fork from gallery (if logged in)

---

## Slice 9.5: UX Refactor

**Goal:** Restructure navigation and pages for a cleaner user experience. Add waveform visualizations to pattern cards.

**Dependencies:** Slice 9

**Summary of Changes:**

| Route | Purpose |
|-------|---------|
| `/` | Redirects to `/browse` (community patterns) |
| `/gallery` | User's personal patterns + "Create New" button |
| `/editor/new` | New pattern (saves → URL becomes `/editor/[id]`) |
| `/editor/[id]` | Editable pattern view (owner only) |
| `/pattern/[id]` | Read-only view (same layout as editor, with AI chat) |

**Removed:**
- Current pattern detail page design (replaced with editor-style layout)
- "Edit Pattern" button (redundant with "Open in Editor")
- Pattern selector dropdown at bottom of editor (use `/gallery` instead)
- `/` as main editor route

---

### Files to create:

### `src/app/(main)/gallery/page.tsx`
```typescript
// User's personal pattern gallery
// - Grid of user's patterns with waveform cards
// - "Create New Pattern" button → navigates to /editor/new
// - Empty state for users with no patterns
// - Requires authentication (redirect to login if not)
```

### `src/app/(main)/editor/new/page.tsx`
```typescript
// New pattern editor
// - Same layout as /editor/[id]
// - Starts with default starter code
// - On first save: creates pattern in DB, updates URL to /editor/[id]
// - Uses window.history.replaceState to update URL without navigation
```

### `src/app/(main)/editor/[id]/page.tsx`
```typescript
// Editable pattern view (owner only)
// - Full split-pane layout (code + chat)
// - Editable CodeMirror editor with playhead highlighting
// - Save button updates existing pattern
// - If not owner, redirect to /pattern/[id]
```

### `src/components/patterns/Waveform.tsx`
```typescript
// Waveform visualization component
// Props:
// - data: number[] (amplitude values 0-1)
// - progress: number (0-1, playhead position)
// - onSeek?: (position: number) => void
// - isPlaying: boolean
// - height?: number
// - barWidth?: number
// - barGap?: number
//
// Features:
// - Renders as SVG or Canvas
// - Shows playhead line at current position
// - Click to seek (if onSeek provided)
// - Played portion highlighted differently than unplayed
```

### `src/lib/audio/waveform.ts`
```typescript
// Waveform generation using pattern approximation
//
// generateWaveform(code: string, options?: WaveformOptions): number[]
// - Evaluates Strudel pattern and queries events (haps)
// - Extracts timing and velocity/intensity from events
// - Returns array of amplitude values (0-1) based on event density/intensity
// - Options: { duration: number, barsCount: number }
//
// Default: 30 seconds or 4 cycles, whichever is shorter
// Returns ~100 amplitude values for visualization
//
// This is instant (no audio rendering) - pattern structure only
```

### `src/hooks/useWaveformPlayer.ts`
```typescript
// Enhanced inline player with waveform support
// - Extends useInlinePlayer functionality
// - Tracks playback progress (0-1) for playhead position
// - Supports seek to position
// - Returns { play, stop, seek, isPlaying, progress, currentPatternId }
```

---

### Files to modify:

### `src/app/page.tsx`
```typescript
// Change from main editor to redirect
// - Redirect to /browse
// - Can use Next.js redirect() or client-side router.push
```

### `src/app/(main)/pattern/[id]/page.tsx`
```typescript
// Complete rewrite to editor-style layout
// - Same split-pane as editor (code left, chat right)
// - Header bar with: pattern name, "by [author] | created [date]"
// - Read-only CodeMirror editor with playhead highlighting
// - Fork button (if authenticated and not owner)
// - "Open in Editor" button (if owner, goes to /editor/[id])
// - Ephemeral AI chat (not saved to DB)
// - Play/Stop controls, BPM display
```

### `src/app/(main)/browse/page.tsx`
```typescript
// Update to use waveform cards
// - Replace code preview with Waveform component
// - Add progress tracking for currently playing pattern
// - Click waveform to seek
```

### `src/components/patterns/PatternCard.tsx`
```typescript
// Replace code preview with waveform
// - Show Waveform component instead of code snippet
// - Pass playback progress for playhead
// - Handle seek clicks on waveform
// - Keep: name, author, play/stop, fork button
```

### `src/components/editor/Controls.tsx`
```typescript
// Remove pattern selector (PatternList dropdown)
// - Keep: Play, Stop, Evaluate, BPM, Save, Share buttons
// - Users access patterns from /gallery instead
```

### `src/lib/db/schema.ts`
```typescript
// Add waveform data column to patterns table
export const patterns = pgTable('patterns', {
  // ... existing columns
  waveformData: text('waveform_data'), // JSON stringified array of amplitudes
});
```

### `src/app/api/patterns/route.ts`
```typescript
// Update POST to generate waveform on save
// - After saving pattern, generate waveform data
// - Store in waveformData column
// - Return waveform data in response
```

---

### Implementation Notes:

1. **Waveform Generation Strategy (Pattern Approximation):**
   - Evaluate Strudel pattern and query events using `pattern.queryArc(0, duration)`
   - Each event (hap) has timing (`whole.begin`, `whole.end`) and value (velocity, etc.)
   - Divide duration into ~100 time slices
   - For each slice, calculate amplitude based on event density and intensity
   - Instant generation (no audio rendering needed)
   - Store as JSON array in DB

2. **Waveform Rendering:**
   - SVG bars (simpler) or Canvas (if performance needed)
   - ~100 bars, each bar height = event density/intensity in that time slice
   - Played portion: full opacity cyan
   - Unplayed portion: 30% opacity gray
   - Playhead: vertical line at current position

3. **Progress Tracking:**
   - Track `audioContext.currentTime` relative to pattern start
   - Normalize to 0-1 based on waveform duration
   - Loop back to 0 when pattern cycles

4. **Seek Implementation:**
   - Calculate position from click x-coordinate
   - Strudel may need to restart from that position
   - If seeking not feasible with Strudel, make waveform click-to-play-from-start only

5. **URL Update on New Pattern Save:**
   ```typescript
   // After successful save with new ID
   window.history.replaceState(null, '', `/editor/${newPatternId}`);
   ```

6. **Read-only Editor Mode:**
   - CodeMirror supports `EditorView.editable.of(false)`
   - Keep playhead highlighting working
   - Disable keyboard shortcuts for evaluation

7. **Ephemeral Chat:**
   - Don't save messages to DB
   - Clear on page leave
   - Use same chat UI components, just don't persist

---

**Acceptance Criteria:**
- [x] `/` redirects to `/browse`
- [x] `/gallery` shows user's patterns (waveform cards deferred)
- [x] `/gallery` has "Create New Pattern" button
- [x] `/editor/new` works for creating new patterns
- [x] First save updates URL to `/editor/[id]`
- [x] `/editor/[id]` is editable for pattern owner
- [x] `/editor/[id]` redirects non-owners to `/pattern/[id]`
- [x] `/pattern/[id]` shows read-only editor-style layout
- [x] `/pattern/[id]` has working playhead highlighting
- [x] `/pattern/[id]` shows "by [author] | created [date]"
- [x] `/pattern/[id]` has Fork button (creates copy → `/editor/[newId]`)
- [x] `/pattern/[id]` has ephemeral AI chat
- [ ] Browse page shows waveforms instead of code
- [ ] Gallery page shows waveforms instead of code
- [ ] Playhead moves across waveform during playback
- [ ] Can click waveform to seek (or play from start if seek not feasible)
- [x] Pattern selector removed from editor controls

**Implementation Notes (Actual):**

The navigation restructure and core UX refactor is complete. Waveform visualization features remain unimplemented and can be addressed in a future slice. Key files:
- `app/page.tsx` - Redirects to `/browse`
- `app/(main)/gallery/page.tsx` - User's pattern gallery with inline playback
- `app/(main)/editor/new/page.tsx` - New pattern creation with URL update on save
- `app/(main)/editor/[id]/page.tsx` - Editable pattern view (owner only)
- `app/(main)/pattern/[id]/page.tsx` - Read-only view with fork button and ephemeral chat

Database schema includes `waveformData` column in patterns table, ready for future waveform implementation.

---

## Slice 9.7: Reference Tab

**Goal:** Interactive reference panel for browsing Strudel functions, inspired by strudel.cc's built-in documentation.

**Dependencies:** Slice 3 (Split Pane + Chat UI)

**Reference:** [strudel.cc Functions](https://strudel.cc/functions/intro/), [@strudel/reference package](https://www.npmjs.com/package/@strudel/reference)

---

### Overview

Add a tabbed interface to the right panel where users can switch between Chat and Reference. The Reference tab provides searchable, categorized documentation for all Strudel functions with playable/copyable examples (reusing the `CodeSuggestion` component from chat).

---

### Files to create:

### `src/lib/strudel/function-reference.ts`
```typescript
// Structured function reference data
//
// Types:
export interface FunctionExample {
  code: string;
  description?: string;
}

export interface FunctionDef {
  name: string;
  description: string;
  signature?: string; // e.g., "s(pattern: string)"
  examples: FunctionExample[];
  aliases?: string[];
  related?: string[];
}

export interface Category {
  name: string;
  description?: string;
  functions: FunctionDef[];
}

// Categories to include:
// - Sound Sources (s, sound, note, n, synth sounds)
// - Mini Notation (syntax reference)
// - Pattern Modifiers (fast, slow, rev, etc.)
// - Effects (lpf, hpf, delay, room, etc.)
// - Layering (stack, cat, seq)
// - Randomness (sometimes, rarely, shuffle, etc.)
// - Signals (sine, saw, rand, perlin)

export const FUNCTION_REFERENCE: Category[] = [
  // ... populated with function data
];
```

### `src/components/reference/ReferencePanel.tsx`
```typescript
// Main reference panel container
// Props:
// - onPlay: (code: string) => void
// - onStop: () => void
// - playingCode: string | null
//
// Features:
// - Search input at top (filters functions by name/description)
// - Category sections (collapsible)
// - Scrollable function list
// - When searching: show flat list of matching functions
// - When not searching: show categorized view
```

### `src/components/reference/CategorySection.tsx`
```typescript
// Collapsible category section
// Props:
// - category: Category
// - isExpanded: boolean
// - onToggle: () => void
// - searchQuery: string (for highlighting matches)
// - onPlay: (code: string) => void
// - onStop: () => void
// - playingCode: string | null
//
// Features:
// - Chevron icon for expand/collapse
// - Function count badge
// - Lists FunctionCard components when expanded
```

### `src/components/reference/FunctionCard.tsx`
```typescript
// Individual function documentation card
// Props:
// - fn: FunctionDef
// - onPlay: (code: string) => void
// - onStop: () => void
// - playingCode: string | null
// - defaultExpanded?: boolean
//
// Features:
// - Function name (clickable to expand/collapse)
// - Signature display (if provided)
// - Expandable description
// - Examples rendered using CodeSuggestion component (Play + Copy buttons)
// - Aliases shown if present
// - Related functions as links
```

### `src/components/layout/RightPanel.tsx`
```typescript
// Tabbed container for Chat and Reference
// Props:
// - activeTab: 'chat' | 'reference'
// - onTabChange: (tab: 'chat' | 'reference') => void
// - children: React.ReactNode (chat content)
// - onPlay: (code: string) => void
// - onStop: () => void
// - playingCode: string | null
//
// Features:
// - Tab bar at top: Chat | Reference
// - Renders Chat children or ReferencePanel based on active tab
// - Persists active tab to localStorage
```

---

### Files to modify:

### `src/app/(main)/editor/[id]/page.tsx`
```typescript
// Replace direct Chat with RightPanel
// - Wrap Chat in RightPanel
// - Pass onPlay/onStop/playingCode for reference examples
// - Handle tab state
```

### `src/app/(main)/editor/new/page.tsx`
```typescript
// Same changes as editor/[id]/page.tsx
```

### `src/app/(main)/pattern/[id]/page.tsx`
```typescript
// Same changes for read-only view
// - Reference tab works the same (examples are playable)
```

---

### Implementation Notes:

1. **Data Source:**
   - Start with curated reference data based on existing `lib/strudel/reference.ts`
   - Can migrate to `@strudel/reference` package later if needed
   - Focus on most commonly used functions first

2. **Search Implementation:**
   - Search function names and descriptions (case-insensitive substring match)
   - Highlight matches in results
   - Show results as flat list when searching (ignore categories)
   - Clear button to reset search

3. **Reuse CodeSuggestion Component:**
   - Examples use existing `components/chat/CodeSuggestion.tsx`
   - Already has Play/Stop and Copy functionality
   - Provides consistent UX between chat and reference

4. **Styling:**
   - Match existing dark theme
   - Use consistent spacing and typography
   - Tab bar styled to match chat header

---

**Acceptance Criteria:**
- [x] Right panel has Chat and Reference tabs
- [x] Reference tab shows searchable function list
- [x] Functions organized by category (collapsible sections)
- [x] Each function shows name, description, and examples
- [x] Examples are playable (Play/Stop buttons via CodeSuggestion)
- [x] Examples are copyable (Copy button via CodeSuggestion)
- [x] Search filters functions by name and description
- [x] Search shows flat results, clearing search restores categories
- [x] Tab preference persists across sessions

---

## Slice 10: Retrospective Learning

**Goal:** Discovery-based learning where AI surfaces theory from user creations, not prescriptive curriculum.

**Dependencies:** Slice 8 (Forking), Slice 9 (Gallery)

**Pedagogical Foundation (from BrainLift):**

| Principle | Implementation |
|-----------|----------------|
| **Retrospective Theory** | AI analyzes user's code and explains the music theory already present |
| **Non-Linear Discovery** | No fixed curriculum; concepts surface organically from user's work |
| **Emergent Complexity** | Users generate sophisticated patterns immediately; AI helps them understand why it sounds good |
| **Remix Culture** | Forking is the primary learning mechanism; study by modifying |
| **Wide Walls** | Support diverse pathways; rhythm, melody, harmony, sound design all equally valid entry points |

---

### Core Features

**1. Pattern Analysis ("What Am I Hearing?")**
- User creates or forks a pattern
- AI can analyze and explain: "This pattern uses a 4-on-the-floor rhythm with syncopated hi-hats. The `.fast(2)` doubles the tempo of that element..."
- Theory is discovered, not prescribed

**2. Concept Tagging**
- Patterns in gallery are auto-tagged with concepts they demonstrate
- Tags: `syncopation`, `polyrhythm`, `chord-progression`, `call-response`, `phasing`, etc.
- Users can browse gallery by concept to find examples

**3. "Explain This" Button**
- In editor and pattern view, button triggers AI analysis of current code
- AI identifies and labels music theory concepts present
- Links to related patterns in gallery that use similar concepts

**4. Curated Starting Points (optional structure for those who want it)**
- Not a curriculum, but a gallery of "starter patterns" organized loosely by complexity
- Each starter pattern has AI context about what concepts it demonstrates
- Users fork and modify, AI explains what their changes do musically

---

### Files to Create

### `src/lib/db/schema.ts` (add)
```typescript
export const conceptTags = pgTable('concept_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  patternId: uuid('pattern_id').references(() => patterns.id).notNull(),
  concept: text('concept').notNull(), // e.g., 'syncopation', 'polyrhythm'
  confidence: real('confidence').default(1.0), // AI confidence score
  createdAt: timestamp('created_at').defaultNow(),
});

// Track which concepts a user has encountered (discovered, not "completed")
export const userDiscoveries = pgTable('user_discoveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  concept: text('concept').notNull(),
  firstSeenAt: timestamp('first_seen_at').defaultNow(),
  patternId: uuid('pattern_id').references(() => patterns.id), // pattern where they first encountered it
});
```

### `src/lib/ai/analysis-prompt.ts`
```typescript
// System prompt for pattern analysis mode
// Instructs AI to:
// - Identify music theory concepts present in code
// - Explain in accessible language (for teenagers)
// - Connect to sonic result ("this is why it sounds like...")
// - Suggest modifications to explore variations
// - Link concepts to their proper names (retrospective labeling)
```

### `src/lib/concepts/index.ts`
```typescript
// Concept taxonomy for tagging
export const concepts = {
  rhythm: ['syncopation', 'polyrhythm', 'swing', 'euclidean', 'phasing', 'four-on-floor'],
  melody: ['scale', 'arpeggio', 'chord-tones', 'passing-tones', 'call-response'],
  harmony: ['chord-progression', 'parallel-harmony', 'drone', 'tension-release'],
  structure: ['repetition', 'variation', 'layering', 'builds', 'drops'],
  texture: ['density', 'space', 'contrast', 'timbre-blend'],
  code: ['functions', 'randomness', 'conditionals', 'pattern-composition'],
};

// Human-readable explanations for each concept
export const conceptDescriptions: Record<string, string> = {
  syncopation: "Accents on unexpected beats—the 'off-beat' feel that makes music groove",
  polyrhythm: "Two or more conflicting rhythms playing at once",
  // ...
};
```

### `src/components/learn/ExplainButton.tsx`
```typescript
// "What am I hearing?" button
// - Sends current code + "analyze this pattern" prompt to AI
// - Displays analysis in chat or modal
// - Highlights concepts found
// - Records discoveries to user profile
```

### `src/components/learn/ConceptBadge.tsx`
```typescript
// Small badge showing a concept tag
// - Hover for description
// - Click to browse patterns with same concept
```

### `src/app/(main)/explore/page.tsx`
```typescript
// Concept-organized gallery view
// - Grid of concept categories (rhythm, melody, harmony, etc.)
// - Each category shows patterns that demonstrate it
// - "Starter Patterns" section with low-complexity examples
// - No progress bars, no completion states
```

### `src/app/(main)/explore/[concept]/page.tsx`
```typescript
// Patterns filtered by concept
// - Gallery of patterns tagged with this concept
// - AI-generated description of the concept
// - "Try it yourself" - opens editor with a minimal example
```

### `src/components/learn/DiscoveryLog.tsx`
```typescript
// Optional: shows concepts user has encountered
// - Not a "progress" tracker, but a "discovery journal"
// - "You've explored: syncopation, layering, euclidean rhythms..."
// - Framed as exploration, not completion
```

### `src/app/api/analyze/route.ts`
```typescript
// POST - Analyze a pattern
// - Receives code
// - Returns: { concepts: string[], explanation: string, suggestions: string[] }
// - Optionally auto-tags pattern if user saves
```

---

### Implementation Notes

1. **System Prompt:**
   - See [`docs/ai-system-prompt.md`](./ai-system-prompt.md) for the full AI teacher prompt
   - Implements the BrainLift pedagogy: retrospective theory, no gatekeeping, code-as-instrument
   - Includes scenario examples and analysis mode extension
   - Update `src/lib/ai/system-prompt.ts` to use this prompt (replaces basic Slice 4 prompt)

2. **Auto-tagging Flow:**
   - When user saves a public pattern, run analysis in background
   - Extract concept tags and store with confidence scores
   - Use for gallery filtering and recommendations

3. **Discovery vs. Progress:**
   - We track discoveries (concepts encountered) not completions
   - No "mark complete" - exploration is ongoing
   - Optional "discovery journal" shows breadth of exploration

4. **Starter Patterns:**
   - Curated patterns that clearly demonstrate single concepts
   - Labeled with "Good for exploring: [concept]"
   - Fork-first workflow: user forks, modifies, asks AI what changed

5. **Forking as Pedagogy:**
   - When user forks a pattern, AI can offer: "Want me to explain what this pattern is doing?"
   - Changes are diffed: "You changed X, which made the rhythm feel more syncopated because..."

---

**Acceptance Criteria:**
- [ ] "Explain This" button triggers AI analysis of current pattern
- [x] Analysis identifies and names music theory concepts present
- [x] Patterns can be tagged with concepts (auto or manual)
- [x] Gallery can be filtered by concept
- [x] `/explore` page shows concept-organized view
- [x] Concept badges link to related patterns
- [x] User discoveries are tracked (optional, non-prescriptive)
- [x] Starter patterns section provides low-complexity entry points
- [x] AI explains changes when user modifies forked patterns

---

## Slice 10.5: Strudel Docs Tooltips

**Goal:** Hover over any Strudel function in the editor to see its documentation, signature, and a quick example.

**Dependencies:** Slice 9.7 (Reference Tab - provides `FUNCTION_REFERENCE` data)

---

### Overview

When users hover over function names like `fast`, `jux`, or `lpf` in the editor, a tooltip appears above the code showing:
- Function signature (e.g., `fast(factor: number)`)
- Brief description
- "See Reference tab for examples" link

This provides inline documentation without leaving the editor, complementing the Reference tab.

---

### Files to Create

### `src/components/editor/strudelDocsExtension.ts`
```typescript
// CodeMirror extension for Strudel function documentation tooltips

import { hoverTooltip } from '@codemirror/view';
import { FUNCTION_REFERENCE, type FunctionDef } from '@/lib/strudel/function-reference';

// createStrudelDocsExtension(options: {
//   enabled: boolean;
// }): Extension[]
//
// Features:
// - Uses CodeMirror's hoverTooltip() extension
// - Parses token under cursor (word boundary detection)
// - Matches against function names in FUNCTION_REFERENCE
// - Also checks aliases (e.g., "sound" → "s")
// - Returns tooltip DOM with signature + description
// - Tooltip positioned above code (VS Code style)
```

### `src/components/editor/DocsTooltip.tsx`
```typescript
// React component for rendering docs tooltip content

// Props:
// - fn: FunctionDef
//
// Features:
// - Shows function name + signature
// - Brief description (first sentence or ~100 chars)
// - Styled with monospace font
// - Max width ~300px
// - "See Reference tab" hint at bottom
```

### `src/hooks/useDocsTooltip.ts`
```typescript
// Hook for managing docs tooltip settings

// interface UseDocsTooltipReturn {
//   enabled: boolean;
//   setEnabled: (enabled: boolean) => void;
// }
//
// Features:
// - Persists to localStorage: 'lunette-docs-tooltip-enabled'
// - Default: enabled
```

### `src/components/editor/DocsToggle.tsx`
```typescript
// Toggle button for editor toolbar

// Props:
// - enabled: boolean
// - onChange: (enabled: boolean) => void
//
// Features:
// - Icon button (book or info icon)
// - Tooltip: "Function Docs on Hover"
// - Persists to localStorage
```

---

### Files to Modify

### `src/components/editor/Editor.tsx`
```typescript
// Add docs tooltip extension to CodeMirror

// Changes:
// - Accept docsEnabled prop: boolean
// - Add createStrudelDocsExtension() to extensions array
// - Reconfigure extension when docsEnabled changes
```

### `src/components/editor/Controls.tsx`
```typescript
// Add DocsToggle to toolbar

// Changes:
// - Add DocsToggle component (right side, near other toggles)
// - Pass enabled state and onChange handler
```

### `src/app/(main)/editor/new/page.tsx`
```typescript
// Integrate docs tooltip hook

// Changes:
// - Add useDocsTooltip() hook
// - Pass docsEnabled to Editor component
// - Pass toggle props to Controls
```

### `src/app/(main)/editor/[id]/page.tsx`
```typescript
// Same changes as editor/new/page.tsx
```

### `src/app/(main)/pattern/[id]/page.tsx`
```typescript
// Docs tooltips work in read-only view too
```

### `src/app/globals.css`
```css
/* Add docs tooltip styles */

.cm-docs-tooltip {
  background: var(--color-neutral-800);
  border: 1px solid var(--color-neutral-700);
  border-radius: 6px;
  padding: 8px 12px;
  max-width: 300px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.cm-docs-tooltip__signature {
  color: var(--color-brand-400);
  font-weight: 500;
  margin-bottom: 4px;
}

.cm-docs-tooltip__description {
  color: var(--color-subtext);
}

.cm-docs-tooltip__hint {
  color: var(--color-subtext);
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.7;
}
```

---

### Implementation Notes

1. **Token Detection:**
   ```typescript
   // Use CodeMirror's syntaxTree or simple word boundary regex
   // Get word at hover position
   // Match against FUNCTION_REFERENCE function names and aliases
   ```

2. **Building Function Lookup Map:**
   ```typescript
   // On init, build a flat map for O(1) lookup:
   const functionMap = new Map<string, FunctionDef>();
   for (const category of FUNCTION_REFERENCE) {
     for (const fn of category.functions) {
       functionMap.set(fn.name, fn);
       fn.aliases?.forEach(alias => functionMap.set(alias, fn));
     }
   }
   ```

3. **Tooltip Positioning:**
   ```typescript
   // hoverTooltip returns { pos, above: true, create: () => DOM }
   // Position above by default
   // CodeMirror handles viewport edge cases
   ```

4. **Debounce:**
   - CodeMirror's hoverTooltip has built-in delay (~300ms default)
   - No additional debouncing needed

---

**Acceptance Criteria:**
- [ ] Hovering over Strudel function shows tooltip above code
- [ ] Tooltip shows function signature and description
- [ ] Tooltip matches aliases (e.g., hover "sound" shows "s" docs)
- [ ] Toggle button in toolbar enables/disables tooltips
- [ ] Toggle state persists across sessions (localStorage)
- [ ] Works in editor and read-only pattern view
- [ ] Tooltip styling matches app design system

---

## Slice 10.6: AI Code Annotations

**Goal:** AI-generated pedagogical annotations that highlight interesting parts of the user's code with contextual insights.

**Dependencies:** Slice 10.5 (Strudel Docs Tooltips - provides tooltip infrastructure), Slice 10 (Retrospective Learning)

**Pedagogical Foundation:**
- Annotations use BrainLift "retrospective theory" style: label what they hear, don't lecture
- AI points out interesting patterns and explains why they sound the way they do
- Uses "we" language (collaborator, not teacher)

---

### Overview

As users write code, the AI periodically analyzes their pattern and highlights interesting sections with dotted underlines. Hovering over a highlighted section shows a pedagogical insight like:

> "We're doubling the speed here—hear how it creates urgency?"

This complements the Strudel docs tooltips (Slice 10.5) with contextual, creative insights.

---

### Two Tooltip Layers (Combined with 10.5)

| Layer | Trigger | Source | Style | Visual |
|-------|---------|--------|-------|--------|
| **Strudel Docs** (10.5) | Hover any function | `FUNCTION_REFERENCE` | Technical/neutral | Standard tooltip |
| **AI Annotations** (10.6) | Hover highlighted region | AI analysis | Pedagogical/creative | Dotted underline + tooltip |

These layers coexist—hovering over an AI-annotated `jux()` call can show both tooltips.

---

### Analysis Trigger Logic

```typescript
// Trigger AI analysis when ANY of:
// 1. Newline typed
// 2. Closing paren `)` followed by whitespace, newline, or `.`
// 3. 3 seconds of idle time (fallback for single-line patterns)

// AND:
// - Minimum 15 characters changed since last analysis
// - Annotations toggle is enabled
```

### Annotation Persistence

- Annotations persist until the code in that region changes significantly
- "Significant change" = any edit within the annotation's character range
- Annotations outside the edited region remain valid
- Full re-analysis on major code changes (>50% of code modified)

---

### Files to Create

### `src/lib/annotations/types.ts`
```typescript
// Annotation type definitions

export interface Annotation {
  id: string;
  from: number;          // Character offset start
  to: number;            // Character offset end
  text: string;          // Pedagogical insight text
  concept?: string;      // Optional linked concept (from Slice 10)
}

export interface AnnotationState {
  annotations: Annotation[];
  lastAnalyzedCode: string;
  lastAnalyzedAt: number;
  isAnalyzing: boolean;
}
```

### `src/lib/annotations/trigger.ts`
```typescript
// Debounce and trigger logic for AI analysis

export interface TriggerOptions {
  minChangeThreshold: number;  // Minimum chars changed (default: 15)
  idleTimeout: number;         // Idle fallback in ms (default: 3000)
}

// shouldTriggerAnalysis(
//   currentCode: string,
//   lastAnalyzedCode: string,
//   event: 'newline' | 'paren-close' | 'idle' | 'manual'
// ): boolean

// createTriggerHandler(
//   onTrigger: () => void,
//   options?: TriggerOptions
// ): { handleChange: (code: string, changeEvent?: string) => void, cleanup: () => void }
```

### `src/lib/annotations/diff.ts`
```typescript
// Determine which annotations are still valid after code changes

// invalidateAnnotations(
//   annotations: Annotation[],
//   oldCode: string,
//   newCode: string
// ): Annotation[]
//
// Returns annotations that are still valid (outside changed regions)
// Uses simple character range comparison
```

### `src/lib/ai/annotation-prompt.ts`
```typescript
// System prompt for annotation generation
//
// Instructs AI to:
// - Identify interesting/educational code sections
// - Write short, punchy pedagogical insights (1-2 sentences)
// - Use "we" language (collaborator, not teacher)
// - Connect code to sonic result
// - Return structured JSON with character ranges
//
// Example output format:
// {
//   "annotations": [
//     { "from": 0, "to": 12, "text": "Classic two-step groove—kick and hat trading off." },
//     { "from": 14, "to": 22, "text": "We're doubling the speed here—hear how it creates urgency?" },
//     { "from": 23, "to": 31, "text": "This mirrors the pattern in stereo. That spacey feel? That's jux." }
//   ]
// }
```

### `src/app/api/annotations/route.ts`
```typescript
// POST - Generate AI annotations for code
// Request: { code: string, context?: string }
// Response: { annotations: Annotation[] }
//
// Uses pedagogical prompt style from annotation-prompt.ts
// Returns 1-5 annotations per pattern (as many as are interesting)
// Each annotation targets a specific character range
```

### `src/hooks/useAnnotations.ts`
```typescript
// React hook for managing annotation state

// interface UseAnnotationsReturn {
//   annotations: Annotation[];
//   isAnalyzing: boolean;
//   enabled: boolean;
//   setEnabled: (enabled: boolean) => void;
//   triggerAnalysis: () => void;
//   clearAnnotations: () => void;
// }
//
// Features:
// - Manages annotation state
// - Handles trigger logic (newline, paren, idle)
// - Persists enabled setting to localStorage
// - Invalidates annotations on code changes
// - Fetches from /api/annotations when triggered
```

### `src/components/editor/annotationExtension.ts`
```typescript
// CodeMirror extension for AI annotation display

// createAnnotationExtension(options: {
//   annotations: Annotation[];
// }): Extension[]
//
// Features:
// - Decoration.mark() for dotted underline on annotated sections
// - hoverTooltip() for showing annotation text
// - Tooltip positioned above code (VS Code style)
// - Distinct styling from docs tooltips (accent border)
```

### `src/components/editor/AnnotationToggle.tsx`
```typescript
// Toggle button for editor toolbar

// Props:
// - enabled: boolean
// - onChange: (enabled: boolean) => void
// - isAnalyzing?: boolean
//
// Features:
// - Icon button (lightbulb icon)
// - Tooltip: "AI Annotations"
// - Loading spinner while analyzing
// - Persists to localStorage: 'lunette-annotations-enabled'
```

---

### Files to Modify

### `src/components/editor/Editor.tsx`
```typescript
// Add annotation extension to CodeMirror

// Changes:
// - Accept annotations prop: Annotation[]
// - Add createAnnotationExtension() to extensions array
// - Works alongside docs extension from Slice 10.5
```

### `src/components/editor/Controls.tsx`
```typescript
// Add AnnotationToggle to toolbar

// Changes:
// - Add AnnotationToggle next to DocsToggle
// - Pass enabled state, onChange, and isAnalyzing
```

### `src/app/(main)/editor/new/page.tsx`
```typescript
// Integrate annotations hook

// Changes:
// - Add useAnnotations() hook
// - Pass annotations to Editor component
// - Wire up trigger logic to code changes
// - Pass toggle props to Controls
```

### `src/app/(main)/editor/[id]/page.tsx`
```typescript
// Same changes as editor/new/page.tsx
```

### `src/app/(main)/pattern/[id]/page.tsx`
```typescript
// Annotations work in read-only view
// - Trigger analysis on initial load
// - No re-analysis needed (code doesn't change)
```

### `src/app/globals.css`
```css
/* Add AI annotation styles */

.cm-annotation-highlight {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: var(--color-brand-400);
  text-underline-offset: 3px;
}

.cm-annotation-tooltip {
  background: var(--color-neutral-800);
  border: 1px solid var(--color-neutral-700);
  border-left: 3px solid var(--color-brand-500);
  border-radius: 6px;
  padding: 8px 12px;
  max-width: 300px;
  font-size: 13px;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

---

### Implementation Notes

1. **Tooltip Positioning (VS Code Style):**
   ```typescript
   // Position tooltip above the hovered text
   // Use CodeMirror's coordsAtPos() to get screen coordinates
   // hoverTooltip handles this with above: true
   ```

2. **AI Analysis Prompt Structure:**
   ```typescript
   const prompt = `
   Analyze this Strudel pattern and identify 1-5 interesting sections to annotate.

   Style: Use "we" language, connect code to sound, be encouraging and concise.
   Format: Return JSON with character ranges and short insights (1-2 sentences max).

   Good examples:
   - "Classic two-step groove—kick and hat trading off."
   - "We're doubling the speed here—hear how it creates urgency?"
   - "That wide, spacey feel? That's jux mirroring the pattern in stereo."

   Code to analyze:
   \`\`\`strudel
   ${code}
   \`\`\`
   `;
   ```

3. **localStorage Keys:**
   ```typescript
   'lunette-annotations-enabled'  // boolean (default: true)
   ```

4. **Performance Considerations:**
   - Debounce analysis (don't call API on every keystroke)
   - Cache annotations until code changes
   - Limit to 5 annotations max per analysis

5. **Fallback Behavior:**
   - If API fails, silently disable annotations (don't block editor)
   - If no interesting sections found, show nothing (don't force annotations)

---

**Acceptance Criteria:**
- [ ] Toggle button in editor toolbar enables/disables AI annotations
- [ ] Toggle state persists across sessions (localStorage)
- [ ] AI analyzes code on newline, closing paren, or idle timeout
- [ ] Annotations appear as dotted underlines on interesting code sections
- [ ] Hovering shows tooltip above code with pedagogical insight
- [ ] Annotations use BrainLift style ("we" language, sound-focused)
- [ ] Annotations persist until code in that region changes
- [ ] Loading state shown during analysis
- [ ] Both AI and docs tooltips can appear when hovering annotated functions
- [ ] Annotations work in read-only pattern view
- [ ] No errors if API fails (graceful degradation)

---

## Slice 11: Polish + Launch Prep

**Goal:** Production-ready quality.

**Dependencies:** All previous slices

**Tasks:**

### Error Handling
- [x] Global error boundary
- [x] Friendly error messages for common issues
- [x] API error handling with user feedback
- [x] Strudel syntax error display

### Loading States
- [x] Skeleton loaders for gallery
- [x] Loading spinner for chat responses
- [x] Strudel initialization state

### Responsive Design (optional)
- [ ] Mobile: Stack panes vertically
- [ ] Tablet: Collapsible chat
- [ ] Handle small screens gracefully (even if not optimized)

### Performance
- [ ] Lazy load non-critical components
- [ ] Optimize Strudel bundle (dynamic import)
- [ ] Image optimization for avatars

### Accessibility (optional)
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
- [x] 404 page exists
- [ ] Site loads in under 3 seconds

**Implementation Notes (Actual):**

Error handling implementation:
- `app/global-error.tsx` - Catches errors in root layout
- `app/error.tsx` - App-level error boundary
- `app/(main)/error.tsx` - Main route group error boundary
- `app/not-found.tsx` - Custom 404 page
- `lib/errors.ts` - Centralized error utilities with error codes and user-friendly messages
- `lib/toast.ts` - Toast notification utilities
- `components/ui/sonner.tsx` - Toast component (sonner)
- All 7 API routes updated to use `errorResponse()` and `apiErrorHandler()`
- Pattern components (SaveDialog, ShareDialog, ForkButton, PatternList) updated with toast notifications

Strudel error display implementation:
- `components/editor/ErrorDisplay.tsx` - User-friendly error panel with type detection (syntax, reference, runtime)
- Parses Strudel errors to show contextual suggestions
- Dismiss button and "Open Reference tab" link for reference errors
- `lib/strudel/runtime.ts` - Listens to `strudel.log` custom event to capture internal Strudel errors
- `components/layout/RightPanel.tsx` - Added `requestedTab` prop for external tab switching
- Error display rendered at page level above controls bar

---

## Implementation Order Summary

```
Slice 0 (Setup) + Slice 1 (Editor+Sound) + Slice 2 (Playhead)
Slice 3 (Split Pane + Chat UI)
Slice 4 (LLM Integration)
Slice 5 (Runtime Tools) + Slice 6 (Auth) [parallel]
Slice 7 (Save/Load)
Slice 8 (Sharing + Fork)
Slice 9 (Gallery)
Slice 9.5 (UX Refactor)
Slice 9.7 (Reference Tab)
Slice 10 (Retrospective Learning)
Slice 10.5 (Strudel Docs Tooltips)
Slice 10.6 (AI Code Annotations)
Slice 11 (Polish)
--- MVP Launch ---
Slice 12 (Custom Sample Upload) [Post-MVP]
```

---

## Future Enhancements (Post-MVP)

Ideas to consider after initial launch:

### Code Validation Before Display
- Validate LLM-generated code snippets before showing to user
- Parse code through Strudel's evaluator in a "dry run" mode
- Show validation status on code blocks (valid/invalid)
- Auto-fix common mistakes (e.g., `.reverse()` → `.rev()`)
- Regenerate invalid snippets automatically

### Other Ideas
- Monaco editor option (more features than CodeMirror)
- MIDI output support
- Recording/export to audio file
- Collaborative editing (multiplayer)
- Visual pattern editor (drag-and-drop)

---

## Slice 12: Custom Sample Upload

**Goal:** Users can upload their own audio samples and use them in patterns.

**Dependencies:** Slice 7 (Pattern Save/Load), Slice 6 (Auth)

**Files to create:**

### `src/lib/samples/storage.ts`
```typescript
// IndexedDB storage for user samples
// - initSampleStorage(): Initialize IndexedDB
// - storeSample(userId: string, name: string, blob: Blob): Promise<string>
// - getSample(id: string): Promise<Blob | null>
// - listUserSamples(userId: string): Promise<SampleMeta[]>
// - deleteSample(id: string): Promise<void>
// - getSampleUrl(id: string): string (blob URL or data URL)
//
// Schema:
// - id: string (uuid)
// - userId: string
// - name: string (sample name, e.g., "kick", "snare")
// - filename: string (original filename)
// - mimeType: string
// - size: number (bytes)
// - blob: Blob
// - createdAt: Date
```

### `src/lib/samples/register.ts`
```typescript
// Register user samples with Strudel runtime
// - registerUserSamples(samples: SampleMeta[]): Promise<void>
// - Uses Strudel's registerSound() or samples() with blob URLs
// - Creates a user sample map: { kick: [url1, url2], snare: [url1] }
// - Samples accessible as s("kick:0"), s("snare"), etc.
```

### `src/components/samples/SampleUploader.tsx`
```typescript
// Upload UI component
// Props:
// - onUpload: (samples: SampleMeta[]) => void
//
// Features:
// - Drag-and-drop zone
// - File picker button
// - Folder upload support (webkitdirectory)
// - Shows upload progress
// - Validates file types (wav, mp3, ogg, flac, aac, m4a)
// - Max file size validation (e.g., 10MB per file)
// - Folder structure → sample names (folder name = sample name)
```

### `src/components/samples/SampleLibrary.tsx`
```typescript
// User's sample library panel
// - List of uploaded samples with:
//   - Name
//   - Duration
//   - Play preview button
//   - Delete button
// - Group by sample name (shows count, e.g., "kick (3)")
// - Search/filter
// - "Upload" button opens SampleUploader
```

### `src/components/samples/SamplePreview.tsx`
```typescript
// Mini audio player for sample preview
// - Waveform visualization
// - Play/pause
// - Shows duration
```

### `src/app/(main)/settings/samples/page.tsx`
```typescript
// Sample management page
// - SampleLibrary component
// - Storage usage indicator
// - "Clear all samples" button
// - Instructions for folder structure
```

### Update `src/lib/strudel/runtime.ts`
```typescript
// After initializing default samples, also register user samples
// - Load user samples from IndexedDB on init
// - Call registerUserSamples()
// - Provide refreshUserSamples() for after new uploads
```

### Update `src/app/(main)/page.tsx` (or editor pages)
```typescript
// Add sample library access
// - Button/tab to open sample library
// - Register samples on mount
// - Refresh after uploads
```

---

**Implementation Notes:**

1. **IndexedDB Structure:**
   ```typescript
   const db = await openDB('lunette-samples', 1, {
     upgrade(db) {
       const store = db.createObjectStore('samples', { keyPath: 'id' });
       store.createIndex('userId', 'userId');
       store.createIndex('name', 'name');
     },
   });
   ```

2. **Folder Upload Handling:**
   ```typescript
   // Input with webkitdirectory
   <input
     type="file"
     webkitdirectory=""
     multiple
     onChange={(e) => {
       const files = Array.from(e.target.files || []);
       // Group by parent folder name
       const byFolder = files.reduce((acc, file) => {
         const parts = file.webkitRelativePath.split('/');
         const folderName = parts[parts.length - 2] || 'samples';
         if (!acc[folderName]) acc[folderName] = [];
         acc[folderName].push(file);
         return acc;
       }, {});
     }}
   />
   ```

3. **Registering with Strudel:**
   ```typescript
   import { registerSound } from '@strudel/webaudio';

   // For each sample
   const url = URL.createObjectURL(blob);
   await registerSound(name, url, { type: 'sample' });

   // Or create a sample map and use samples()
   const userSampleMap = {
     kick: ['blob:...', 'blob:...'],
     snare: ['blob:...'],
   };
   ```

4. **Storage Limits:**
   - IndexedDB typically allows 50MB-unlimited depending on browser
   - Show storage usage: `navigator.storage.estimate()`
   - Warn when approaching limits

5. **Persistence Considerations:**
   - IndexedDB persists until cleared
   - Samples are LOCAL ONLY - not synced to server
   - Patterns using custom samples won't work when shared
   - Consider: Show warning when saving pattern with custom samples

6. **Future Enhancement - Server Storage:**
   - Upload to S3/R2 for permanent storage
   - Associate samples with user account
   - Share samples with patterns
   - This requires backend work and storage costs

---

**Acceptance Criteria:**
- [ ] Can upload single audio files
- [ ] Can upload folder of samples
- [ ] Folder name becomes sample name
- [ ] Samples persist across page refresh (IndexedDB)
- [ ] Samples appear in library with preview
- [ ] Can delete samples
- [ ] Samples work in patterns: `s("mysample")`
- [ ] Multiple files with same name indexed: `s("kick:0 kick:1")`
- [ ] Storage usage shown
- [ ] Unsupported file types rejected
- [ ] Warning shown when sharing pattern with custom samples

---

## Notes for AI Assistant

When implementing each slice:

1. **Read the full slice before starting.** Understand the acceptance criteria.

2. **Create files in order listed.** Dependencies matter.

3. **Test after each file.** Don't move on until it works.

4. **Ask clarifying questions** if requirements are ambiguous.

5. **Keep code simple.** Avoid over-engineering. This is an MVP.

6. **Match existing patterns.** Look at completed slices for conventions.

7. **When stuck**, refer back to PRD for context and intent.

---

*End of implementation plan.*
