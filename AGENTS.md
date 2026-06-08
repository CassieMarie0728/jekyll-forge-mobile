# Jekyll Forge Mobile: AI Agent Guide

## Project Overview
**Jekyll Forge Mobile** is a full-stack web application for managing Jekyll static blog sites with AI assistance. It combines React frontend, Express backend, Gemini AI integration, and GitHub API access for a rich editorial experience with mobile/PWA support.

**Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS | Express backend | @google/genai SDK | GitHub REST API | Capacitor (mobile)

---

## Architecture & Critical Patterns

### 1. **State Management: Centralized Hooks in App.tsx**
- **Single Root Container**: `App.tsx` (~3767 lines) manages ALL application state using React hooks
- **No Redux/Context API**: Direct `useState` for repositories, posts, drafts, settings, UI toggles
- **Key State Categories**:
  - `activePost` / `posts` / `draftMarkdown` / `draftFrontMatter` / `draftTitle`: Current editing session
  - `selectedRepo` / `repositories` / `githubToken`: GitHub connection state
  - `snapshots`: Local version history (autosave + manual)
  - `aiSettings`: Gemini config (model, temperature, prompts)
  - `plugins`: Jekyll plugin toggles with Pages-supported flags

**→ Important**: Changes to editing logic or state flow require modifications here. Avoid over-fragmenting components due to tight coupling.

### 2. **Jekyll Post Data Model**
Defined in `src/types.ts`:
```typescript
interface JekyllPost {
  path: string;        // "_posts/2026-05-18-title.md" or "_drafts/title.md"
  filename: string;
  slug: string;        // lowercase URL-safe identifier
  frontMatter: Record<string, any>;  // YAML header (title, date, author, tags, etc)
  markdown: string;    // Raw markdown body
  status: "draft" | "published" | "modified" | "new" | "scheduled";
  sha?: string;        // GitHub blob SHA for conflict detection
}
```

**→ Critical**: Front matter titles and slugs must be preserved for Jekyll compatibility. Always escape YAML special chars.

### 3. **YAML Front Matter Processing**
- **Parser**: `src/utils/yaml.ts` - Custom lightweight parser (no external YAML lib)
  - Handles inline arrays `[tag1, tag2]`, multiline arrays `- item`, strings, booleans, dates
  - Returns `Record<string, any>` for direct frontMatter state
- **Formatter**: `src/utils/yaml.ts::formatJekyllPost()` - Reconstructs `---\nkey: value\n---\nmarkdown`
- **Key Function**: `parseJekyllPost()` splits file into frontMatter + markdown

**→ Pattern**: Always use `parseJekyllPost()` when reading files, `formatJekyllPost()` when saving. Never manually parse YAML.

### 4. **Markdown Processing Pipeline**
Located in `src/utils/markdown.ts`:
- `renderMarkdown()`: Lightweight client-side renderer (supports Jekyll layouts, Liquid tags `{% %}`, tables, callouts `> [!NOTE]`)
- `countWords()`, `estimateReadingTime()`, `extractHeaderOutline()`: Analytics helpers
- **No Heavy Dependencies**: Custom parsing to avoid bundle bloat (Vite constraint)

**→ Optimization Note**: Markdown rendering happens on every keystroke. Keep regex patterns efficient.

### 5. **GitHub API Integration**
Exposed via app-level handlers:
- `fetchGitData()`: Lists branches & commits via GitHub REST API v3
- `handleSaveToDrafts()`: Creates/updates `_drafts/` files using GitHub content endpoint with base64 encoding
- `handlePublishFile()`: Moves drafts to `_posts/` directory
- **Authentication**: Bearer token in `Authorization` header or simulated fallback

**Key URI Pattern**: `https://api.github.com/repos/{owner}/{name}/contents/{path}`

**→ Error Handling**: All GitHub calls fall back to mock data if rate-limited or unauthorized (graceful degradation).

### 6. **Gemini AI Backend Route**
Express endpoint at `/api/gemini/generate` (server.ts):
```typescript
POST /api/gemini/generate
Body: { prompt, config, systemInstruction }
Response: { text: string } // generated content or { error: string }
```
- **Lazy Client Init**: Reads `GEMINI_API_KEY` from env on first call
- **Model**: `gemini-3.5-flash` (optimized for speed)
- **Template System**: `AIAssistant.tsx` offers preset tasks (generate titles, SEO meta, tag recommendations, etc)

**→ Pattern**: All AI calls from frontend go through Express tunnel (not direct API key in browser).

### 7. **Mobile & PWA Features**
- **Service Worker**: Registered in `main.tsx` for offline caching (`/sw.js`)
- **Web Manifest**: `site.webmanifest` in public/ defines app metadata (name, icons, display mode)
- **Capacitor Integration**: Mock haptics, geolocation, battery, notifications in App.tsx
  - Simulates Android bridge APIs when running in web sandbox
- **Mobile UI Tab**: `_mobile` tab in left sidebar has logcat console, device sandbox controls

**→ Important**: Keep PWA features non-blocking (graceful fallbacks if APIs unavailable).

---

## Developer Workflows & Commands

### Dev Setup
```bash
npm install                 # Install dependencies (@google/genai, express, react, vite, tailwindcss, etc)
export GEMINI_API_KEY=...  # Set API key (or create .env.local)
npm run dev                 # Start Vite + Express dev server (tsx server.ts)
```

### Build & Deploy
```bash
npm run build              # Vite SPA build → dist/ + esbuild server.ts → dist/server.cjs
npm start                  # Run compiled server (dist/server.cjs) on port 3000
npm run lint               # TypeScript check (tsc --noEmit, no actual linting)
npm run clean              # Remove dist/ and server.js
```

