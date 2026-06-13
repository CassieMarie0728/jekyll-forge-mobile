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
  path: string;
  filename: string;
  slug: string;
  frontMatter: Record<string, any>;
  markdown: string;
  status: "draft" | "published" | "modified" | "new" | "scheduled";
  sha?: string;
}
```

**→ Critical**: Front matter titles and slugs must be preserved for Jekyll compatibility. Always escape YAML special chars.

### 3. **YAML Front Matter Processing**
- **Parser**: `src/utils/yaml.ts` - Custom lightweight parser
- **Formatter**: `src/utils/yaml.ts::formatJekyllPost()` - Reconstructs full post markdown
- **Key Function**: `parseJekyllPost()` splits file into frontMatter + markdown

**→ Pattern**: Always use `parseJekyllPost()` when reading files, `formatJekyllPost()` when saving. Never manually parse YAML.

### 4. **Markdown Processing Pipeline**
Located in `src/utils/markdown.ts`:
- `renderMarkdown()`: Lightweight client-side renderer
- `countWords()`, `estimateReadingTime()`, `extractHeaderOutline()`: Analytics helpers
- **No Heavy Dependencies**: Custom parsing to avoid bundle bloat

**→ Optimization Note**: Markdown rendering happens on every keystroke. Keep regex patterns efficient.

### 5. **GitHub API Integration**
- `fetchGitData()`: Lists branches & commits via GitHub REST API v3
- `handleSaveToDrafts()`: Creates/updates `_drafts/` files using GitHub content endpoint
- `handlePublishFile()`: Moves drafts to `_posts/` directory
- **Authentication**: Bearer token in `Authorization` header or simulated fallback

**→ Error Handling**: All GitHub calls fall back to mock data if rate-limited or unauthorized.

### 6. **Gemini AI Backend Route**
Express endpoint at `/api/gemini/generate`:
```typescript
POST /api/gemini/generate
Body: { prompt, config, systemInstruction }
Response: { text: string }
```

**→ Pattern**: All AI calls from frontend go through Express tunnel, not direct API key in browser.

### 7. **Mobile & PWA Features**
- Service worker registered in `main.tsx`
- Web manifest in `public/`
- Capacitor integration mocked when running in web sandbox
- Mobile UI tab includes logcat console and device sandbox controls

---

## Developer Workflows & Commands

### Dev Setup
```bash
npm install
export GEMINI_API_KEY=...
npm run dev
```

### Build & Deploy
```bash
npm run build
npm start
npm run lint
npm run clean
```

---

## Project-Specific Conventions

- `App.tsx` is intentionally monolithic. Avoid excessive splitting unless the refactor is scoped.
- Always use `parseJekyllPost()` and `formatJekyllPost()` for post data.
- Prefer lightweight parsing utilities over heavy dependencies.
- Audio and ambient effects must remain optional and disabled by default.
- Run build/check commands before PRs.
- Update relevant docs when behavior, APIs, setup, or workflows change.

---

## Further Reading

- **README.md**: Setup + deployment instructions
- **types.ts**: Full data model definitions
- **server.ts**: Backend API routes & Gemini integration
- **App.tsx**: Main UI logic
