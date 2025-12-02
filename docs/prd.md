# Lunette — Product Requirements Document

**Version:** 1.0  
**Date:** December 2025  
**Status:** Draft  

---

## Vision

Lunette is an AI-native music coding environment where **Strudel is the instrument, music theory is the curriculum, the LLM is the teacher, and creativity is the goal.**

It answers the question: *What if learning music theory was as engaging as playing a video game, and as immediate as live coding?*

---

## Product Summary

| Attribute | Decision |
|-----------|----------|
| Platform | Web app (MVP) |
| Framework | Next.js (App Router) |
| Audio Engine | `@strudel/web` |
| Editor | CodeMirror (swappable to Monaco in v2) |
| Auth | Better Auth (GitHub OAuth + magic links) |
| Database | Postgres on Neon |
| ORM | Drizzle |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix + Tailwind) |
| LLM | OpenRouter (user-provided API key) |
| Hosting | Vercel |
| License | Open source (AGPL-3.0, respecting Strudel's license) |

---

## Target Users

**Primary:** People who know nothing about music theory but want to learn through play and creation.

**Secondary:** Experienced users who want a sandbox environment with an AI assistant that understands Strudel and music.

The app serves both through a unified interface — beginners follow structured learning paths while advanced users engage in freeform exploration.

---

## Core Experience

### Layout

Split-pane interface:
- **Left:** Code editor with live playhead visualization
- **Right:** Chat panel (the AI teacher)

Design principles:
- Dark mode default
- Calm, focused, inviting
- Minimal — no visual clutter
- Subtle flash/animation

### The Playhead

As music plays, the code editor highlights the active portions of the pattern in real-time. This visual connection between code and sound is essential for learning — users *see* what they *hear*.

This is non-negotiable for MVP.

### The Chat Teacher

The chat panel is where learning happens. It can:
- Teach music theory concepts through Strudel code
- Explain what any code does sonically
- Answer questions about the Strudel API
- Generate code with explanations
- Guide users through learning paths
- Correct mistakes when teaching specific concepts
- Encourage creativity and experimentation

In sandbox mode (no active lesson), the chat functions as a general-purpose assistant for music and Strudel questions.

---

## Learning System

### Structure

Learning is organized into **skill trees/paths** — not linear levels. Users can start wherever feels right and progress at their own pace.

All content is available from the start. There is no unlocking. Progress tracking shows what users have explored and completed, not what they're "allowed" to access.

### Suggested Learning Paths

*Note: This structure is flexible and can be revised based on curriculum development.*

**Fundamentals**
- What is a pattern?
- Sounds and samples (`s()`)
- Basic sequencing
- Tempo and timing (`setcps()`)

**Rhythm**
- Beat division and multiplication
- Euclidean rhythms
- Polyrhythms
- Swing and groove

**Melody**
- Notes and octaves
- Scales (major, minor, modes, pentatonic)
- Intervals
- Simple melodies

**Harmony**
- Chords and voicings
- Chord progressions (I-IV-V, ii-V-I, etc.)
- Harmonic rhythm
- Tension and resolution

**Sound Design**
- Synth parameters
- Filters and envelopes
- Effects (reverb, delay, distortion)
- Layering sounds

**Composition**
- Song structure
- Arrangement
- Transitions
- Building a complete piece

**Advanced Patterns**
- Stacks and layers
- Pattern transformation
- Randomness and variation
- Conditional logic

### Lesson Flow

1. User selects a learning path or topic
2. Chat introduces the concept with context
3. Editor loads starter code relevant to the lesson
4. User plays, experiments, modifies
5. Chat guides, explains, corrects as needed
6. User progresses at their own pace
7. Progress is saved locally and to their account

Users can ask pedagogical questions at any time, even outside formal lessons.

---

## AI Integration

### LLM Configuration

Users provide their own API key via OpenRouter. This keeps costs on the user while providing access to multiple models.

Future consideration: Self-hosted open-source LLM for a fully free tier.

### Tool Calling

The LLM doesn't need tools to *generate* code — it can write Strudel code directly. What it needs are **runtime controls** to interface with the live Strudel instance.

This is not MCP (which is for desktop apps). These are server-side API routes that the chat backend calls when the LLM needs to interact with the user's Strudel runtime.

**Runtime Tools (MVP)**

| Tool | Description |
|------|-------------|
| `evaluate_pattern` | Run code in Strudel runtime |
| `get_current_pattern` | Read what's currently in the editor |
| `get_error` | Get error message if pattern failed to evaluate (enables debugging help) |
| `get_playing_state` | Is playback running or stopped? |
| `get_bpm` | Read current tempo |
| `list_samples` | Return available samples in the user's library |
| `set_bpm` | Change tempo |
| `play` | Start playback |
| `stop` | Stop playback |

The LLM writes Strudel code directly in its responses. When it wants to show the user a pattern, it writes the code and suggests applying it. The tools are only for runtime state.

**Runtime Tools (Post-MVP)**

| Tool | Description |
|------|-------------|
| `get_available_scales` | List all scales Strudel supports |
| `get_available_sounds` | List available synths/instruments beyond samples |
| `highlight_range` | Highlight specific code range for teaching ("look at this part") |
| `get_selection` | Get currently selected text (enables "explain this" flows) |
| `insert_at_cursor` | Insert code at cursor position (more surgical than full replace) |

Inspired by [strudel-mcp-server](https://github.com/williamzujkowski/strudel-mcp-server), but implemented as direct function calls (no browser automation needed since Strudel is embedded).

### Approval Flow

All code modifications require user approval before being applied. The flow:

1. LLM generates code change
2. Chat displays the suggestion with explanation
3. User sees "Apply" / "Reject" buttons
4. On "Apply", code updates in editor
5. Pattern can be played immediately

This matches the interaction model users expect from AI coding assistants.

---

## Pattern Storage & Sharing

### Data Model

```
patterns
├── id (uuid)
├── code (text)
├── name (string)
├── author_id (fk → users)
├── original_author_id (fk → users, nullable)
├── forked_from_id (fk → patterns, nullable)
├── is_public (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)
```

- `author_id`: Current owner of this pattern
- `original_author_id`: The root creator (first person in the fork chain). Null if this is the original.
- `forked_from_id`: Direct parent pattern. Null if this is an original creation.

This enables:
- "Show me all forks of this pattern"
- "Show me where this came from" (upstream lineage)
- "Show me everything by this creator"

### Gallery / Browse

Inspired by SoundCloud: **music first, code second.**

The gallery displays pattern cards with:
- Title and author
- Play button (inline playback without navigation)
- Visual representation (waveform, Strudel visualization, or minimal thumbnail)
- Fork/remix button

Users scroll, audition, discover. When something catches their ear, they click through to see the code and learn how it works.

This creates a learning loop: *hear something cool → see how it's made → ask the AI to explain it → learn*.

### Sharing

Patterns are shareable via URL. When shared:
- Recipient lands on the pattern
- Can play it immediately
- Can view the code
- Can fork/remix it (creates a new pattern linked to the original)
- Fork attribution is preserved

Virality potential: "I made this weird polyrhythm, check it out" → link → friend hears it → friend remixes → shares their version.

---

## User Accounts

### Authentication

Better Auth with:
- GitHub OAuth (primary — target audience is coders/tinkerers)
- Magic links (fallback — no passwords to manage)

### User Data

```
users
├── id (uuid)
├── email (string)
├── name (string)
├── github_id (string, nullable)
├── avatar_url (string, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

user_progress
├── id (uuid)
├── user_id (fk → users)
├── path_id (string)
├── topic_id (string)
├── status (enum: not_started, in_progress, completed)
├── started_at (timestamp, nullable)
└── completed_at (timestamp, nullable)
```

Progress persists across sessions and devices.

---

## Technical Architecture

### Frontend

```
/app
├── (auth)/
│   ├── login/
│   └── callback/
├── (main)/
│   ├── page.tsx              # Editor + Chat (main experience)
│   ├── browse/
│   │   └── page.tsx          # Gallery
│   ├── pattern/[id]/
│   │   └── page.tsx          # Single pattern view
│   ├── learn/
│   │   └── page.tsx          # Learning paths overview
│   └── settings/
│       └── page.tsx          # API key, preferences
├── api/
│   ├── auth/[...]/
│   ├── patterns/
│   ├── chat/
│   └── tools/
└── layout.tsx
```

### Key Components

- `<Editor />` — CodeMirror instance with playhead integration
- `<Chat />` — Message list + input, tool result rendering
- `<PatternCard />` — Gallery item with inline playback
- `<LearningPath />` — Tree/list of topics with progress indicators
- `<ApprovalWidget />` — Accept/reject code suggestions

### Editor Abstraction

The editor should be wrapped in an abstraction layer to enable swapping CodeMirror → Monaco later:

```typescript
interface EditorAdapter {
  getValue(): string;
  setValue(code: string): void;
  highlightRange(start: number, end: number): void;
  clearHighlights(): void;
  onChangeContent(callback: (code: string) => void): void;
  focus(): void;
}
```

MVP implements `CodeMirrorAdapter`. V2 implements `MonacoAdapter`.

### Strudel Integration

Using `@strudel/web` for audio engine without the built-in UI:

```typescript
import { initStrudel } from '@strudel/web';

// Initialize once
await initStrudel();

// Evaluate pattern (returns pattern object with timing info)
const pattern = await evaluate(code);

// Playback control
play();
stop();

// For playhead: query active events
const activeEvents = pattern.queryArc(currentTime, currentTime + lookahead);
```

The pattern object provides source positions for active events, enabling playhead highlighting.

### API Routes

**`POST /api/chat`**
- Receives user message + conversation history
- Includes condensed Strudel API reference in system prompt
- Calls OpenRouter
- Streams response back
- Handles tool calls (runtime controls) server-side

**`POST /api/runtime/[action]`**
- Runtime control endpoints called by the LLM
- `evaluate` — evaluate pattern code
- `play` / `stop` — playback control
- `set_bpm` — tempo control
- `list_samples` — return available samples
- These communicate with the client-side Strudel instance via WebSocket or server-sent events

**`GET/POST /api/patterns`**
- CRUD for user patterns
- Fork creation

### Database

Neon Postgres with Drizzle ORM.

Schema defined in `drizzle/schema.ts`. Migrations via `drizzle-kit`.

---

## MVP Scope

### In Scope

- [ ] Split-pane layout (editor + chat)
- [ ] CodeMirror with live playhead
- [ ] `@strudel/web` integration
- [ ] Chat interface with streaming responses
- [ ] Tool calling (query_docs, write/modify pattern, generate patterns)
- [ ] Code approval flow (apply/reject)
- [ ] User authentication (Better Auth)
- [ ] Pattern save/load (user's own patterns)
- [ ] Pattern sharing (public URLs)
- [ ] Pattern forking with attribution
- [ ] Gallery browse with inline playback
- [ ] Learning paths UI (selectable paths/topics)
- [ ] Progress tracking (per-topic completion)
- [ ] Settings (API key input)
- [ ] Dark mode, minimal design

### Out of Scope (Post-MVP)

- Monaco editor with inline diffs
- Self-hosted open-source LLM
- Desktop app (Tauri)
- Pattern versioning (save history, compare, revert)
- Audio export (render pattern to audio file)
- Audio analysis / feedback on what user creates
- Social features beyond browse/fork (follows, likes, comments)
- Advanced curriculum content
- Mobile-optimized experience
- Offline support (PWA)

---

## Design References

| Reference | What to borrow |
|-----------|----------------|
| **SoundCloud** | Gallery UX — browse by listening, waveform cards, inline play |
| **CodePen** | Social layer — browse, fork, trending. Lightweight community |
| **Ableton Learning Music** | Interactive music theory teaching, concept chunking, immediate play |
| **Sonic Pi** | Warm, approachable aesthetic. Educational DNA |
| **Cursor** | AI code editing patterns (approval flow, inline suggestions) |

---

## Success Metrics

### MVP Launch

- Users can complete a learning path topic end-to-end
- Pattern sharing works (share → friend opens → friend can play and fork)
- Playhead is visually compelling and in sync
- Chat successfully teaches and generates working patterns

### Growth Indicators

- Patterns created per user
- Fork chains (patterns that spawn remixes)
- Learning path completion rates
- Return visits

---

## Open Questions

1. **Curriculum authorship**: Who writes the learning path content? Built-in? Community contributed? LLM-generated with human review?

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| **Strudel API in context** | Use `@strudel/reference` npm package to generate a condensed API reference (~5-8k tokens) for the system prompt. Includes function signatures, descriptions, and examples. No RAG needed for MVP. |
| **Rate limiting** | Not a concern — users provide their own OpenRouter API keys. Add client-side safeguard (max messages/minute) to prevent runaway calls from bugs. |
| **Offline support** | Out of scope. Without AI, it's just Strudel. |
| **Audio export** | Post-MVP. Users can screen-record for now. |

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Next.js project setup
- Tailwind + dark theme
- Better Auth integration
- Database schema + Drizzle setup
- Basic layout (split pane)

### Phase 2: Core Editor (Weeks 3-4)
- CodeMirror integration
- `@strudel/web` integration
- Playhead implementation
- Play/stop controls

### Phase 3: AI Chat (Weeks 5-6)
- Chat UI component
- OpenRouter integration
- Tool calling infrastructure
- Basic tools (query_docs, write_pattern)

### Phase 4: Learning (Weeks 7-8)
- Learning paths data structure
- Path selection UI
- Progress tracking
- Starter code per topic

### Phase 5: Social (Weeks 9-10)
- Pattern CRUD
- Sharing URLs
- Fork functionality
- Gallery browse
- Inline playback

### Phase 6: Polish (Weeks 11-12)
- Design refinement
- Performance optimization
- Error handling
- Documentation
- Beta launch

---

## Appendix: Strudel API Reference Strategy

### Source

Use the `@strudel/reference` npm package, which contains metadata for all documented Strudel functions.

### Format for System Prompt

Generate a condensed reference (~5-8k tokens) structured as:

```
## Strudel API Reference

### Core Functions
s(sound) - Select a sound/sample by name. Example: s("bd hh")
note(n) - Set note/pitch. Example: note("c a f e")
n(num) - Set note by number in scale. Example: n("0 2 4 6")
...

### Pattern Combinators
stack(...patterns) - Layer patterns simultaneously
cat(...patterns) - Sequence patterns across cycles
...

### Modifiers
.fast(n) - Speed up by factor n
.slow(n) - Slow down by factor n
.rev() - Reverse the pattern
...

### Effects
.gain(n) - Volume (0-1)
.cutoff(hz) - Low-pass filter frequency
.room(n) - Reverb amount (0-1)
...

### Mini-Notation
* - Repeat (e.g., "bd*4")
/ - Slow down (e.g., "bd/2")
[ ] - Group as single step
< > - Alternate per cycle
...
```

### Build Process

During build, run a script that:
1. Imports `@strudel/reference`
2. Extracts function metadata
3. Formats as condensed markdown
4. Outputs to `lib/strudel-reference.md`
5. Include in system prompt at runtime

---

*End of document.*
