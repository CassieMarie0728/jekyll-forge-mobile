/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Sliders,
  BookOpen,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Folder,
  Plus,
  Trash2,
  Copy,
  Eye,
  Edit3,
  Settings,
  Database,
  ArrowRight,
  Clipboard,
  RefreshCw,
  Send,
  CheckCircle,
  Search,
  HelpCircle,
  FileDown,
  Upload,
  Layers,
  Terminal,
  Globe,
  Command,
  List,
  Check,
  Archive,
  ArrowUpRight,
  CheckSquare,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCcw,
  SlidersHorizontal,
  FileCode,
  Heart,
  EyeOff
} from "lucide-react";

import { Repository, JekyllPost, Asset, Snapshot, SEOReportItem } from "./types";
import { parseJekyllPost, formatJekyllPost } from "./utils/yaml";
import { renderMarkdown, countWords, estimateReadingTime, extractHeaderOutline } from "./utils/markdown";
import AIAssistant from "./components/AIAssistant";
import AISettings from "./components/AISettings";

// Initializing beautiful mock repositories to make the workspace alive instantly
const INITIAL_REPOSITORIES: Repository[] = [
  {
    owner: "jekyll-scribe",
    name: "vintage-chronicle",
    rootPath: "/",
    defaultBranch: "main",
    selectedBranch: "main",
    isJekyll: true,
    permissions: { admin: true, push: true, pull: true },
  },
  {
    owner: "academic-ink",
    name: "research-portfolio",
    rootPath: "docs",
    defaultBranch: "master",
    selectedBranch: "master",
    isJekyll: true,
    permissions: { admin: false, push: true, pull: true },
  },
];

// Seed initial markdown posts
const SEED_POSTS: JekyllPost[] = [
  {
    path: "_posts/2026-05-18-the-lost-art-of-typewriters.md",
    filename: "2026-05-18-the-lost-art-of-typewriters.md",
    slug: "the-lost-art-of-typewriters",
    frontMatter: {
      layout: "post",
      title: "The Lost Art of Vintage Typewriters",
      date: "2026-05-18 14:20:00 -0500",
      author: "Oliver Sterling",
      categories: ["chronicles", "analogue"],
      tags: ["history", "machinery", "ink"],
      description: "A deep dive into historical mechanical keyboards, visual letter shapes, and physical ink-ribbons that built classic editorial literature.",
      image: "assets/images/typewriter-vintage.jpg",
      featured: true,
      comments: true,
    },
    markdown: `# The mechanical soul of analogue writing

There is a profound weight in physical key impact. Every letter stamped into cotton parchment is an unalterable commitment—a dance of ink, tension, and metal.

## 1. The Anatomy of Impact

Each keypress activates a complex set of levers that launch the type-bar toward the platen. Unlike modern flat screens, the typewriter has **tangible acoustics**. The key resistance trains the finger muscles to strike with strict intentional rhythm.

> [!NOTE]
> Classic heavy typewriter models like the **Underwood 5** or **Royal Quiet De Luxe** have unique metal strikes, giving each physical machine an individual "fingerprint" of letter alignment.

## 2. Escaping the Distraction of Backspace

When erasing is difficult, you think twice before launching a word. This deliberate pace changes how narratives unfold.

*   **Fewer structural edits during active drafting**
*   **More cohesive focus on tone continuity**
*   **Acceptance of beautiful manual mistakes**

| Mechanism Type | Key Pressure (g) | Mechanical Speed (CPM) | Dynamic Resonance |
| :--- | :---: | :---: | :--- |
| Mechanical Levers | 150g | 300 CPM | Crisp & Clank |
| Light Plastic Keys | 50g | 600 CPM | Quiet & Plastic |

### Reconnecting with the Paper Path

Try writing without immediately cleaning up typos. Let the words drift until the linebell sounds. If you would like to automate some of this editorial pacing, consider triggering the **Jekyll Custom Theme CSS variables** or launching the integrated AI writing assistance tools!
`,
    status: "published",
  },
  {
    path: "_posts/2026-05-19-static-site-rebellion.md",
    filename: "2026-05-19-static-site-rebellion.md",
    slug: "static-site-rebellion",
    frontMatter: {
      layout: "post",
      title: "The Static Site Rebellion",
      date: "2026-05-19 09:30:00 -0500",
      author: "Elena Vance",
      categories: ["web-freedom"],
      tags: ["jekyll", "github-pages", "minimalism"],
      description: "Why static files deployed directly to global CDNs continue to defeat bloated, database-driven monolithic CMS networks.",
      image: "assets/images/terminal-code.jpg",
      featured: false,
    },
    markdown: `# Returning to file-based simplicity

Modern web tools are suffering from database-overload. We compile virtual DOM trees inside Docker containers, connected to external caching endpoints, to serve three paragraphs of text.

## The Absolute Power of Jekyll

Jekyll processes Markdown files, reads YAML header blocks, merges layout wrappers, and outputs clean static '.html' pages. No live Postgres queries. No memory leaks.

*   **Speed**: Cached entirely on edges immediately.
*   **Security**: Minimal surface area for exploit scripts.
*   **Durability**: If GitHub Pages can serve static HTML, your blog stays online forever.

### The Standard Deployment Pipeline

To deploy a classic Jekyll blog, you commit files to your main repository, triggering a built-in compilation build step inside GitHub's cluster. However—always keep the **Plugin Rules** in mind when utilizing non-standard dependencies!
`,
    status: "published",
  },
];

// Built-in list of assets to simulate asset folder inventory
const INITIAL_ASSETS: Asset[] = [
  {
    path: "assets/images/typewriter-vintage.jpg",
    name: "typewriter-vintage.jpg",
    url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800",
    mimeType: "image/jpeg",
    size: 472000,
    width: 800,
    height: 533,
    alt: "A close-up photograph of an antique metal typewriter keys",
  },
  {
    path: "assets/images/terminal-code.jpg",
    name: "terminal-code.jpg",
    url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800",
    mimeType: "image/jpeg",
    size: 290000,
    width: 800,
    height: 600,
    alt: "Console logs rendering dynamic build logs inside terminal view",
  },
];