### Production Notes
- **Environment Vars**: `GEMINI_API_KEY` required for AI features
- **Vite Config**: Disables HMR file watching when `DISABLE_HMR=true` (honors agent edit speed)
- **Static Assets**: Served from `dist/` after build; public/ files copied to root

---

## Project-Specific Conventions

### 1. **Component Structure**
- **Monolithic App**: Avoid excessive component splitting (tight state coupling)
- **Existing Sidebar Components**: `AIAssistant.tsx`, `AISettings.tsx`, `MergeHub.tsx`
- **UI Library**: Lucide React for icons; Tailwind CSS for styling (dark/warm theme toggle)
- **Theme System**: `themeMode` state = "dark" | "warm" (affects text & bg colors globally)

### 2. **Event Handlers & Naming**
- Prefix with `handle*`: `handleSelectPost()`, `handleSaveToDrafts()`, `handlePublishFile()`
- Prefix fetch/async with `fetch*`: `fetchGitData()`
- Prefix triggers with `trigger*`: `triggerSimulatedVibration()`

### 3. **Data Persistence Strategy**
- **Primary**: Local React state (no Redux, no Zustand)
- **Snapshots**: In-memory `snapshots` array (15-20 items max, autosave every 15s)
- **Secondary**: GitHub (via API when token present)
- **Offline Fallback**: Mock data simulates GitHub responses if network blocked

### 4. **Routing & File Organization**
- **Posts**: `_posts/YYYY-MM-DD-slug.md` (published)
- **Drafts**: `_drafts/slug.md` (unpublished)
- **Assets**: `assets/images/filename.webp` (optimized)
- **Config**: `_config.yml`, `Gemfile` (editable in config tab)

### 5. **SEO & Content Validation**
- Real-time SEO audit in `seoReport` state (computed on markdown/title change)
- Checks: title length (15-70 chars), description presence (<165 chars), image alt text, H1 uniqueness
- **Accessibility**: Multi-level-H1 warning, missing alt text critical

### 6. **Audio & Ambient Effects**
- Typewriter keystroke sounds via `audioSynth.ts` (procedural audio synthesis, no samples)
- Ambient sounds: Rain, fireplace (toggled via AISettings component)
- **Always Optional**: Audio disabled by default; check `keystrokeVolume` before triggering

---

## API & External Integration Points

### GitHub REST API
- **Auth**: Bearer token or public fallback
- **Endpoints Used**:
  - `GET /repos/{owner}/{name}/branches` — List repository branches
  - `GET /repos/{owner}/{name}/commits?sha={branch}` — Fetch commit history
  - `GET /repos/{owner}/{name}/contents/{path}` — Read file metadata (SHA)
  - `PUT /repos/{owner}/{name}/contents/{path}` — Create/update file (base64 encoded)

### Google Gemini API
- **Endpoint**: Backend only (`/api/gemini/generate`)
- **Model**: `gemini-3.5-flash`
- **Config**: Temperature (0.0-1.0), maxOutputTokens, systemInstruction
- **Error Handling**: Return error JSON; UI displays in result panel

---

## Common Development Tasks

### Adding a New AI Task Template
1. Edit `AIAssistant.tsx::PRESET_TEMPLATES` array
2. Add `{ id: "task-id", label: "...", prompt: "..." }`
3. Template is automatically offered in preset dropdown

### Implementing a New Markdown Feature
1. Add parser/renderer logic to `src/utils/markdown.ts`
2. Test with `renderMarkdown()` or text analysis functions
3. Trigger recompute via `useEffect` watchers on `draftMarkdown` change

### Extending Mobile/Device Integration
1. Add Capacitor API call in `App.tsx` (e.g., new button → `triggerSimulated*()`)
2. Update logcat console via `addLogcatLine()` to reflect action
3. Mock response and UI state update

### GitHub Integration Debugging
- Check `githubToken` state (set in header "Credentials" button)
- Monitor `gitError` state for API failures
- Use mock data path as fallback reference

---

## Performance & Constraints

- **Bundle Size**: Keep markdown/yaml parsers lightweight (no external libs)
- **State Mutations**: Use functional setState (never mutate state directly)
- **Rendering**: App.tsx rerenders on all state changes; consider splitting for large features
- **File Size Limits**: Express payload limit = 25MB (posts + assets)
- **Hot Module Replacement**: Disabled in AI Studio mode via `DISABLE_HMR` env var

---

## Further Reading

- **README.md**: Setup + deployment instructions
- **types.ts**: Full data model definitions
- **server.ts**: Backend API routes & Gemini integration
- **App.tsx**: Main UI logic (search for `handleSelectPost`, `handleSaveToDrafts` patterns)

<!-- moxie-docs:start -->
## Moxie Docs Agent Guidance

Use the Moxie Docs MCP server before editing CassieMarie0728/jekyll-forge-mobile. Load conventions, documentation patterns, documentation gaps, documentation update opportunities, and verified commands before changing code.

When your Moxie Docs token serves more than one repository, pass `repository: "CassieMarie0728/jekyll-forge-mobile"` in every Moxie tool call from this repo so the context targets CassieMarie0728/jekyll-forge-mobile.

### Documentation expectation

- Update human-readable docs when a change alters behavior, APIs, workflows, architecture, operational runbooks, or setup paths.
- Follow the repository's detected documentation placement and style.
- Prefer small source-cited docs updates over broad rewrites.
- Avoid filler docs that only restate file names, component names, or code that is already obvious.
- When you edit an existing doc, scan the whole file and correct any other section your change makes stale or wrong — don't leave known-outdated content next to a fresh update.

<!-- moxie-docs:end -->