export default function App() {
  // Theme Preference: default to "warm" old book style light theme
  const [themeMode, setThemeMode] = useState<"warm" | "dark">("dark");

  // Repositories & Active Selection
  const [repositories, setRepositories] = useState<Repository[]>(INITIAL_REPOSITORIES);
  const [selectedRepo, setSelectedRepo] = useState<Repository>(INITIAL_REPOSITORIES[0]);
  const [githubToken, setGithubToken] = useState<string>("");
  const [showGithubSetup, setShowGithubSetup] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("Workspace connected locally");

  // Active documents & loading state
  const [posts, setPosts] = useState<JekyllPost[]>(SEED_POSTS);
  const [activePost, setActivePost] = useState<JekyllPost>(SEED_POSTS[0]);
  const [activeFileTab, setActiveFileTab] = useState<string>("posts"); // "posts" | "drafts" | "assets" | "config"

  // Editor states
  const [editorMode, setEditorMode] = useState<"visual" | "raw" | "split">("split");
  const [draftTitle, setDraftTitle] = useState<string>(SEED_POSTS[0].frontMatter.title || "");
  const [draftMarkdown, setDraftMarkdown] = useState<string>(SEED_POSTS[0].markdown);
  const [draftFrontMatter, setDraftFrontMatter] = useState<Record<string, any>>(SEED_POSTS[0].frontMatter);
  const [rawYAMLText, setRawYAMLText] = useState<string>("");
  const [showRawYAMLEditor, setShowRawYAMLEditor] = useState<boolean>(false);

  // Snapshot log system (IndexedDB/LocalStorage replacement simulation)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([
    {
      id: "snap-1",
      label: "Initial Chapter Import",
      createdAt: "2026-05-20T04:20:00Z",
      markdown: SEED_POSTS[0].markdown,
      frontMatter: SEED_POSTS[0].frontMatter,
      reason: "manual",
      postPath: SEED_POSTS[0].path,
    },
  ]);

  // Asset pipelines states
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Theme settings and customization state
  const [themeConfig, setThemeConfig] = useState({
    activeTheme: "minima",
    remoteTheme: "",
    headingFont: "Special Elite",
    bodyFont: "Crimson Pro",
  });

  // Jekyll plugins with safe/unsafe labels
  const [plugins, setPlugins] = useState([
    { name: "jekyll-feed", enabled: true, pagesSupported: true, description: "Generates an Atom feed of your Jekyll posts." },
    { name: "jekyll-seo-tag", enabled: true, pagesSupported: true, description: "Adds dynamic meta tags, titles, description, and canonical URLs for search engines." },
    { name: "jekyll-sitemap", enabled: true, pagesSupported: true, description: "Automatically creates a Google-friendly sitemap file." },
    { name: "jekyll-paginate", enabled: false, pagesSupported: true, description: "Standard generator for post paginations." },
    { name: "jekyll-assets", enabled: false, pagesSupported: false, description: "Advanced asset pipeline with caching. WARNING: requires custom GitHub Actions." },
    { name: "jekyll-archives", enabled: false, pagesSupported: false, description: "Creates custom tag & category list pages automatically. WARNING: requires Custom GitHub Actions." },
  ]);

  // Active AI configs
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    provider: "gemini" as const,
    apiKeySource: "server-env" as const,
    model: "gemini-3.5-flash",
    temperature: 0.7,
    maxTokens: 1500,
    systemPrompt: "You are Jekyll Forge AI, an expert static blog developer tutor. You answer inside typewriter-ink layout guidelines.",
    brandVoicePrompt: "Tone should be nostalgic, witty, with clear structured lists & elegant headers. Avoid contemporary tech buzzwords.",
  });
  const [openaiKey, setOpenaiKey] = useState("");

  // Search filter inside repo explorer
  const [fileSearch, setFileSearch] = useState("");

  // Alerts, warnings and modals
  const [unsupportedPluginAlert, setUnsupportedPluginAlert] = useState<boolean>(false);
  const [showWorkflowGenerator, setShowWorkflowGenerator] = useState<boolean>(false);
  const [showCustomKeyModal, setShowCustomKeyModal] = useState<boolean>(false);
  const [newCustomKey, setNewCustomKey] = useState("");
  const [newCustomVal, setNewCustomVal] = useState("");

  // Diagnostic states
  const [seoReport, setSeoReport] = useState<SEOReportItem[]>([]);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [commandQuery, setCommandQuery] = useState("");

  // File configs
  const [configYmlContent, setConfigYmlContent] = useState<string>(`# Jekyll Vintage config
title: Jekyll Vintage Chronicles
email: editor@vintage-scribe.org
description: >-
  A literary blog exploring mechanical artifacts and nostalgic analogue devices.
baseurl: ""
url: "https://your-github-username.github.io"
theme: minima
plugins:
  - jekyll-feed
  - jekyll-seo-tag
  - jekyll-sitemap
`);

  const [gemfileContent, setGemfileContent] = useState<string>(`source "https://rubygems.org"
gem "jekyll", "~> 4.3.2"
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-seo-tag", "~> 2.8"
  gem "jekyll-sitemap", "~> 1.4"
end
`);

  // Auto-save trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate Autosave
      const newSnapshot: Snapshot = {
        id: `snap-auto-${Date.now()}`,
        label: `Autosave: ${draftTitle.slice(0, 20) || "Untitled post"}`,
        createdAt: new Date().toISOString(),
        postPath: activePost.path,
        markdown: draftMarkdown,
        frontMatter: draftFrontMatter,
        reason: "autosave",
      };
      setSnapshots((prev) => [newSnapshot, ...prev.slice(0, 19)]);
      setStatusText(`Draft autosaved locally at ${new Date().toLocaleTimeString()}`);
    }, 15000); // 15 seconds of silence triggered autosave
    return () => clearTimeout(timer);
  }, [draftMarkdown, draftTitle, draftFrontMatter, activePost]);

  // Compute live audits
  useEffect(() => {
    const items: SEOReportItem[] = [];

    // SEO Title
    if (!draftTitle) {
      items.push({ id: "seo-1", type: "seo", severity: "critical", message: "Missing front-matter page title." });
    } else if (draftTitle.length < 15) {
      items.push({ id: "seo-2", type: "seo", severity: "warning", message: "Short post title. Aim for 30-60 detailed characters." });
    } else if (draftTitle.length > 70) {
      items.push({ id: "seo-3", type: "seo", severity: "warning", message: "Long title. May truncate on search engine previews." });
    }

    // Excerpt description
    const desc = draftFrontMatter.description || "";
    if (!desc) {
      items.push({ id: "seo-4", type: "seo", severity: "critical", message: "No meta 'description' field. Crucial for sitemap index grids." });
    } else if (desc.length > 165) {
      items.push({ id: "seo-5", type: "seo", severity: "warning", message: "Overlong description. Truncates on mobile layout indexes." });
    }

    // Markdown analysis
    const wordCount = countWords(draftMarkdown);
    if (wordCount < 100) {
      items.push({ id: "seo-6", type: "structure", severity: "warning", message: "Extremely thin content. Expand below 200 words to improve ranking." });
    }

    // Accessibility Checks: Headers
    if (draftMarkdown.includes("# ") && draftMarkdown.split("\n").filter(l => l.startsWith("# ")).length > 1) {
      items.push({ id: "a11y-1", type: "accessibility", severity: "warning", message: "Multiple top-level H1 tags detected. Prefer single visual layout standard." });
    }

    // Images alt detection
    const imageMatches = draftMarkdown.match(/!\[(.*?)\]\((.*?)\)/g) || [];
    let emptyAltCount = 0;
    imageMatches.forEach(img => {
      if (img.startsWith("![]") || img.startsWith('![""]')) emptyAltCount++;
    });
    if (emptyAltCount > 0) {
      items.push({ id: "a11y-2", type: "accessibility", severity: "critical", message: `${emptyAltCount} image(s) missing reader Alternative text (alt).` });
    }

    // Liquid formatting rules
    if (draftMarkdown.includes("{%") && !draftMarkdown.includes("%}")) {
      items.push({ id: "seo-7", type: "structure", severity: "critical", message: "Mismatched Liquid syntax brackets detected." });
    }

    setSeoReport(items);
  }, [draftMarkdown, draftTitle, draftFrontMatter]);

  // Hotkey hook: Ctrl+S and Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        // Manual snapshot trigger
        const newSnapshot: Snapshot = {
          id: `snap-manual-${Date.now()}`,
          label: `Manual Save: ${draftTitle || "Untitled Draft"}`,
          createdAt: new Date().toISOString(),
          postPath: activePost.path,
          markdown: draftMarkdown,
          frontMatter: draftFrontMatter,
          reason: "manual",
        };
        setSnapshots((prev) => [newSnapshot, ...prev]);
        setStatusText("Named snapshot archived safely inside browser database.");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [draftMarkdown, draftTitle, draftFrontMatter, activePost]);

  // Handle post switching
  const handleSelectPost = (post: JekyllPost) => {
    // Commit current draft state to active post object
    const updatedPosts = posts.map((p) => {
      if (p.path === activePost.path) {
        return {
          ...p,
          markdown: draftMarkdown,
          frontMatter: draftFrontMatter,
          slug: draftFrontMatter.title ? draftFrontMatter.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : p.slug,
          filename: `${p.filename.slice(0, 10)}-${draftFrontMatter.title ? draftFrontMatter.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : p.slug}.md`,
        };
      }
      return p;
    });
    setPosts(updatedPosts);

    // Load new post
    setActivePost(post);
    setDraftTitle(post.frontMatter.title || "");
    setDraftMarkdown(post.markdown);
    setDraftFrontMatter(post.frontMatter);
    setRawYAMLText(JSON.stringify(post.frontMatter, null, 2));
    setStatusText(`Switched file viewport to: ${post.path}`);
  };

  // Create new blank draft post
  const handleCreateNewPost = (isDraft: boolean) => {
    const today = new Date().toISOString().split("T")[0];
    const newFileName = `${today}-new-chronicle-entry.md`;
    const newPath = isDraft ? `_drafts/new-chronicle-entry.md` : `_posts/${newFileName}`;
    
    const newPost: JekyllPost = {
      path: newPath,
      filename: isDraft ? "new-chronicle-entry.md" : newFileName,
      slug: "new-chronicle-entry",
      frontMatter: {
        layout: "post",
        title: "New Editorial Record",
        date: `${today} 12:00:00 -0600`,
        author: "Anonymous Editor",
        categories: ["record"],
        tags: ["vessel", "ink"],
        description: "A blank canvas page waiting for vintage mechanical documentation.",
        image: "",
      },
      markdown: `# Start your vintage story here\n\nWrite something beautiful. Standard Markdown and Liquid formatting are supported. Use the Right sidebar tools to inject SEO or parse with Gemini AI.`,
      status: isDraft ? "draft" : "new",
    };

    setPosts([newPost, ...posts]);
    handleSelectPost(newPost);
    setStatusText(`Successfully created blank document at: ${newPath}`);
  };

  // Generate dynamic GitHub Commit payloads and publish
  const handlePublishFile = async () => {
    setStatusText("Committing changes directly to raw GitHub API Tree...");
    
    // Validate Front Matter Title
    if (!draftTitle.trim()) {
      alert("Validation failed: All Jekyll files require a valid layout 'title' field.");
      setStatusText("Commit canceled.");
      return;
    }

    // Build the Jekyll-compatible formatting content string
    const fullyFormattedText = formatJekyllPost(draftFrontMatter, draftMarkdown);

    // Visual loading simulation
    setTimeout(() => {
      // Move if it was marked as a draft asset
      const resolvedPost: JekyllPost = {
        ...activePost,
        markdown: draftMarkdown,
        frontMatter: { ...draftFrontMatter, title: draftTitle },
        status: "published",
        path: activePost.path.startsWith("_drafts") 
          ? `_posts/${new Date().toISOString().split("T")[0]}-${activePost.slug}.md`
          : activePost.path
      };

      setPosts(prev => prev.map(p => p.path === activePost.path ? resolvedPost : p));
      setActivePost(resolvedPost);
      setStatusText(`Published payload to GitHub! Commit SHA: ${Math.random().toString(16).slice(2, 10)}`);
      
      const newSnap: Snapshot = {
        id: `snap-publish-${Date.now()}`,
        label: `Published: ${draftTitle}`,
        createdAt: new Date().toISOString(),
        postPath: resolvedPost.path,
        markdown: draftMarkdown,
        frontMatter: draftFrontMatter,
        reason: "before-publish",
      };
      setSnapshots(prev => [newSnap, ...prev]);

      alert(`Published Successfully!\n\nDestination: ${resolvedPost.path}\nCommit Status: Green\nDeployment queue triggered inside '${selectedRepo.owner}/${selectedRepo.name}' repository branch.`);
    }, 1500);
  };

  // Delete post
  const handleDeletePost = (pathToDelete: string) => {
    if (!window.confirm("Are you absolutely sure you want to remove this Jekyll document from the files database? This action cannot be reversed without local snapshots.")) {
      return;
    }
    const filtered = posts.filter(p => p.path !== pathToDelete);
    setPosts(filtered);
    if (activePost.path === pathToDelete && filtered.length > 0) {
      handleSelectPost(filtered[0]);
    }
    setStatusText("Document removed from workspace files cache.");
  };

  // Snapshot Restoration
  const handleRestoreSnapshot = (snap: Snapshot) => {
    if (window.confirm(`Would you like to revert the current workspace back to history state: "${snap.label}"?`)) {
      setDraftMarkdown(snap.markdown);
      setDraftFrontMatter(snap.frontMatter);
      if (snap.frontMatter.title) setDraftTitle(snap.frontMatter.title);
      setStatusText(`Reverted canvas to historic backup state from: ${new Date(snap.createdAt).toLocaleTimeString()}`);
    }
  };

  // Simulated asset upload with dropzone and format converter
  const handleSimulateAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setStatusText(`Received image '${file.name}'. Running WebP optimization pipeline...`);

    setTimeout(() => {
      const optimizedName = file.name.split(".")[0] + ".webp";
      const newAsset: Asset = {
        path: `assets/images/${optimizedName}`,
        name: optimizedName,
        url: URL.createObjectURL(file), // create sandbox URL for previewing
        mimeType: "image/webp",
        size: Math.round(file.size * 0.42), // simulated 58% compression ratio
        width: 1200,
        height: 800,
        alt: `Optimized web version of client asset target: ${file.name}`,
      };

      setAssets(prev => [newAsset, ...prev]);
      setStatusText(`Optimized media added and Exif data stripped. Reference path: /${newAsset.path}`);
      
      // Inject image format code directly into active document
      const insertMarker = `\n\n![${newAsset.alt}](/${newAsset.path})`;
      setDraftMarkdown(prev => prev + insertMarker);
    }, 1200);
  };

  // Modify Front matter array lists (categories / tags)
  const handleUpdateArrayField = (field: "categories" | "tags", valueString: string) => {
    const items = valueString.split(",").map(i => i.trim()).filter(Boolean);
    setDraftFrontMatter(prev => ({ ...prev, [field]: items }));
  };

  // Add custom Key to front matter
  const handleAddCustomKey = () => {
    if (!newCustomKey.trim() || !newCustomVal.trim()) return;
    setDraftFrontMatter(prev => ({ ...prev, [newCustomKey.trim()]: newCustomVal.trim() }));
    setNewCustomKey("");
    setNewCustomVal("");
    setShowCustomKeyModal(false);
    setStatusText("Custom front-matter descriptor added successfully!");
  };

  // Remove Key
  const handleRemoveCustomKey = (key: string) => {
    const updated = { ...draftFrontMatter };
    delete updated[key];
    setDraftFrontMatter(updated);
  };

  // Safe plugin activation check
  const handleTogglePlugin = (pluginName: string, currentlyEnabled: boolean) => {
    const p = plugins.find(pl => pl.name === pluginName);
    if (!p) return;

    if (!currentlyEnabled && !p.pagesSupported) {
      setUnsupportedPluginAlert(true);
      return;
    }

    setPlugins(prev => prev.map(pl => pl.name === pluginName ? { ...pl, enabled: !pl.enabled } : pl));
    setStatusText(`Toggled active status of Jekyll plugin: ${pluginName}`);
  };

  // Generate ZIP backup download package
  const handleDownloadZIPPackage = () => {
    const postsData = posts.map(p => ({
      path: p.path,
      content: formatJekyllPost(p.path === activePost.path ? draftFrontMatter : p.frontMatter, p.path === activePost.path ? draftMarkdown : p.markdown)
    }));

    const configData = {
      path: "_config.yml",
      content: configYmlContent,
    };

    const payload = JSON.stringify({ posts: postsData, config: configData, assets: assets.map(a => a.path) }, null, 2);
    
    // Download File Blob
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jekyll-forge-backup-${selectedRepo.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusText("Workspace export archive saved payload downloaded.");
  };

  // Dynamic GitHub Actions Generator Content
  const actionWorkflowTemplate = `name: Deploy Jekyll site with Plugins to Pages

on:
  push:
    branches: ["\${{ github.event.repository.default_branch }}"]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      
      - name: Setup Ruby and Bundler
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
          bundler-cache: true
          
      - name: Build with Jekyll
        run: bundle exec jekyll build
        env:
          JEKYLL_ENV: production
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy static content to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  // Filter posts based on search index
  const filteredPosts = posts.filter(p => {
    const term = fileSearch.toLowerCase();
    return (
      p.path.toLowerCase().includes(term) ||
      (p.frontMatter.title && p.frontMatter.title.toLowerCase().includes(term)) ||
      (p.frontMatter.author && p.frontMatter.author.toLowerCase().includes(term))
    );
  });

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      themeMode === "warm" ? "bg-[#fbf9f4] text-[#2c2421]" : "bg-zinc-950 text-zinc-100"
    }`}>
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className={`border-b flex items-center justify-between px-4 py-3 shrink-0 ${
        themeMode === "warm" ? "border-amber-900/10 bg-[#f7f2ea]" : "border-zinc-800 bg-zinc-950"
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="grungy-stamp border-crimson text-crimson text-[11px] font-bold tracking-widest bg-crimson/5">
              JEKYLL FORGE
            </span>
            <div className={`h-4 w-[1px] ${themeMode === "warm" ? "bg-amber-950/20" : "bg-zinc-800"}`}></div>
            <span className="font-sans text-xs font-medium opacity-75 hidden sm:inline">
              GitHub-Powered Vintage Press
            </span>
          </div>

          {/* Repository Dropdown Selector */}
          <div className="flex items-center gap-1.5 ml-2">
            <Folder className="w-4 h-4 text-crimson opacity-80" />
            <select
              value={selectedRepo.name}
              onChange={(e) => {
                const target = repositories.find(r => r.name === e.target.value);
                if (target) {
                  setSelectedRepo(target);
                  setStatusText(`Mounted repository instance: ${target.name}`);
                }
              }}
              className={`text-xs font-elite px-2 py-1 rounded border outline-none cursor-pointer ${
                themeMode === "warm" 
                  ? "bg-[#faf6ee] border-amber-950/15 text-amber-950" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-crimson"
              }`}
            >
              {repositories.map(r => (
                <option key={r.name} value={r.name}>{r.owner}/{r.name}</option>
              ))}
            </select>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-crimson/10 text-crimson tracking-wider">
              {selectedRepo.selectedBranch}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick theme toggler */}
          <div className="flex items-center rounded-lg border border-dashed border-crimson/20 p-0.5">
            <button
              onClick={() => setThemeMode("warm")}
              className={`px-2 py-1 rounded text-xs font-elite transition-colors ${
                themeMode === "warm" ? "bg-crimson text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Classic Cream
            </button>
            <button
              onClick={() => setThemeMode("dark")}
              className={`px-2 py-1 rounded text-xs font-elite transition-colors ${
                themeMode === "dark" ? "bg-crimson text-white" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Monochrome Ink
            </button>
          </div>

          <button
            onClick={() => setShowCommandPalette(true)}
            title="Search Actions (Ctrl + K)"
            className={`p-1.5 rounded border flex items-center gap-1 text-xs transition-colors ${
              themeMode === "warm" 
                ? "bg-[#faf6ee] border-amber-950/20 text-neutral-600 hover:bg-[#eae3d5]" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <Command className="w-3.5 h-3.5 text-crimson" />
            <kbd className="text-[9px] opacity-70">⌘K</kbd>
          </button>

          {/* GitHub Connection Modal launcher */}
          <button
            onClick={() => setShowGithubSetup(prev => !prev)}
            className={`font-elite text-xs py-1.5 px-3 rounded flex items-center gap-1.5 cursor-pointer border ${
              githubToken 
                ? "bg-emerald-950/20 border-emerald-800/50 text-emerald-400" 
                : "bg-crimson hover:bg-crimson-hover text-white border-transparent"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{githubToken ? "Connected Account" : "Access Credentials"}</span>
          </button>

          {/* Download Local Backup (JSON) */}
          <button
            onClick={handleDownloadZIPPackage}
            className={`p-1.5 rounded border transition-all hover:text-crimson ${
              themeMode === "warm" ? "border-amber-950/20 text-amber-950 bg-[#faf6ee]" : "border-zinc-800 text-zinc-300 bg-zinc-900"
            }`}
            title="Download full Jekyll export payload"
          >
            <FileDown className="w-4 h-4" />
          </button>

          {/* Commit & Publish Trigger */}
          <button
            onClick={handlePublishFile}
            className="bg-transparent border-2 border-dashed border-crimson text-crimson hover:bg-crimson hover:text-white transition-colors py-1.5 px-4 rounded-md font-elite text-xs flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Publish To Live Pages</span>
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT LAYOUT SPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT WORKSPACE SIDEBAR PANEL */}
        <aside className={`w-80 flex flex-col border-r divide-y overflow-y-auto shrink-0 ${
          themeMode === "warm" 
            ? "border-amber-900/10 bg-[#faf6ee] divide-amber-950/10" 
            : "border-zinc-800 bg-zinc-950 divide-zinc-900"
        }`}>
          
          {/* Section A: Search & Quick Create controls */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-elite text-xs uppercase tracking-widest text-crimson font-bold">
                📖 Editorial Files
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCreateNewPost(false)}
                  title="Make New Post (Live)"
                  className="p-1 rounded hover:bg-crimson/10 text-crimson border border-dashed border-crimson/30 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleCreateNewPost(true)}
                  title="Make New Draft"
                  className="px-1.5 py-0.5 text-[9px] font-elite uppercase rounded border border-zinc-800 text-zinc-400 hover:text-red-300 transition-colors"
                >
                  + Draft
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search markdown files..."
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className={`w-full font-mono text-xs pl-8 pr-3 py-2 rounded outline-none border ${
                  themeMode === "warm" 
                    ? "bg-[#f5eeea] border-amber-950/15 text-amber-950 placeholder:text-neutral-500" 
                    : "bg-zinc-900/70 border-zinc-800 text-zinc-300 placeholder:text-zinc-600 focus:border-crimson"
                }`}
              />
            </div>
          </div>

          {/* Section B: File navigation sub-tabs */}
          <div>
            <div className={`flex text-center border-b ${
              themeMode === "warm" ? "border-amber-950/5" : "border-zinc-900"
            }`}>
              {["posts", "assets", "config", "plugins"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFileTab(tab)}
                  className={`flex-1 py-2 font-elite text-[10px] uppercase tracking-wider transition-colors border-b-2 ${
                    activeFileTab === tab
                      ? "border-crimson text-crimson font-bold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List renders based on dynamic left sidebar tab selection */}
            <div className="p-2 space-y-1">
              
              {/* Category: Posts & Drafts */}
              {activeFileTab === "posts" && (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 px-2 pt-2 font-elite">
                    Active Jekyll Repository Records
                  </div>
                  {filteredPosts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-500 italic">No files match your query</div>
                  ) : (
                    filteredPosts.map((post) => {
                      const isSelected = activePost.path === post.path;
                      return (
                        <div
                          key={post.path}
                          className={`group w-full text-left p-2.5 rounded-md cursor-pointer transition-all border flex flex-col gap-1 ${
                            isSelected
                              ? "bg-crimson/5 border-crimson text-red-100"
                              : "border-transparent text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200"
                          }`}
                          onClick={() => handleSelectPost(post)}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-1.5 font-sans font-semibold text-xs leading-normal">
                              <FileText className="w-3.5 h-3.5 text-crimson/80 shrink-0" />
                              <span className="line-clamp-1">{post.frontMatter.title || "Untitled"}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.path);
                              }}
                              className="text-zinc-600 hover:text-crimson opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                            <span>{post.filename.slice(0, 10)}</span>
                            <span className="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
                              {post.frontMatter.layout || "post"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {/* Category: Media Assets Asset list */}
              {activeFileTab === "assets" && (
                <div className="p-2 space-y-3">
                  <div className="border border-dashed border-zinc-800 p-4 rounded-lg bg-zinc-950/50 text-center relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSimulateAssetUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <Upload className="w-6 h-6 text-crimson mx-auto mb-1 animate-bounce" />
                    <span className="text-[10px] font-elite block text-zinc-400 uppercase">Optimize Asset</span>
                    <span className="text-[8px] text-zinc-600 block mt-0.5">Drag-and-drop auto WEBP conversions</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-elite text-zinc-500 uppercase block border-b border-zinc-900 pb-1">
                      ■ Current Assets Catalog (/assets/images/)
                    </span>
                    {assets.map((asset) => (
                      <div key={asset.path} className="p-2 border border-zinc-900 bg-zinc-900/40 rounded flex items-center gap-2">
                        <img src={asset.url} alt={asset.alt} className="w-10 h-10 object-cover rounded bg-zinc-950" />
                        <div className="flex-1 min-w-0 font-mono text-[9px] text-zinc-400">
                          <p className="truncate text-zinc-300 font-bold">{asset.name}</p>
                          <p>{Math.round((asset.size || 0) / 1024)} KB • {asset.mimeType}</p>
                        </div>
                        <button
                          onClick={() => {
                            const markdownCode = `![${asset.alt || ""}](${asset.path})`;
                            navigator.clipboard.writeText(markdownCode);
                            alert(`Markdown asset reference copied:\n\n${markdownCode}`);
                          }}
                          className="p-1 hover:text-crimson font-mono text-[10px]"
                          title="Copy Markdown code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Config Files panel */}
              {activeFileTab === "config" && (
                <div className="p-2 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-zinc-500 font-elite text-[10px]">
                      <span>_CONFIG.YML EDITOR</span>
                      <span className="font-mono text-emerald-400 text-[8px]">ACTIVE</span>
                    </div>
                    <textarea
                      value={configYmlContent}
                      onChange={(e) => setConfigYmlContent(e.target.value)}
                      rows={8}
                      className="w-full bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-mono text-[11px] p-2 rounded focus:border-crimson outline-none leading-relaxed"
                    />
                    <button
                      onClick={() => alert("Simulated config commit successfully written to repository core!")}
                      className="w-full py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-elite text-[10px] rounded"
                    >
                      Save Configuration Settings
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-zinc-500 font-elite text-[10px]">
                      <span>GEMFILE (DEPS MANIFEST)</span>
                      <span className="font-mono text-zinc-500 text-[8px]">LOCK</span>
                    </div>
                    <textarea
                      value={gemfileContent}
                      onChange={(e) => setGemfileContent(e.target.value)}
                      rows={5}
                      className="w-full bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-mono text-[11px] p-2 rounded focus:border-crimson outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Category: Custom plugins explorer */}
              {activeFileTab === "plugins" && (
                <div className="p-2 space-y-3">
                  <div className="p-3 bg-crimson/10 border-l border-crimson text-[11px] text-red-300 leading-relaxed font-sans mt-1">
                    <strong className="font-elite text-crimson text-[11px] uppercase tracking-wider block mb-1">
                      ☠ CRITICAL PLUGIN WARNING:
                    </strong>
                    GitHub Pages does not support every Jekyll plugin when using the default build pipeline. Unsupported plugins require a **custom GitHub Actions workflow** to compile safely.
                  </div>

                  <div className="space-y-2">
                    {plugins.map((p) => (
                      <div key={p.name} className="p-2.5 border border-zinc-900 bg-zinc-900/30 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-zinc-300">{p.name}</span>
                          <span className={`text-[8px] font-elite px-1 rounded ${
                            p.pagesSupported ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-500"
                          }`}>
                            {p.pagesSupported ? "Pages Safe" : "Actions req."}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-normal">{p.description}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] text-zinc-600 font-mono">Status</span>
                          <button
                            onClick={() => handleTogglePlugin(p.name, p.enabled)}
                            className={`px-2 py-0.5 text-[9px] font-elite rounded border ${
                              p.enabled
                                ? "bg-crimson/20 border-crimson text-red-300"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500"
                            }`}
                          >
                            {p.enabled ? "RUNNING" : "DISABLED"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowWorkflowGenerator(true)}
                    className="w-full bg-crimson/10 border border-crimson/30 hover:bg-crimson/20 text-red-300 font-elite text-[10px] py-1.5 rounded text-center block"
                  >
                    Generate Actions Build Pipeline
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Section C: Snapshots & Offline draft backup history */}
          <div className="p-4 flex-1 flex flex-col min-h-[180px]">
            <span className="font-elite text-[10px] uppercase tracking-widest text-zinc-500 block mb-2">
              ■ SNAPSHOT RESTORE POINTS
            </span>
            <div className="space-y-2 overflow-y-auto flex-1 max-h-48 pr-1">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  onClick={() => handleRestoreSnapshot(snap)}
                  className="p-2 bg-zinc-900/50 border border-zinc-900 rounded-lg hover:border-zinc-700 cursor-pointer text-left transition-all"
                >
                  <div className="flex items-center justify-between mb-0.5 text-[9px] font-mono">
                    <span className={`font-semibold ${snap.reason === "autosave" ? "text-amber-500" : "text-crimson"}`}>
                      {snap.reason.toUpperCase()}
                    </span>
                    <span className="text-zinc-500">{new Date(snap.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-elite truncate">{snap.label}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 text-[9px] text-zinc-600 font-mono leading-normal text-center">
              * Local changes saved to memory. Revert timeline at any time.
            </div>
          </div>

        </aside>

        {/* CENTER STAGE: VISUAL WYSIWYG & CODE EDITOR */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Editor Header controls bar */}
          <div className={`px-4 py-2 border-b flex items-center justify-between select-none ${
            themeMode === "warm" ? "border-amber-900/10 bg-[#f7f2ea]" : "border-zinc-800 bg-zinc-950"
          }`}>
            <div className="flex items-center gap-2">
              <span className="font-elite text-xs text-zinc-500">CANVAS STAGE:</span>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => {
                  setDraftTitle(e.target.value);
                  setDraftFrontMatter(prev => ({ ...prev, title: e.target.value }));
                }}
                className={`font-elite text-sm font-bold bg-transparent border-b border-dashed border-zinc-700/50 outline-none text-red-100 px-1 py-0.5 min-w-[200px] sm:min-w-[320px] focus:border-crimson`}
                placeholder="Blog post dynamic heading..."
              />
            </div>

            {/* Visual formatting buttons */}
            <div className="flex items-center gap-1">
              {/* Active editing mode selector */}
              {["visual", "raw", "split"].map((m) => (
                <button
                  key={m}
                  onClick={() => setEditorMode(m as any)}
                  className={`px-3 py-1 rounded text-xs font-elite capitalize transition-all cursor-pointer ${
                    editorMode === m
                      ? "bg-crimson text-white font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {m} Editor
                </button>
              ))}
            </div>
          </div>

          {/* Core Applet Workspace Split Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-y-auto">
            
            {/* Split column left: Text Content Area */}
            <div className={`h-full flex flex-col overflow-y-auto ${
              editorMode === "raw" ? "lg:col-span-12" : editorMode === "visual" ? "lg:col-span-12" : "lg:col-span-6"
            }`}>
              
              {/* Mini Toolbar for formatting */}
              <div className="p-2 border-b border-zinc-800 bg-zinc-950/20 flex gap-1 items-center flex-wrap shrink-0">
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n\n## Section Head")}
                  className="p-1 text-xs hover:text-crimson font-elite border border-zinc-900 rounded bg-zinc-900/50"
                  title="Insert Header"
                >
                  H2
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + " **bold_text**")}
                  className="p-1 text-xs hover:text-crimson font-elite border border-zinc-900 rounded bg-zinc-900/50"
                  title="Make bold"
                >
                  B
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + " *italic_text*")}
                  className="p-1 text-xs hover:text-crimson font-elite border border-zinc-900 rounded bg-zinc-900/50"
                  title="Make italic"
                >
                  I
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n*   Item 1\n*   Item 2")}
                  className="p-1 text-xs hover:text-crimson font-elite border border-zinc-900 rounded bg-zinc-900/50"
                  title="Insert Bullet List"
                >
                  List
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n> [!NOTE]\n> Typographical editorial box.")}
                  className="p-1 text-[10px] hover:text-crimson font-elite border border-zinc-900 rounded bg-zinc-900/50 text-crimson"
                  title="Insert Note Callout Block"
                >
                  Note Box
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n| Topic | Value | \n|---|---| \n| Item | Description |")}
                  className="p-1 text-xs hover:text-crimson font-elite border border-zinc-910 rounded bg-zinc-900/50"
                  title="Insert Table grid"
                >
                  Table
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n\n```yaml\n# code block\n```")}
                  className="p-1 text-xs hover:text-crimson font-elite border border-zinc-900 rounded bg-zinc-900/50"
                >
                  Code Block
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n{% include footer.html %}")}
                  className="p-1 text-[10px] text-pink-400 font-mono hover:text-crimson border border-zinc-900 rounded bg-zinc-900/50"
                  title="Insert Jekyll Liquid include tag"
                >
                  &#123;% Liquid %&#125;
                </button>
              </div>

              {/* Editable body textbox */}
              <div className="flex-1 p-4 relative min-h-[400px]">
                {editorMode === "visual" ? (
                  <div className="w-full h-full flex flex-col">
                    <span className="text-[10px] font-elite text-zinc-500 uppercase block mb-2 tracking-widest leading-none">
                      📖 Vintage typewriter paper sheets view
                    </span>
                    <textarea
                      value={draftMarkdown}
                      onChange={(e) => setDraftMarkdown(e.target.value)}
                      className={`w-full flex-1 border-0 resize-none outline-none font-sans text-lg focus:ring-0 leading-relaxed`}
                      style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
                      placeholder="Typewriter keys waiting to strike cotton paper sheets..."
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col font-mono text-sm leading-relaxed text-zinc-300">
                    <span className="text-[10px] font-elite text-zinc-500 uppercase block mb-2 tracking-widest leading-none">
                      ⌨ RAW MARKDOWN CODE MODE WITH SYNTAX MARKUPS
                    </span>
                    <textarea
                      value={draftMarkdown}
                      onChange={(e) => setDraftMarkdown(e.target.value)}
                      className="w-full flex-1 bg-transparent resize-none border-0 outline-none font-mono focus:ring-0 text-amber-100/90 selection:bg-crimson/30"
                      placeholder="## Chapter heading..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Split column right: Visual Preview viewport */}
            {editorMode === "split" && (
              <div className={`lg:col-span-6 h-full flex flex-col border-l overflow-y-auto ${
                themeMode === "warm" ? "border-amber-900/10 bg-[#faf6ee]" : "border-zinc-800 bg-zinc-950/20"
              }`}>
                <div className={`px-4 py-2 border-b flex items-center justify-between shrink-0 font-elite text-xs ${
                  themeMode === "warm" ? "border-amber-950/10 bg-[#f5eeea] text-amber-950" : "border-zinc-800 bg-zinc-900/40 text-zinc-400"
                }`}>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-crimson" />
                    <span>Nostalgic Live Scribe Preview</span>
                  </div>
                  <span className="font-mono text-[9px] uppercase text-zinc-500">
                    {countWords(draftMarkdown)} words • {estimateReadingTime(draftMarkdown)} min read
                  </span>
                </div>

                <div className="p-6 font-sans">
                  {/* Styled Header mimicking actual Jekyll layout files */}
                  <div className="border-b-2 border-dashed border-zinc-700 pb-4 mb-6">
                    <span className="text-xs font-elite text-crimson tracking-wider uppercase inline-block pr-1">
                      {draftFrontMatter.layout ? `layout: ${draftFrontMatter.layout}` : "no layout"}
                    </span>
                    {draftFrontMatter.categories && draftFrontMatter.categories.length > 0 && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        in {draftFrontMatter.categories.join(", ")}
                      </span>
                    )}

                    <h1 className="text-3xl font-black font-elite tracking-tight text-white mt-2 leading-tight">
                      {draftTitle || "Untitled Chapter Draft"}
                    </h1>
                    
                    <div className="flex flex-wrap gap-2 items-center text-xs text-zinc-400 mt-2 font-mono">
                      <span>Author: <strong className="text-zinc-300">{draftFrontMatter.author || "Global Editor"}</strong></span>
                      <span>•</span>
                      <span>Date: {draftFrontMatter.date || new Date().toISOString()}</span>
                    </div>

                    {/* Metadata tags line */}
                    {draftFrontMatter.tags && draftFrontMatter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {draftFrontMatter.tags.map((t: string) => (
                          <span key={t} className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* HTML rendered markdown */}
                  <div
                    className="prose prose-invert max-w-none text-left leading-relaxed text-zinc-300"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(draftMarkdown, selectedRepo.owner, selectedRepo.name, selectedRepo.selectedBranch),
                    }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* LOWER INTERACTIVE SHEETS: AI PLUGINS AND SYSTEM AUDITS */}
          <div className="border-t border-zinc-800 bg-zinc-950 p-6 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Category: Real-time Writing & Editing Assistant */}
              <div className="xl:col-span-7 border border-zinc-800/80 rounded-lg p-5 bg-zinc-900/30">
                <AIAssistant
                  currentPostMarkdown={draftMarkdown}
                  currentPostTitle={draftTitle}
                  onModifyContent={(newContent) => setDraftMarkdown(newContent)}
                  onModifyFrontMatter={(key, val) => {
                    setDraftFrontMatter(prev => ({ ...prev, [key]: val }));
                    if (key === "title") setDraftTitle(val);
                  }}
                  brandVoicePrompt={aiSettings.brandVoicePrompt}
                />
              </div>

              {/* Category: System SEO Checklists & Alt Text Verifier */}
              <div className="xl:col-span-5 border border-zinc-800/80 rounded-lg p-5 bg-zinc-900/30 flex flex-col">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-3">
                  <Terminal className="w-4 h-4 text-crimson" />
                  <h4 className="font-elite text-zinc-200">Site Quality & Accessibility Audits</h4>
                </div>

                <div className="space-y-2.5 flex-1 max-h-[300px] overflow-y-auto pr-1">
                  {seoReport.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500 italic">
                      ✓ No warnings found! Your post conforms perfectly to Jekyll production standards.
                    </div>
                  ) : (
                    seoReport.map((rep) => (
                      <div
                        key={rep.id}
                        className={`p-3 border rounded-lg flex gap-2 text-xs leading-normal ${
                          rep.severity === "critical"
                            ? "bg-red-950/20 border-red-900/30 text-red-400"
                            : rep.severity === "warning"
                            ? "bg-amber-950/20 border-amber-900/30 text-amber-300"
                            : "bg-zinc-900/50 border-zinc-800 text-zinc-300"
                        }`}
                      >
                        <div className="pt-0.5">
                          {rep.severity === "critical" ? "☠" : rep.severity === "warning" ? "▲" : "■"}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[10px] uppercase font-elite text-zinc-400">
                            {rep.type.toUpperCase()} • {rep.severity.toUpperCase()}
                          </p>
                          <p className="text-zinc-200 mt-0.5">{rep.message}</p>
                        </div>
                        {rep.type === "seo" && rep.message.includes("meta") && (
                          <button
                            onClick={() => {
                              // Trigger automatic fix with custom tags
                              setDraftFrontMatter(prev => ({
                                ...prev,
                                description: draftMarkdown.slice(0, 150).replace(/[#\*_>\[\]!]/g, "") + "..."
                              }));
                              setStatusText("Estimated description added to front-matter metadata.");
                            }}
                            className="text-[9px] font-elite text-crimson hover:underline shrink-0"
                          >
                            AUTO-GEN
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 p-3 bg-zinc-900/40 border border-zinc-800 rounded text-[11px] text-zinc-400 font-sans leading-relaxed">
                  <span className="font-elite text-crimson block mb-2 leading-none uppercase">
                    ■ Theme Font Styling Pairing
                  </span>
                  Configured Heading Google Font is <strong className="text-zinc-200">{themeConfig.headingFont}</strong> and body is <strong className="text-zinc-200">{themeConfig.bodyFont}</strong>. Set custom configuration from the Settings panel below.
                </div>
              </div>

            </div>
          </div>

          {/* AI Settings Section */}
          <div className="border-t border-zinc-800 bg-zinc-950/40 p-6">
            <AISettings
              settings={aiSettings}
              onUpdate={(fields) => setAiSettings(prev => ({ ...prev, ...fields }))}
              openaiKey={openaiKey}
              onUpdateOpenaiKey={setOpenaiKey}
            />
          </div>

        </main>

        {/* RIGHT SIDEBAR PANEL: DETAILED METADATA & FRONT-MATTER FORM */}
        <aside className={`w-80 border-l p-4 flex flex-col gap-6 overflow-y-auto shrink-0 select-none ${
          themeMode === "warm" ? "border-amber-900/10 bg-[#faf6ee]" : "border-zinc-805 bg-zinc-950"
        }`}>
          
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-crimson" />
              <span className="font-elite text-xs uppercase tracking-widest text-zinc-300 font-bold">
                🛠 Front Matter Core
              </span>
            </div>
            
            <button
              onClick={() => setShowRawYAMLEditor(p => !p)}
              className="text-[9px] font-mono border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded hover:text-red-300"
            >
              {showRawYAMLEditor ? "LITERAL FIELD" : "RAW YAML"}
            </button>
          </div>

          {showRawYAMLEditor ? (
            <div className="space-y-2">
              <span className="text-[10px] font-elite text-zinc-500 block uppercase">
                Raw YAML Key Value Code
              </span>
              <textarea
                value={JSON.stringify(draftFrontMatter, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setDraftFrontMatter(parsed);
                    if (parsed.title) setDraftTitle(parsed.title);
                  } catch (err) {}
                }}
                rows={12}
                className="w-full bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-mono text-[11px] p-2.5 rounded focus:border-crimson outline-none"
              />
              <p className="text-[9px] text-zinc-500 italic">
                * Edit fields inside raw JSON structure notation above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* layout */}
              <div>
                <label className="block text-[10px] font-elite text-zinc-500 uppercase tracking-widest mb-1 leading-none">
                  Page Layout
                </label>
                <select
                  value={draftFrontMatter.layout || "post"}
                  onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, layout: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs p-2 rounded focus:border-crimson outline-none cursor-pointer"
                >
                  <option value="post">post (Standard blog record)</option>
                  <option value="page">page (Static standalone site)</option>
                  <option value="default">default (Main wrapping wrapper)</option>
                  <option value="home">home (Landing container)</option>
                </select>
              </div>

              {/* slug / permalink */}
              <div>
                <label className="block text-[10px] font-elite text-zinc-500 uppercase tracking-widest mb-1 leading-none">
                  Dynamic URL Path Slug
                </label>
                <input
                  type="text"
                  value={draftFrontMatter.slug || activePost.slug}
                  onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs p-2 rounded focus:border-crimson outline-none"
                  placeholder="slug-value-record"
                />
              </div>

              {/* author */}
              <div>
                <label className="block text-[10px] font-elite text-zinc-500 uppercase tracking-widest mb-1 leading-none">
                  Author Signature
                </label>
                <input
                  type="text"
                  value={draftFrontMatter.author || ""}
                  onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs p-2 rounded focus:border-crimson outline-none"
                  placeholder="Oliver Sterling"
                />
              </div>

              {/* categories */}
              <div>
                <label className="block text-[10px] font-elite text-zinc-500 uppercase tracking-widest mb-1 leading-none flex justify-between">
                  <span>Categories Array</span>
                  <span className="font-mono text-[9px] text-zinc-500">Comma split</span>
                </label>
                <input
                  type="text"
                  value={draftFrontMatter.categories ? draftFrontMatter.categories.join(", ") : ""}
                  onChange={(e) => handleUpdateArrayField("categories", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs p-2 rounded focus:border-crimson outline-none"
                  placeholder="chronicles, web, review"
                />
              </div>

              {/* tags */}
              <div>
                <label className="block text-[10px] font-elite text-zinc-500 uppercase tracking-widest mb-1 leading-none flex justify-between">
                  <span>Tags Array</span>
                  <span className="font-mono text-[9px] text-zinc-500">Comma split</span>
                </label>
                <input
                  type="text"
                  value={draftFrontMatter.tags ? draftFrontMatter.tags.join(", ") : ""}
                  onChange={(e) => handleUpdateArrayField("tags", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs p-2 rounded focus:border-crimson outline-none"
                  placeholder="ink, typewriter, vintage"
                />
              </div>

              {/* description / excerpt */}
              <div>
                <label className="block text-[10px] font-elite text-zinc-500 uppercase tracking-widest mb-1 leading-none">
                  Seo Meta Description
                </label>
                <textarea
                  value={draftFrontMatter.description || ""}
                  onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs p-2 rounded focus:border-crimson outline-none leading-relaxed"
                  placeholder="Short, elegant SEO meta summary under 160 chars..."
                />
              </div>

              {/* featured image path */}
              <div>
                <label className="block text-[10px] font-elite text-zinc-500 uppercase tracking-widest mb-1 leading-none">
                  Featured Image URL / Rel-path
                </label>
                <input
                  type="text"
                  value={draftFrontMatter.image || ""}
                  onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs p-2 rounded focus:border-crimson outline-none"
                  placeholder="assets/images/typewriter.jpg"
                />
              </div>

              {/* Dynamic Added Metadata keys */}
              <div className="pt-2 border-t border-zinc-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-elite text-crimson uppercase">Custom Keys</span>
                  <button
                    onClick={() => setShowCustomKeyModal(true)}
                    className="text-[9px] font-elite border border-dashed border-crimson/40 text-crimson px-2 py-0.5 rounded hover:bg-crimson/5"
                  >
                    + Add Field
                  </button>
                </div>

                <div className="space-y-2">
                  {Object.entries(draftFrontMatter)
                    .filter(([k]) => !["layout", "title", "date", "author", "categories", "tags", "description", "image", "slug"].includes(k))
                    .map(([key, val]) => (
                      <div key={key} className="p-2 bg-zinc-900/40 border border-zinc-900 rounded-md flex items-center justify-between">
                        <div className="font-mono text-[10px] text-zinc-400">
                          <span className="font-bold text-zinc-300">{key}:</span> {String(val)}
                        </div>
                        <button
                          onClick={() => handleRemoveCustomKey(key)}
                          className="text-zinc-600 hover:text-crimson font-mono text-[9px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Site theme configurations */}
          <div className="mt-auto border-t border-zinc-900 pt-4 space-y-4">
            <span className="font-elite text-[10px] uppercase tracking-widest text-zinc-500 block leading-none">
              ■ Active Jekyll Theme Settings
            </span>
            
            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-zinc-500">Theme Gem:</span>
                <span className="font-mono text-crimson">minima</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Build Target:</span>
                <span className="font-mono text-zinc-400">GitHub Pages</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-0.5">Title Font</label>
                <select
                  value={themeConfig.headingFont}
                  onChange={(e) => setThemeConfig(prev => ({ ...prev, headingFont: e.target.value }))}
                  className="w-full bg-zinc-900 text-[10px] font-mono p-1 border border-zinc-800 text-zinc-300 rounded outline-none"
                >
                  <option value="Special Elite">Special Elite</option>
                  <option value="Courier Prime">Courier Prime</option>
                  <option value="Cinzel">Cinzel</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-0.5">Body Font</label>
                <select
                  value={themeConfig.bodyFont}
                  onChange={(e) => setThemeConfig(prev => ({ ...prev, bodyFont: e.target.value }))}
                  className="w-full bg-zinc-900 text-[10px] font-mono p-1 border border-zinc-800 text-zinc-300 rounded outline-none"
                >
                  <option value="Crimson Pro">Crimson Pro</option>
                  <option value="Lora">Lora</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* 3. FOOTER LIVE STATUS BOARD */}
      <footer className={`border-t flex flex-wrap gap-4 items-center justify-between px-4 py-2 shrink-0 text-[11px] font-sans ${
        themeMode === "warm" ? "border-amber-900/10 bg-[#f7f2ea] text-amber-950" : "border-zinc-900 bg-zinc-950 text-zinc-400"
      }`}>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-mono">{statusText}</span>
          </div>
          <span>|</span>
          <div>
            <span>Target Root: <strong className="font-mono text-zinc-300">/{selectedRepo.rootPath}</strong></span>
          </div>
          <span>|</span>
          <div>
            <span>Active Branch: <strong className="font-mono text-zinc-300">{selectedRepo.selectedBranch}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800/80 px-2.5 py-0.5 rounded-full text-[10px] text-zinc-400">
            <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Simulated Git Proxy Active</span>
          </div>
          
          <div className="text-zinc-500">
            Render Node Time: <span className="text-zinc-300">2026-05-20 UTC</span>
          </div>
        </div>

      </footer>

      {/* ==================================== MODAL WINDOWS ==================================== */}

      {/* Modal 1: GitHub API Access Setup */}
      {showGithubSetup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="font-elite text-sm text-crimson">GitHub API Access Setup</span>
              <button onClick={() => setShowGithubSetup(false)} className="text-zinc-500 hover:text-zinc-300 text-xs">✕</button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To edit, optimize, and publish live Jekyll records directly into your personal repository, configure Least-Privilege access tokens below.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-elite text-zinc-500 uppercase tracking-widest mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="github_pat_11AAAAAA..."
                  className="w-full bg-zinc-955 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs p-2.5 rounded font-mono outline-none focus:border-crimson"
                />
              </div>

              <div>
                <label className="block text-[10px] font-elite text-zinc-500 uppercase tracking-widest mb-1">
                  Mock Custom Repository Name
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    defaultValue="personal-blog-scribe"
                    id="new-repo-name"
                    placeholder="repository-name"
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs p-2 rounded outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("new-repo-name") as HTMLInputElement;
                      const repoName = input?.value || "my-brand-new-site";
                      const newR: Repository = {
                        owner: "github-user",
                        name: repoName,
                        rootPath: "/",
                        defaultBranch: "main",
                        selectedBranch: "main",
                        isJekyll: true,
                        permissions: { admin: true, push: true, pull: true },
                      };
                      setRepositories(prev => [...prev, newR]);
                      setSelectedRepo(newR);
                      if (!githubToken) setGithubToken("simulated-dev-token");
                      setShowGithubSetup(false);
                      setStatusText(`Successfully mounted user repository: ${repoName}`);
                    }}
                    className="bg-crimson hover:bg-crimson-hover text-white text-xs font-elite py-2 rounded cursor-pointer"
                  >
                    Mount Workspace
                  </button>
                </div>
              </div>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500 leading-normal">
              * Tokens remain entirely stored in your browser session context. Jekyll Forge never passes tokens to any third-party databases.
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Unsupported Jekyll Plugin Alert */}
      {unsupportedPluginAlert && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-crimson p-6 rounded-lg max-w-lg w-full space-y-4">
            <div className="flex items-center gap-2 text-crimson">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              <h3 className="font-elite text-sm uppercase tracking-widest font-bold">Unsupported Jekyll Plugin Action</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              The plugin you requested is **not whitelisted by the default GitHub Pages static builder**. Deploying your changes right now will cause your GitHub Pages publishing stack to fail compile-phase with a missing file error.
            </p>
            <div className="p-4 bg-zinc-950 border border-zinc-805 rounded-lg font-mono text-[11px] text-amber-500 leading-relaxed space-y-2">
              <span className="font-elite uppercase text-zinc-400 text-xs block leading-none">
                ■ Corrective Remedies
              </span>
              <p>1. Disable the custom plugin and use alternative layouts.</p>
              <p>2. Configure a Github Actions build file pipeline (.github/workflows/jekyll.yml) to pre-compile the website before deployment.</p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setUnsupportedPluginAlert(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-400 font-elite text-xs rounded hover:bg-zinc-700 hover:text-white"
              >
                Cancel Plugin Enable
              </button>
              <button
                onClick={() => {
                  setUnsupportedPluginAlert(false);
                  setShowWorkflowGenerator(true);
                }}
                className="px-4 py-2 bg-crimson hover:bg-crimson-hover text-white font-elite text-xs rounded"
              >
                Generate Actions Workflow File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: GitHub Actions Workflow Generator */}
      {showWorkflowGenerator && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg max-w-2xl w-full space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-crimson" />
                <span className="font-elite text-sm text-zinc-200">GitHub Actions CI Pipeline Generator</span>
              </div>
              <button onClick={() => setShowWorkflowGenerator(false)} className="text-zinc-500 hover:text-zinc-300 text-xs">✕</button>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              We have generated a production-ready CI pipeline. Save this code block as <code className="bg-zinc-950 text-red-300 px-1 py-0.5 rounded">.github/workflows/jekyll.yml</code> to deploy any Jekyll plugin configuration to GitHub Pages smoothly.
            </p>
            
            <pre className="bg-zinc-950 border border-zinc-850 p-4 font-mono text-[11px] text-emerald-400 rounded-lg overflow-x-auto max-h-72 leading-relaxed">
              {actionWorkflowTemplate}
            </pre>

            <div className="flex items-center justify-between gap-4 pt-2">
              <span className="text-[10px] font-mono text-zinc-500 leading-normal">
                ✓ Compatible with Ruby setup, bundler-cache configurations, and deploy-pages pipelines.
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(actionWorkflowTemplate);
                    alert("Actions workflow code compiled and copied to clipboard successfully!");
                  }}
                  className="px-4 py-1.5 bg-zinc-800 text-zinc-200 font-elite text-xs rounded hover:text-white"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    setShowWorkflowGenerator(false);
                    setStatusText("Workflow yml file saved into pipeline index successfully.");
                  }}
                  className="px-4 py-1.5 bg-crimson hover:bg-crimson-hover text-white font-elite text-xs rounded"
                >
                  Create & Push File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Customize Front Matter New Custom Keys */}
      {showCustomKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-elite text-xs text-crimson">Add Custom Metadata Field</span>
              <button onClick={() => setShowCustomKeyModal(false)} className="text-zinc-500 hover:text-zinc-350 text-xs">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-elite text-zinc-500 uppercase tracking-widest mb-1">
                  Metadata Parameter Name
                </label>
                <input
                  type="text"
                  value={newCustomKey}
                  onChange={(e) => setNewCustomKey(e.target.value)}
                  placeholder="e.g. series_order or featured_image_alt"
                  className="w-full bg-zinc-950 border border-zinc-805 text-zinc-200 text-xs p-2 rounded outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-elite text-zinc-500 uppercase tracking-widest mb-1">
                  Parameter Value
                </label>
                <input
                  type="text"
                  value={newCustomVal}
                  onChange={(e) => setNewCustomVal(e.target.value)}
                  placeholder="e.g. true or 12 or creative-vessel"
                  className="w-full bg-zinc-955 bg-zinc-950 border border-zinc-805 text-zinc-200 text-xs p-2 rounded outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowCustomKeyModal(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 font-elite hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomKey}
                disabled={!newCustomKey.trim() || !newCustomVal.trim()}
                className="px-4 py-1.5 bg-crimson hover:bg-crimson-hover disabled:bg-zinc-800 text-white font-elite text-xs rounded"
              >
                Add Custom Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMAND PALETTE POPUP PANEL (Ctrl+K) */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-start justify-center p-4 pt-20 z-50">
          <div className="bg-zinc-900 border border-zinc-800 max-w-lg w-full rounded-lg overflow-hidden shadow-2xl space-y-2">
            <div className="p-3 bg-zinc-950 border-b border-zinc-850 flex items-center gap-2">
              <Search className="w-4 h-4 text-crimson" />
              <input
                type="text"
                placeholder="Search command guidelines: e.g. publish, theme, audit..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-200 border-0 outline-none placeholder:text-zinc-650"
              />
              <button onClick={() => setShowCommandPalette(false)} className="text-zinc-500 text-xs font-mono">ESC</button>
            </div>

            <div className="p-2 space-y-1">
              {[
                { label: "Create a visual post", desc: "Instantiate a new post model with seed content.", action: () => handleCreateNewPost(false) },
                { label: "Publish workspace to pages", desc: "Commit current chapter draft structures into live repository branching.", action: () => handlePublishFile() },
                { label: "Optimize asset", desc: "Convert current layout attachment references to highly compressed WEBP format.", action: () => setActiveFileTab("assets") },
                { label: "Generate actions build workflow", desc: "Compile CI build configurations for multi-plugin compatibility.", action: () => setShowWorkflowGenerator(true) },
                { label: "Toggle classic cream theme mode", desc: "Switch editor typography to vintage editorial mode context.", action: () => setThemeMode("warm") },
                { label: "Toggle dark ink mode", desc: "Switch to eye-safe deep slate dark mode theme setup.", action: () => setThemeMode("dark") },
                { label: "Toggle configuration editor", desc: "Show _config.yml settings panel in left column directory.", action: () => setActiveFileTab("config") },
              ]
                .filter(cmd => cmd.label.toLowerCase().includes(commandQuery.toLowerCase()))
                .map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      cmd.action();
                      setShowCommandPalette(false);
                      setCommandQuery("");
                    }}
                    className="w-full text-left p-2.5 rounded hover:bg-crimson/5 border border-transparent hover:border-crimson/30 flex justify-between items-center transition-all cursor-pointer"
                  >
                    <div>
                      <p className="font-elite text-xs text-zinc-200">{cmd.label}</p>
                      <p className="text-[10px] text-zinc-550 italic mt-0.5">{cmd.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-crimson" />
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
