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
  EyeOff,
  Sun,
  Moon,
  GitBranch,
  GitCommit,
  ExternalLink,
  Smartphone,
  Printer,
  Calendar,
  ChevronDown,
  ChevronUp,
  ListTodo
} from "lucide-react";

import { Repository, JekyllPost, Asset, Snapshot, SEOReportItem } from "./types";
import { parseJekyllPost, formatJekyllPost } from "./utils/yaml";
import { renderMarkdown, countWords, estimateReadingTime, extractHeaderOutline } from "./utils/markdown";
import AIAssistant from "./components/AIAssistant";
import AISettings from "./components/AISettings";
import MergeHub from "./components/MergeHub";
import {
  playTypewriterKeySound,
  playTypewriterSpacebar,
  playTypewriterBell,
  playTypewriterBackspace,
  procAmbientEngine
} from "./utils/audioSynth";

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
  
  // Git Branches & History Monitor Modal states
  const [showGitModal, setShowGitModal] = useState<boolean>(false);
  const [gitBranches, setGitBranches] = useState<{ name: string; protected?: boolean }[]>([]);
  const [gitCommits, setGitCommits] = useState<{
    sha: string;
    commit: {
      author: { name: string; date: string };
      message: string;
    };
    html_url?: string;
  }[]>([]);
  const [gitError, setGitError] = useState<string | null>(null);
  const [isGitLoading, setIsGitLoading] = useState<boolean>(false);
  const [isSimulatedData, setIsSimulatedData] = useState<boolean>(false);

  const [statusText, setStatusText] = useState<string>("Workspace connected locally");

  // Active documents & loading state
  const [posts, setPosts] = useState<JekyllPost[]>(SEED_POSTS);
  const [activePost, setActivePost] = useState<JekyllPost>(SEED_POSTS[0]);
  const [activeFileTab, setActiveFileTab] = useState<string>("posts"); // "posts" | "drafts" | "assets" | "config" | "mobile"
  
  // --- Mobile & PWA Native Android Sandbox States ---
  const [vibrationStatus, setVibrationStatus] = useState<string>("Idle: Waiting for touch trigger...");
  const [batteryState, setBatteryState] = useState<{ level: number; charging: boolean }>({ level: 92, charging: true });
  const [simulatedDeviceCoords, setSimulatedDeviceCoords] = useState<{ lat: number; lng: number }>({ lat: 37.7749, lng: -122.4194 }); // SF default
  const [simulatedLogcat, setSimulatedLogcat] = useState<string[]>([
    "I/[Capacitor/Console]: Initializing Jekyll Forge Android Shell...",
    "D/[Capacitor/Device]: Checking SDK version: API 34 (Android 14)",
    "I/[PWA/ServiceWorker]: sw.js registered successfully.",
    "I/[Web/PWA]: Manifest active. Standalone view-mode available."
  ]);
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<any>(null);
  const [showPwaInstallModal, setShowPwaInstallModal] = useState<boolean>(false);
  const [isCapacitorBridgeEnabled, setIsCapacitorBridgeEnabled] = useState<boolean>(true);

  // Logcat entry pusher
  const addLogcatLine = (line: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setSimulatedLogcat(prev => [`[${timestamp}] ${line}`, ...prev.slice(0, 18)]);
  };

  // Battery monitoring hook
  useEffect(() => {
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      (navigator as any).getBattery().then((batteryObj: any) => {
        setBatteryState({
          level: Math.round(batteryObj.level * 100),
          charging: batteryObj.charging,
        });
        
        const updateBattery = () => {
          const currentLevel = Math.round(batteryObj.level * 100);
          setBatteryState({
            level: currentLevel,
            charging: batteryObj.charging,
          });
          addLogcatLine(`D/[Capacitor/Battery]: State changed: ${currentLevel}% (${batteryObj.charging ? "Charging" : "Discharging"})`);
        };

        batteryObj.addEventListener("levelchange", updateBattery);
        batteryObj.addEventListener("chargingchange", updateBattery);
      }).catch((e: any) => {
        console.warn("Battery status API not accessible in this context:", e);
      });
    }
  }, []);

  // Native installation listeners
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
      addLogcatLine("I/[PWA/Install]: 'beforeinstallprompt' fired. App is eligible for installation.");
    };

    const handleAppInstalled = () => {
      addLogcatLine("I/[PWA/Install]: 'appinstalled' confirmation received. Jekyll Forge PWA installed successfully!");
      alert("Hooray! Jekyll Forge has been successfully installed on your device!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // --- Interactive Mobile & PWA Device Trigger Handlers ---
  const triggerSimulatedVibration = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(120);
        setVibrationStatus("Vibrated! Real device haptics triggered.");
        addLogcatLine("I/[Capacitor/Haptics]: Vibe Engine triggered vibrate(120ms)");
      } catch (err: any) {
        setVibrationStatus("Simulated vibration pulse (Haptics mock)!");
        addLogcatLine("I/[Capacitor/Haptics]: Web haptics restricted in sandbox");
      }
    } else {
      setVibrationStatus("Simulated vibration pulse (Haptics mock)!");
      addLogcatLine("I/[Capacitor/Haptics]: Simulated vibrate() pulse on non-mobile platform");
    }
    setTimeout(() => setVibrationStatus("Idle: Waiting for touch trigger..."), 1800);
  };

  const triggerSimulatedLocation = () => {
    addLogcatLine("D/[Capacitor/Geolocation]: Requesting hardware location coordinates...");
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSimulatedDeviceCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          addLogcatLine(`I/[Capacitor/Geolocation]: Coords: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Accuracy: ${pos.coords.accuracy.toFixed(1)}m)`);
        },
        (err) => {
          const randomLat = 37.7749 + (Math.random() - 0.5) * 0.1;
          const randomLng = -122.4194 + (Math.random() - 0.5) * 0.1;
          setSimulatedDeviceCoords({ lat: randomLat, lng: randomLng });
          addLogcatLine(`W/[Capacitor/Geolocation]: Hardware call warning (${err.message}). Loaded simulated sandbox coordinates.`);
        }
      );
    } else {
      const randomLat = 37.7749 + (Math.random() - 0.5) * 0.1;
      const randomLng = -122.4194 + (Math.random() - 0.5) * 0.1;
      setSimulatedDeviceCoords({ lat: randomLat, lng: randomLng });
      addLogcatLine("W/[Capacitor/Geolocation]: Geolocation API unsupported. Loaded fake fallback coordinates.");
    }
  };

  const triggerSimulatedNotification = () => {
    addLogcatLine("D/[Capacitor/LocalNotifications]: Resolving device notification permission...");
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          try {
            new Notification("Jekyll Forge Android CMS", {
              body: "Standalone web container is active and synchronizing live draft repositories safely.",
              icon: "/pwa-icon.png"
            });
            addLogcatLine("I/[Capacitor/LocalNotifications]: Push notification compiled and delivered.");
          } catch (err: any) {
            addLogcatLine("W/[Capacitor/LocalNotifications]: Web Notification constructor blocked. Direct mock banner instead.");
            setStatusText("Android App Notification: Offline Sync Successful!");
          }
        } else {
          addLogcatLine(`W/[Capacitor/LocalNotifications]: Permission denied (${permission}). Simulating inline banner.`);
          setStatusText("Android App Notification: Permission Required for Sync Alerts.");
        }
      }).catch((err) => {
        addLogcatLine("W/[Capacitor/LocalNotifications]: Notification Request blocked by sandboxed iframe bounds.");
        setStatusText("Android App Notification: Active Sync Ok!");
      });
    } else {
      addLogcatLine("W/[Capacitor/LocalNotifications]: API unsupported in current client agent.");
      setStatusText("Android App Notification: Active Sync Ok!");
    }
  };

  const handleTriggerPwaInstall = () => {
    if (pwaInstallPrompt) {
      addLogcatLine("I/[PWA/Install]: User triggered installation banner...");
      pwaInstallPrompt.prompt();
      pwaInstallPrompt.userChoice.then((choiceResult: any) => {
        addLogcatLine(`I/[PWA/Install]: User select choice outcome: ${choiceResult.outcome}`);
        if (choiceResult.outcome === "accepted") {
          setPwaInstallPrompt(null);
        }
      });
    } else {
      setShowPwaInstallModal(true);
      addLogcatLine("I/[PWA/Install]: Displaying interactive step-by-step mobile install guides.");
    }
  };

  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);
  const [showBottomPanel, setShowBottomPanel] = useState<boolean>(true);

  // Editor states
  const [editorMode, setEditorMode] = useState<"visual" | "raw" | "split" | "merge">("split");
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [zenTheme, setZenTheme] = useState<"amber" | "green" | "parchment" | "obsidian">("amber");
  const [keystrokeVolume, setKeystrokeVolume] = useState<number>(0.4);
  const [rainVolume, setRainVolume] = useState<number>(0);
  const [fireplaceVolume, setFireplaceVolume] = useState<number>(0);
  const [mobileHapticsEnabled, setMobileHapticsEnabled] = useState<boolean>(true);
  const [draftTitle, setDraftTitle] = useState<string>(SEED_POSTS[0].frontMatter.title || "");
  const [draftMarkdown, setDraftMarkdown] = useState<string>(SEED_POSTS[0].markdown);
  const [draftFrontMatter, setDraftFrontMatter] = useState<Record<string, any>>(SEED_POSTS[0].frontMatter);
  const [rawYAMLText, setRawYAMLText] = useState<string>("");
  const [showRawYAMLEditor, setShowRawYAMLEditor] = useState<boolean>(false);
  const [showSyntaxGuide, setShowSyntaxGuide] = useState<boolean>(false);

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

  // Synchronize ambient noise synth loops
  useEffect(() => {
    if (rainVolume > 0) {
      procAmbientEngine.startRain(rainVolume * 0.15); // Scale down slightly to sound ambient
    } else {
      procAmbientEngine.stopRain();
    }
  }, [rainVolume]);

  useEffect(() => {
    if (fireplaceVolume > 0) {
      procAmbientEngine.startFireplace(fireplaceVolume * 0.15);
    } else {
      procAmbientEngine.stopFireplace();
    }
  }, [fireplaceVolume]);

  useEffect(() => {
    return () => {
      procAmbientEngine.cleanupAll();
    };
  }, []);

  const handleTypewriterKeyPress = (e: React.KeyboardEvent<any>) => {
    if (keystrokeVolume > 0) {
      if (e.key === "Enter") {
        playTypewriterBell(keystrokeVolume + 0.1);
      } else if (e.key === " ") {
        playTypewriterSpacebar(keystrokeVolume);
      } else if (e.key === "Backspace") {
        playTypewriterBackspace(keystrokeVolume);
      } else if (e.key.length === 1) {
        playTypewriterKeySound(keystrokeVolume);
      }
    }

    if (mobileHapticsEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch (err) {}
    }
  };

  // Prettify Markdown & Liquid tags
  const handlePrettifyMarkdown = () => {
    if (!draftMarkdown) return;
    setStatusText("Analyzing document structure & aligning Liquid layout tags...");

    let text = draftMarkdown;

    // 1. Normalize line endings
    text = text.replace(/\r\n/g, "\n");

    // 2. Clean up multiple empty lines (3 or more consecutive newlines -> exactly 2 newlines)
    text = text.replace(/\n{3,}/g, "\n\n");

    // 3. Spacing around headers
    // Make sure header markers (#) have exactly 1 space after them, e.g. "##Section" -> "## Section"
    text = text.replace(/^(#{1,6})([^\s#])(.*)$/gm, "$1 $2$3");
    // Standardize excessive spaces inside headers, e.g. "##    My Title" -> "## My Title"
    text = text.replace(/^(#{1,6})\s{2,}(.*)$/gm, "$1 $2");

    // 4. Liquid layout tag alignment
    // Normalize spaces inside liquid syntax template variables: {{ variable }}
    text = text.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, p1) => `{{ ${p1.trim()} }}`);
    // Normalize spaces inside liquid code blocks: {% include footer.html %}
    text = text.replace(/\{\%\s*(.*?)\s*\%*\}/g, (_, p1) => `{% ${p1.trim()} %}`);

    // 5. Blockquote alignment
    // Ensure standard spacing for blockquotes and warning panels, e.g. ">[!NOTE]" -> "> [!NOTE]"
    text = text.replace(/^>\s*(\[[^\]]+\])/gm, "> $1");
    text = text.replace(/^>([^\s\!\[\n\>].*)$/gm, "> $1");

    // 6. Split and process line by line to clean up trailing whitespaces safely
    const lines = text.split("\n");
    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Trim trailing spaces but preserve double spaces at the end of line if it indicates markdown hard break
      if (line.endsWith("  ") && line.trim() !== "") {
        line = line.trimEnd() + "  ";
      } else {
        line = line.trimEnd();
      }

      // Add a blank line before markdown headings for clean formatting (if not already empty and not first line)
      const isHeading = /^#{1,6}\s+/.test(line);
      if (isHeading && i > 0 && processedLines.length > 0) {
        const prevLine = processedLines[processedLines.length - 1];
        if (prevLine.trim() !== "") {
          processedLines.push("");
        }
      }

      processedLines.push(line);
    }

    text = processedLines.join("\n");

    // 7. Ensure document trims nicely at boundaries
    text = text.trim() + "\n";

    setDraftMarkdown(text);
    setStatusText(`Successfully pretty-formatted Markdown & Liquid alignment!`);
  };

  // Generate Table of Contents (H2 & H3) and inject into document safely
  const handleGenerateTOC = () => {
    if (!draftMarkdown) {
      setStatusText("There is no markdown content to scan for a Table of Contents.");
      return;
    }
    const lines = draftMarkdown.split("\n");
    const tocItems: string[] = [];
    
    // Detect headers (H2, H3)
    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length; // 2 or 3
        const title = match[2].trim();
        // Skip calling "Table of Contents" to prevent duplicate listing
        if (title.toLowerCase() === "table of contents") return;
        
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/^-+|-+$/g, "");
          
        const indent = level === 3 ? "  " : "";
        tocItems.push(`${indent}* [${title}](#${slug})`);
      }
    });
    
    if (tocItems.length === 0) {
      setStatusText("No H2 or H3 headers were detected in this post to structure a Table of Contents.");
      return;
    }
    
    const tocBlock = [
      "## Table of Contents",
      "",
      ...tocItems,
      "",
      "---"
    ].join("\n");
    
    // Identify insertion point right after Jekyll front-matter yaml block (delimited by second ---)
    let insertIndex = 0;
    if (draftMarkdown.startsWith("---")) {
      const secondDelimiter = draftMarkdown.indexOf("---", 3);
      if (secondDelimiter !== -1) {
        insertIndex = secondDelimiter + 3;
      }
    }
    
    const before = draftMarkdown.slice(0, insertIndex);
    const after = draftMarkdown.slice(insertIndex);
    
    // Stitch everything back together cleanly
    const updated = [
      before.trim(),
      "",
      tocBlock,
      "",
      after.trim()
    ].join("\n").trim() + "\n";
    
    setDraftMarkdown(updated);
    setStatusText("Injected Table of Contents anchors successfully!");
  };

  // Fetch branch list and commit history from real GitHub API (or back up gracefully with warning)
  const fetchGitData = async () => {
    setIsGitLoading(true);
    setGitError(null);
    setIsSimulatedData(false);

    try {
      const headers: Record<string, string> = {
        "Accept": "application/vnd.github+json"
      };
      if (githubToken && githubToken !== "simulated-dev-token") {
        headers["Authorization"] = `Bearer ${githubToken}`;
      }

      const branchesUrl = `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/branches`;
      const commitsUrl = `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/commits?sha=${encodeURIComponent(selectedRepo.selectedBranch)}&per_page=12`;

      const [branchesRes, commitsRes] = await Promise.all([
        fetch(branchesUrl, { headers }),
        fetch(commitsUrl, { headers })
      ]);

      if (!branchesRes.ok || !commitsRes.ok) {
        throw new Error(`GitHub responded with branches HTTP ${branchesRes.status} / commits HTTP ${commitsRes.status}`);
      }

      const branchesData = await branchesRes.json();
      const commitsData = await commitsRes.json();

      setGitBranches(branchesData);
      setGitCommits(commitsData);
      setStatusText(`Fetched live repository branches and commits.`);
    } catch (err: any) {
      console.warn("GitHub API rate limit or fallback trigger:", err.message);
      setGitError(err.message);
      setIsSimulatedData(true);

      // Create rich mock branches for workspace awareness
      const mockBranches = [
        { name: "main", protected: true },
        { name: "gh-pages", protected: false },
        { name: "drafts/aesthetic-overhaul", protected: false },
        { name: "patch/liquid-layout-fix", protected: false }
      ];
      
      // Ensure the selected repository's current branch is always in the list
      if (!mockBranches.some(b => b.name === selectedRepo.selectedBranch)) {
        mockBranches.unshift({ name: selectedRepo.selectedBranch, protected: selectedRepo.selectedBranch === "master" || selectedRepo.selectedBranch === "main" });
      }

      setGitBranches(mockBranches);

      // Create realistic historic commit logs
      setGitCommits([
        {
          sha: "ae13d5baee28c83e89fb2bb5ff8ce0bd67a78e121",
          commit: {
            author: { name: "Oliver Sterling", date: new Date(Date.now() - 3600000 * 2.5).toISOString() },
            message: "Refactored vintage liquid margins, aligned buttons, and added front matter core"
          }
        },
        {
          sha: "8db3e9ecca018747f3ae0f9df504ce8e1a7888de7",
          commit: {
            author: { name: "Gemini Writer Assistant", date: new Date(Date.now() - 3600000 * 22).toISOString() },
            message: "Automated SEO meta description injections and Jekyll layout validation rules"
          }
        },
        {
          sha: "4fbcde037748ca09e74bb7c71629d8a3910ee241b",
          commit: {
            author: { name: "Oliver Sterling", date: new Date(Date.now() - 3600000 * 45).toISOString() },
            message: "Initial repository snapshot imported with classic minima styles"
          }
        }
      ]);
      setStatusText("Fetched repository workspace layout (simulated offline mode).");
    } finally {
      setIsGitLoading(false);
    }
  };

  // Switch repo branches
  const handleSwitchRepositoryBranch = (branchName: string) => {
    const updated = { ...selectedRepo, selectedBranch: branchName };
    setSelectedRepo(updated);
    setRepositories(prev => prev.map(r => r.name === selectedRepo.name ? updated : r));
    setStatusText(`Active branch target set to: ${branchName}`);
  };

  // Re-fetch git details when opening the modal or selecting branch
  useEffect(() => {
    if (showGitModal) {
      fetchGitData();
    }
  }, [showGitModal, selectedRepo.name, selectedRepo.selectedBranch, githubToken]);

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

  // Save the current post/file state as a Draft inside the '_drafts/' directory using the GitHub API
  const handleSaveToDrafts = async () => {
    setStatusText("Preparing draft payload for repository commit...");

    // Validate draft title
    if (!draftTitle.trim()) {
      alert("Validation failed: Draft files must have a valid non-empty 'title' field to save.");
      setStatusText("Draft save canceled.");
      return;
    }

    // Build filename and path for the drafts repository
    const slug = draftFrontMatter.slug || activePost.slug || draftTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "untitled-draft";
    const filename = slug.endsWith(".md") ? slug : `${slug}.md`;
    const draftsPath = `_drafts/${filename}`;

    // Prepend rootPath if configured and not "/"
    const finalGitPath = selectedRepo.rootPath && selectedRepo.rootPath !== "/" 
      ? `${selectedRepo.rootPath}/${draftsPath}` 
      : draftsPath;

    // Format the markdown content with Front Matter
    const fullyFormattedText = formatJekyllPost(draftFrontMatter, draftMarkdown);

    // Check for real GitHub authorization token
    const isRealToken = githubToken && githubToken !== "simulated-dev-token";

    if (!isRealToken) {
      // Offline simulation fallback flow
      setStatusText("Saving draft to local workspace state (offline fallback active)...");
      setTimeout(() => {
        const resolvedPost: JekyllPost = {
          ...activePost,
          path: draftsPath,
          filename: filename,
          slug: slug,
          markdown: draftMarkdown,
          frontMatter: { ...draftFrontMatter, title: draftTitle, slug: slug },
          status: "draft",
        };

        setPosts(prev => {
          const exists = prev.some(p => p.path === draftsPath);
          if (exists) {
            return prev.map(p => p.path === draftsPath ? resolvedPost : p);
          } else {
            return [resolvedPost, ...prev];
          }
        });
        setActivePost(resolvedPost);
        
        // Add snapshot for security and history timeline
        const newSnap: Snapshot = {
          id: `snap-draft-${Date.now()}`,
          label: `Saved Draft: ${draftTitle}`,
          createdAt: new Date().toISOString(),
          postPath: draftsPath,
          markdown: draftMarkdown,
          frontMatter: draftFrontMatter,
          reason: "manual",
        };
        setSnapshots(prev => [newSnap, ...prev]);

        setStatusText(`Offline draft saved to local workspace: ${draftsPath}`);
        alert(`Saved Draft Successfully (Offline WorkspaceFallback Mode)!\n\nDestination: ${draftsPath}\nLayout Title: ${draftTitle}\n\nPlease configure your GitHub Token credentials to persist draft branch changes directly.`);
      }, 1000);
      return;
    }

    // Live GitHub Commit flow!
    setStatusText("Fetching remote draft reference metadata from GitHub API...");
    try {
      const headers: Record<string, string> = {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${githubToken}`,
      };

      // 1. Get existing file metadata if any to recover base64 sha (prevents collision conflicts)
      const getFileUrl = `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/contents/${finalGitPath}?ref=${encodeURIComponent(selectedRepo.selectedBranch)}`;
      let existingSha: string | undefined = undefined;

      const getRes = await fetch(getFileUrl, { headers });
      if (getRes.ok) {
        const fileMetadata = await getRes.json();
        existingSha = fileMetadata.sha;
      } else if (getRes.status !== 404) {
        throw new Error(`Unexpected status code check from GitHub repository content endpoint: ${getRes.status}`);
      }

      // 2. Base64 encode the final file payload
      // UTF-8 base64 encoding strategy avoids breaking Unicode characters
      const base64Content = btoa(unescape(encodeURIComponent(fullyFormattedText)));

      setStatusText("Uploading and committing base64 file blob to draft directory...");
      const putFileUrl = `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/contents/${finalGitPath}`;
      
      const payload: Record<string, any> = {
        message: `Create/Update editorial draft file under _drafts: ${draftTitle}`,
        content: base64Content,
        branch: selectedRepo.selectedBranch,
      };
      if (existingSha) {
        payload.sha = existingSha;
      }

      const putRes = await fetch(putFileUrl, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!putRes.ok) {
        const errorData = await putRes.json().catch(() => ({}));
        throw new Error(errorData.message || `GitHub commit error Status ${putRes.status}`);
      }

      const updatedFileMetadata = await putRes.json();
      const commitSha = updatedFileMetadata.commit?.sha || "Unknown";

      // 3. Update the local UI model state
      const resolvedPost: JekyllPost = {
        ...activePost,
        path: draftsPath,
        filename: filename,
        slug: slug,
        markdown: draftMarkdown,
        frontMatter: { ...draftFrontMatter, title: draftTitle, slug: slug },
        status: "draft",
        sha: updatedFileMetadata.content?.sha,
      };

      setPosts(prev => {
        const exists = prev.some(p => p.path === draftsPath);
        if (exists) {
          return prev.map(p => p.path === draftsPath ? resolvedPost : p);
        } else {
          return [resolvedPost, ...prev];
        }
      });
      setActivePost(resolvedPost);

      // Save snapshots
      const newSnap: Snapshot = {
        id: `snap-draft-${Date.now()}`,
        label: `Saved Draft: ${draftTitle}`,
        createdAt: new Date().toISOString(),
        postPath: draftsPath,
        markdown: draftMarkdown,
        frontMatter: draftFrontMatter,
        reason: "manual",
      };
      setSnapshots(prev => [newSnap, ...prev]);

      setStatusText(`Draft saved successfully to GitHub! Commit SHA: ${commitSha.slice(0, 8)}`);
      alert(`Draft Persisted on GitHub!\n\nDestination Path: ${draftsPath}\nCommit Reference: ${commitSha.slice(0, 8)}\nRepository: ${selectedRepo.owner}/${selectedRepo.name}\nBranch: ${selectedRepo.selectedBranch}`);
    } catch (err: any) {
      console.error("Save to Drafts GitHub Error Exception:", err);
      setStatusText(`Save Draft failed: ${err.message}`);
      alert(`GitHub Draft Preservation Failed:\n\n${err.message}`);
    }
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
    <div className={`min-h-screen max-w-full overflow-x-hidden flex flex-col transition-colors duration-200 ${
      themeMode === "warm" ? "bg-[#fbf9f4] text-[#2c2421]" : "bg-zinc-950 text-zinc-100"
    }`}>
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className={`border-b flex items-center justify-between px-4 py-3 shrink-0 gap-2 overflow-hidden ${
        themeMode === "warm" ? "border-amber-900/10 bg-[#f7f2ea]" : "border-zinc-800 bg-zinc-950"
      }`}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="grungy-stamp border-crimson text-crimson text-[10px] sm:text-[11px] font-bold tracking-widest bg-crimson/5 shrink-0 mr-1 sm:mr-2">
              JEKYLL FORGE
            </span>
            <div className={`h-4 w-[1px] ${themeMode === "warm" ? "bg-amber-955/20" : "bg-zinc-800"} hidden xs:block`}></div>
            <span className="font-sans text-xs font-medium opacity-75 hidden xl:inline shrink-0">
              GitHub-Powered Vintage Press
            </span>
          </div>

          {/* Repository Dropdown Selector */}
          <div className="flex items-center gap-1 ml-1 sm:ml-2 min-w-0">
            <Folder className="w-3.5 h-3.5 text-crimson opacity-80 shrink-0 hidden xs:inline-block" />
            <select
              value={selectedRepo.name}
              onChange={(e) => {
                const target = repositories.find(r => r.name === e.target.value);
                if (target) {
                  setSelectedRepo(target);
                  setStatusText(`Mounted repository instance: ${target.name}`);
                }
              }}
              className={`text-xs font-sans font-medium px-1.5 py-1 rounded border outline-none cursor-pointer max-w-[100px] sm:max-w-[160px] md:max-w-xs truncate shrink ${
                themeMode === "warm" 
                  ? "bg-[#faf6ee] border-amber-955/15 text-amber-950" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-crimson"
              }`}
            >
              {repositories.map(r => (
                <option key={r.name} value={r.name}>{r.owner}/{r.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowGitModal(true)}
              title="Inspect Remote Branches & Recent Commit Logs"
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-crimson/10 hover:bg-crimson/20 border border-crimson/15 text-crimson tracking-wider shrink-0 hidden sm:flex items-center gap-1 cursor-pointer transition-colors font-semibold"
            >
              <GitBranch className="w-3 h-3 text-crimson" />
              <span>{selectedRepo.selectedBranch}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Aesthetic Compact Theme Switcher Button */}
          <button
            onClick={() => setThemeMode(themeMode === "warm" ? "dark" : "warm")}
            title={themeMode === "warm" ? "Switch to Monochrome Ink theme" : "Switch to Classic Cream theme"}
            className={`p-1.5 rounded border flex items-center gap-1 text-xs transition-colors cursor-pointer shrink-0 ${
              themeMode === "warm" 
                ? "bg-[#faf6ee] border-amber-950/20 text-neutral-600 hover:bg-[#eae3d5]" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            {themeMode === "warm" ? (
              <>
                <Moon className="w-3.5 h-3.5 text-crimson" />
                <span className="hidden md:inline font-elite text-[10px]">Ink</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline font-elite text-[10px]">Cream</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowCommandPalette(true)}
            title="Search Actions (Ctrl + K)"
            className={`p-1.5 rounded border flex items-center gap-1 text-xs transition-colors cursor-pointer shrink-0 ${
              themeMode === "warm" 
                ? "bg-[#faf6ee] border-amber-950/20 text-neutral-600 hover:bg-[#eae3d5]" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <Command className="w-3.5 h-3.5 text-crimson" />
            <kbd className="text-[9px] opacity-70 hidden md:inline-block">⌘K</kbd>
          </button>

          {/* GitHub Connection Modal launcher */}
          <button
            onClick={() => setShowGithubSetup(prev => !prev)}
            className={`font-elite text-xs py-1.5 px-2 rounded flex items-center gap-1 cursor-pointer border shrink-0 ${
              githubToken 
                ? "bg-emerald-950/20 border-emerald-800/50 text-emerald-400" 
                : "bg-crimson hover:bg-crimson-hover text-white border-transparent"
            }`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">{githubToken ? "Connected" : "Credentials"}</span>
          </button>

          {/* Download Local Backup (JSON) */}
          <button
            onClick={handleDownloadZIPPackage}
            className={`p-1.5 rounded border transition-all hover:text-crimson shrink-0 cursor-pointer ${
              themeMode === "warm" ? "border-amber-950/20 text-amber-950 bg-[#faf6ee]" : "border-zinc-800 text-zinc-300 bg-zinc-900"
            }`}
            title="Download full Jekyll export payload"
          >
            <FileDown className="w-4 h-4" />
          </button>

          {/* Save to Drafts Trigger */}
          <button
            onClick={handleSaveToDrafts}
            className={`font-elite text-xs py-1.5 px-2.5 sm:px-3 rounded-md flex items-center gap-1.5 cursor-pointer border transition-colors shrink-0 ${
              themeMode === "warm" 
                ? "bg-[#faf6ee] border-amber-955/20 text-neutral-700 hover:bg-[#eae3d5]" 
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 focus:border-crimson"
            }`}
            title="Save as draft under _drafts/ directory in your active branch"
          >
            <FileText className="w-4 h-4 text-crimson" />
            <span className="hidden md:inline">Save as Draft</span>
            <span className="inline md:hidden">Draft</span>
          </button>

          {/* Commit & Publish Trigger */}
          <button
            onClick={handlePublishFile}
            className="bg-transparent border-2 border-dashed border-crimson text-crimson hover:bg-crimson hover:text-white transition-colors py-1.5 px-2.5 sm:px-3 md:px-4 rounded-md font-elite text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-crimson" />
            <span className="hidden md:inline">Publish Pages</span>
            <span className="inline md:hidden">Publish</span>
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT LAYOUT SPACE */}
      <div className="flex-1 flex overflow-hidden">
           {/* LEFT WORKSPACE SIDEBAR PANEL */}
        {showLeftSidebar && (
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
                themeMode === "warm" ? "border-amber-955/15" : "border-zinc-900"
              }`}>
                {["posts", "assets", "config", "plugins", "mobile"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFileTab(tab)}
                    className={`flex-1 py-1 px-1 font-elite text-[10px] uppercase tracking-wider transition-all border-b-2 ${
                      activeFileTab === tab
                        ? "border-crimson text-crimson font-bold"
                        : `border-transparent hover:text-crimson ${
                            themeMode === "warm" ? "text-amber-955/70" : "text-zinc-500 hover:text-zinc-300"
                          }`
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
                    <div className={`text-[10px] uppercase tracking-wider px-2 pt-2 font-elite ${
                      themeMode === "warm" ? "text-neutral-600" : "text-zinc-500"
                    }`}>
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
                                ? (themeMode === "warm" 
                                    ? "bg-crimson/5 border-crimson text-crimson font-bold shadow-inner" 
                                    : "bg-crimson/5 border-crimson text-red-101")
                                : (themeMode === "warm" 
                                    ? "border-transparent text-neutral-800 hover:bg-amber-900/5 hover:text-amber-955 font-medium" 
                                    : "border-transparent text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-202")
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
                            
                            <div className={`flex items-center justify-between text-[9px] font-mono ${
                              themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                            }`}>
                              <span>{post.filename.slice(0, 10)}</span>
                              <span className={`px-1.5 py-0.2 rounded uppercase border ${
                                themeMode === "warm" 
                                  ? "bg-[#faf6ee] border-amber-955/20 text-neutral-700" 
                                  : "bg-[#111] border-zinc-c80 text-zinc-400"
                              }`}>
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
                    <div className={`border border-dashed p-4 rounded-lg text-center relative ${
                      themeMode === "warm" ? "border-amber-955/35 bg-[#faf6ee]" : "border-zinc-800 bg-zinc-950/50"
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSimulateAssetUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                      />
                      <Upload className="w-6 h-6 text-crimson mx-auto mb-1 animate-bounce" />
                      <span className={`text-[10px] font-elite block uppercase ${
                        themeMode === "warm" ? "text-neutral-800" : "text-zinc-400"
                      }`}>Optimize Asset</span>
                      <span className={`text-[8px] block mt-0.5 ${
                        themeMode === "warm" ? "text-neutral-500" : "text-zinc-600"
                      }`}>Drag-and-drop auto WEBP conversions</span>
                    </div>

                    <div className="space-y-2">
                      <span className={`text-[10px] font-elite uppercase block border-b pb-1 ${
                        themeMode === "warm" ? "border-amber-955/10 text-neutral-600" : "border-zinc-900 text-zinc-500"
                      }`}>
                        ■ Current Assets Catalog (/assets/images/)
                      </span>
                      {assets.map((asset) => (
                        <div key={asset.path} className={`p-2 border rounded flex items-center gap-2 ${
                          themeMode === "warm" ? "border-amber-955/15 bg-[#faf6ee]" : "border-zinc-900 bg-zinc-900/40"
                        }`}>
                          <img src={asset.url} alt={asset.alt} className="w-10 h-10 object-cover rounded bg-zinc-950" />
                          <div className={`flex-1 min-w-0 font-mono text-[9px] ${
                            themeMode === "warm" ? "text-neutral-700" : "text-zinc-400"
                          }`}>
                            <p className={`truncate font-bold ${
                              themeMode === "warm" ? "text-amber-950" : "text-zinc-300"
                            }`}>{asset.name}</p>
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
                      <div className={`flex items-center justify-between font-elite text-[10px] ${
                        themeMode === "warm" ? "text-neutral-600" : "text-zinc-500"
                      }`}>
                        <span>_CONFIG.YML EDITOR</span>
                        <span className="font-mono text-emerald-500 font-bold text-[8px]">ACTIVE</span>
                      </div>
                      <textarea
                        value={configYmlContent}
                        onChange={(e) => setConfigYmlContent(e.target.value)}
                        rows={8}
                        className={`w-full font-mono text-[11px] p-2 rounded focus:border-crimson outline-none leading-relaxed border ${
                          themeMode === "warm" 
                            ? "bg-[#faf6ee] border-amber-955/20 text-neutral-850" 
                            : "bg-zinc-950/80 border-zinc-800 text-zinc-300"
                        }`}
                      />
                      <button
                        onClick={() => alert("Simulated config commit successfully written to repository core!")}
                        className={`w-full py-1 font-elite text-[10px] rounded border transition-colors ${
                          themeMode === "warm" 
                            ? "bg-[#faf6ee] border-amber-955/20 hover:bg-[#eae3d5] text-neutral-850" 
                            : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200"
                        }`}
                      >
                        Save Configuration Settings
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className={`flex items-center justify-between font-elite text-[10px] ${
                        themeMode === "warm" ? "text-neutral-600" : "text-zinc-500"
                      }`}>
                        <span>GEMFILE (DEPS MANIFEST)</span>
                        <span className="font-mono text-zinc-500 text-[8px]">LOCK</span>
                      </div>
                      <textarea
                        value={gemfileContent}
                        onChange={(e) => setGemfileContent(e.target.value)}
                        rows={5}
                        className={`w-full font-mono text-[11px] p-2 rounded focus:border-crimson outline-none leading-relaxed border ${
                          themeMode === "warm" 
                            ? "bg-[#faf6ee] border-amber-955/20 text-neutral-850" 
                            : "bg-zinc-950/80 border-zinc-800 text-zinc-300"
                        }`}
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
                        <div key={p.name} className={`p-2.5 border rounded-lg space-y-1.5 ${
                          themeMode === "warm" ? "border-amber-955/15 bg-[#faf6ee]" : "border-zinc-900 bg-zinc-900/30"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-mono text-[11px] font-bold ${
                              themeMode === "warm" ? "text-amber-950" : "text-zinc-300"
                            }`}>{p.name}</span>
                            <span className={`text-[8px] font-elite px-1 rounded ${
                              p.pagesSupported ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-500"
                            }`}>
                              {p.pagesSupported ? "Pages Safe" : "Actions req."}
                            </span>
                          </div>
                          <p className={`text-[10px] leading-normal ${
                            themeMode === "warm" ? "text-neutral-700" : "text-zinc-500"
                          }`}>{p.description}</p>
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

                {/* Category: Mobile & PWA Native Android Panel */}
                {activeFileTab === "mobile" && (
                  <div className="p-2.5 space-y-3 font-sans">
                    {/* Header Banner */}
                    <div className="p-3 bg-crimson/5 border-l-2 border-crimson text-[11px] leading-relaxed rounded-r-md">
                      <div className="font-elite text-crimson font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                        Android & PWA Sandbox
                      </div>
                      <span className={themeMode === "warm" ? "text-neutral-700" : "text-zinc-400"}>
                        Direct toolkit to review mobile web installability and prototype native Android device bridges.
                      </span>
                    </div>

                    {/* Section 1: PWA Verification Status */}
                    <div className="space-y-1.5">
                      <div className={`text-[10px] uppercase tracking-wider font-elite ${
                        themeMode === "warm" ? "text-neutral-600 font-semibold" : "text-zinc-500"
                      }`}>
                        ■ PWA Manifest Indicators
                      </div>
                      
                      <div className={`p-2 border rounded-lg space-y-1 text-[11px] ${
                        themeMode === "warm" ? "border-amber-955/15 bg-[#faf6ee]" : "border-zinc-900 bg-zinc-900/25"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="opacity-75">Web Manifest</span>
                          <span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            site.webmanifest
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="opacity-75">Service Worker Cache</span>
                          <span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            sw.js Active
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="opacity-75">Custom App Icon</span>
                          <span className="font-mono text-[9px] text-zinc-400">pwa-icon.png</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="opacity-75">Display Orientation</span>
                          <span className="font-mono text-[9px] text-amber-500 uppercase">Standalone</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: PWA Installation trigger */}
                    <div className="space-y-1.5">
                      <div className={`text-[10px] uppercase tracking-wider font-elite ${
                        themeMode === "warm" ? "text-neutral-600 font-semibold" : "text-zinc-500"
                      }`}>
                        ■ PWA Home Launcher
                      </div>
                      <button
                        onClick={handleTriggerPwaInstall}
                        className="w-full bg-crimson hover:bg-red-700 text-white font-elite text-[10.5px] py-2 rounded-md transition-colors font-semibold flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wide cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Install Standalone App
                      </button>
                    </div>

                    {/* Section 3: Native Web-to-App Device Sandbox */}
                    <div className="space-y-1.5">
                      <div className={`text-[10px] uppercase tracking-wider font-elite ${
                        themeMode === "warm" ? "text-neutral-600 font-semibold" : "text-zinc-500"
                      }`}>
                        ■ Android Bridge Hardware Sandbox
                      </div>

                      <div className={`p-2.5 border rounded-lg space-y-2.5 ${
                        themeMode === "warm" ? "border-amber-955/15 bg-[#faf6ee]" : "border-zinc-900 bg-zinc-900/25"
                      }`}>
                        {/* Haptic Vibe Engine */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] leading-none">
                            <span className="font-mono text-zinc-400 uppercase text-[9px]">Capacitor.Haptics</span>
                            <span className="font-mono text-[9.5px] text-amber-500 truncate max-w-[120px]" title={vibrationStatus}>
                              {vibrationStatus.split(":")[0]}
                            </span>
                          </div>
                          <button
                            onClick={triggerSimulatedVibration}
                            className={`w-full py-1 text-[10px] font-elite border rounded hover:bg-crimson/10 hover:border-crimson cursor-pointer transition-all ${
                              themeMode === "warm" ? "border-amber-955/20 text-neutral-800 bg-[#fbf9f4]" : "border-zinc-800 text-zinc-300 bg-zinc-950/40"
                            }`}
                          >
                            Trigger Vibrate Pulse
                          </button>
                        </div>

                        {/* Local Notifications API */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] leading-none">
                            <span className="font-mono text-zinc-400 uppercase text-[9px]">Capacitor.LocalNotifications</span>
                            <span className="font-mono text-[9.5px] text-zinc-500">Device Push Banner</span>
                          </div>
                          <button
                            onClick={triggerSimulatedNotification}
                            className={`w-full py-1 text-[10px] font-elite border rounded hover:bg-crimson/10 hover:border-crimson cursor-pointer transition-all ${
                              themeMode === "warm" ? "border-amber-955/20 text-neutral-800 bg-[#fbf9f4]" : "border-zinc-800 text-zinc-300 bg-zinc-950/40"
                            }`}
                          >
                            Dispatch App Notification
                          </button>
                        </div>

                        {/* Geolocation API */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] leading-none">
                            <span className="font-mono text-zinc-400 uppercase text-[9px]">Capacitor.Geolocation</span>
                            <span className="font-mono text-[9.5px] text-emerald-400 font-semibold animate-pulse" title="Device Coordinates">
                              {simulatedDeviceCoords.lat.toFixed(4)}°, {simulatedDeviceCoords.lng.toFixed(4)}°
                            </span>
                          </div>
                          <button
                            onClick={triggerSimulatedLocation}
                            className={`w-full py-1 text-[10px] font-elite border rounded hover:bg-crimson/10 hover:border-crimson cursor-pointer transition-all ${
                              themeMode === "warm" ? "border-amber-955/20 text-neutral-800 bg-[#fbf9f4]" : "border-zinc-800 text-zinc-300 bg-zinc-950/40"
                            }`}
                          >
                            Poll GPS Coordinates
                          </button>
                        </div>

                        {/* Battery fuel gauge */}
                        <div className="pt-0.5">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-zinc-500 font-semibold">BATTERY TELEMETRY:</span>
                            <span className={`font-semibold font-mono ${batteryState.charging ? "text-emerald-400" : "text-amber-500"}`}>
                              {batteryState.level}% {batteryState.charging ? "(Charging)" : "(Bat)"}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-950/80 rounded-full overflow-hidden border border-zinc-805/30">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                batteryState.level < 20 
                                  ? "bg-red-500 animate-pulse" 
                                  : batteryState.charging 
                                    ? "bg-emerald-400" 
                                    : "bg-amber-400"
                              }`}
                              style={{ width: `${batteryState.level}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Live Logcat Studio terminal console */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className={`text-[10px] uppercase tracking-wider font-elite ${
                          themeMode === "warm" ? "text-neutral-600 font-semibold" : "text-zinc-500"
                        }`}>
                          ■ Logcat Console (API Logs)
                        </div>
                        <button 
                          onClick={() => setSimulatedLogcat(["D/[Local/Logcat]: Console history purged."])}
                          className="text-[9px] hover:text-crimson font-elite text-zinc-500 uppercase cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="w-full h-28 bg-zinc-950 font-mono text-[9px] p-2 rounded-md overflow-y-auto leading-normal border border-zinc-900 select-all scrollbar-thin text-zinc-300">
                        {simulatedLogcat.map((line, i) => {
                          let colorClass = "text-zinc-400";
                          if (line.includes("E/")) colorClass = "text-red-400 font-semibold";
                          else if (line.includes("W/")) colorClass = "text-amber-400";
                          else if (line.includes("I/")) colorClass = "text-emerald-300";
                          else if (line.includes("D/")) colorClass = "text-cyan-400";
                          return (
                            <div key={i} className={`truncate ${colorClass}`} title={line}>
                              {line}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 5: Copayble Native Android build setup */}
                    <div className="space-y-1.5 border-t border-zinc-850 pt-2">
                      <div className={`text-[10px] uppercase tracking-wider font-elite ${
                        themeMode === "warm" ? "text-neutral-600 font-semibold" : "text-zinc-500"
                      }`}>
                        ■ Android Studio Integration
                      </div>
                      <div className={`p-2 border rounded-lg space-y-1.5 text-[10.5px] leading-relaxed ${
                        themeMode === "warm" ? "border-amber-955/15 bg-[#faf6ee]" : "border-zinc-900 bg-zinc-900/25"
                      }`}>
                        <p className={themeMode === "warm" ? "text-neutral-700" : "text-zinc-400"}>
                          Turn Jekyll Forge into a native Android application by running these Capacitor shell commands:
                        </p>
                        <div className="bg-zinc-950 text-red-300 font-mono text-[8.5px] p-1.5 rounded relative group leading-normal border border-zinc-900 max-h-32 overflow-y-auto">
                          <code className="block whitespace-pre select-all">
{`# 1. Install Capacitor CLI
npm i @capacitor/core @capacitor/cli

# 2. Setup Android container
npx cap init "Jekyll Forge" "com.jekyllforge.app"
npx cap add android

# 3. Build and Sync Vite files
npm run build
npx cap sync

# 4. Open in Android Studio
npx cap open android`}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`npm i @capacitor/core @capacitor/cli\nnpx cap init "Jekyll Forge" "com.jekyllforge.app"\nnpx cap add android\nnpm run build\nnpx cap sync\nnpx cap open android`);
                              alert("Copied Capacitor setup script lines to clipboard!");
                            }}
                            className="absolute top-1 right-1 bg-zinc-900 border border-zinc-800 p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white cursor-pointer"
                            title="Copy setup scripts"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Section C: Snapshots & Offline draft backup history */}
            <div className="p-4 flex-1 flex flex-col min-h-[180px]">
              <span className={`font-elite text-[10px] uppercase tracking-widest block mb-2 ${
                themeMode === "warm" ? "text-neutral-600" : "text-zinc-500"
              }`}>
                ■ SNAPSHOT RESTORE POINTS
              </span>
              <div className="space-y-2 overflow-y-auto flex-1 max-h-48 pr-1">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    onClick={() => handleRestoreSnapshot(snap)}
                    className={`p-2 border rounded-lg cursor-pointer text-left transition-all ${
                      themeMode === "warm"
                        ? "bg-[#faf6ee] border-amber-955/20 hover:border-crimson text-amber-950 shadow-inner"
                        : "bg-zinc-900/50 border-zinc-900 hover:border-zinc-700 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5 text-[9px] font-mono">
                      <span className={`font-semibold ${snap.reason === "autosave" ? "text-amber-500" : "text-crimson"}`}>
                        {snap.reason.toUpperCase()}
                      </span>
                      <span className={themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"}>
                        {new Date(snap.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className={`text-[10px] font-elite truncate ${
                      themeMode === "warm" ? "text-amber-950" : "text-zinc-400"
                    }`}>{snap.label}</p>
                  </div>
                ))}
              </div>
              <div className={`pt-2 text-[9px] font-mono leading-normal text-center ${
                themeMode === "warm" ? "text-neutral-500" : "text-zinc-650"
              }`}>
                * Local changes saved to memory. Revert timeline at any time.
              </div>
            </div>

          </aside>
        )}

        {/* CENTER STAGE: VISUAL WYSIWYG & CODE EDITOR */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Editor Header controls bar */}
          <div className={`px-4 py-2 border-b flex flex-col lg:flex-row lg:items-center justify-between select-none gap-3 ${
            themeMode === "warm" ? "border-amber-900/10 bg-[#f7f2ea]" : "border-zinc-800 bg-zinc-950"
          }`}>
            <div className="flex items-center gap-2 min-w-0 flex-grow">
              <span className="font-elite text-xs text-zinc-500 shrink-0">CANVAS STAGE:</span>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => {
                  setDraftTitle(e.target.value);
                  setDraftFrontMatter(prev => ({ ...prev, title: e.target.value }));
                }}
                className={`font-elite text-sm font-bold bg-transparent border-b border-dashed outline-none px-1 py-0.5 w-full min-w-0 ${
                  themeMode === "warm" 
                    ? "border-amber-900/15 text-amber-950 focus:border-crimson" 
                    : "border-zinc-700/50 text-red-100 focus:border-crimson"
                }`}
                placeholder="Blog post dynamic heading..."
              />
            </div>

            {/* Visual formatting and toggle buttons */}
            <div className="flex items-center gap-1.5 shrink-0 justify-start lg:justify-end flex-wrap">
              {/* Active editing mode selector */}
              {["visual", "raw", "split", "merge"].map((m) => (
                <button
                  key={m}
                  onClick={() => setEditorMode(m as any)}
                  className={`px-2.5 py-1 rounded text-xs font-elite capitalize transition-all cursor-pointer shrink-0 ${
                    editorMode === m
                      ? "bg-crimson text-white font-bold"
                      : m === "merge" && snapshots.length === 0
                      ? "text-zinc-600 cursor-not-allowed opacity-50"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  disabled={m === "merge" && snapshots.length === 0}
                  title={m === "merge" && snapshots.length === 0 ? "Unlock Merge Hub by saving or editing file snapshots" : ""}
                >
                  {m === "merge" ? "Merge Hub ⇄" : m}
                </button>
              ))}

              <div className={`h-4 w-[1px] mx-1 ${themeMode === "warm" ? "bg-amber-900/20" : "bg-zinc-800"} shrink-0`} division-line="true"></div>

              {/* Zen focus button */}
              <button
                onClick={() => {
                  setIsZenMode(true);
                  setKeystrokeVolume(0.4);
                }}
                className="px-2.5 py-1 rounded text-xs font-elite transition-all cursor-pointer shrink-0 bg-crimson/15 border border-crimson/30 hover:bg-crimson/30 text-red-100 flex items-center gap-1"
                title="Enter tactile typewriter distraction-free Focus Mode"
              >
                <Sparkles className="w-3.5 h-3.5 text-crimson animate-pulse" />
                <span>Zen Scribe (Tactile Focus)</span>
              </button>

              <div className={`h-4 w-[1px] mx-1 ${themeMode === "warm" ? "bg-amber-900/20" : "bg-zinc-800"} shrink-0`} division-line="true"></div>

              {/* Copy Markdown button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(draftMarkdown).then(() => {
                    setStatusText("Canvas markdown content copied to clipboard successfully!");
                  }).catch(err => {
                    setStatusText("Failed to copy content: " + err);
                  });
                }}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer text-xs shrink-0 flex items-center gap-1.5 ${
                  themeMode === "warm" 
                    ? "bg-[#faf6ee] border-amber-955/20 text-neutral-600 hover:bg-[#eae3d5]" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 focus:border-crimson"
                }`}
                title="Copy entire raw markdown to clipboard"
              >
                <Copy className="w-3.5 h-3.5 text-crimson" />
                <span className="font-elite text-[10px]">Copy Markdown</span>
              </button>

              {/* Print / PDF button */}
              <button
                onClick={() => {
                  window.print();
                }}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer text-xs shrink-0 flex items-center gap-1.5 ${
                  themeMode === "warm" 
                    ? "bg-[#faf6ee] border-amber-955/20 text-neutral-600 hover:bg-[#eae3d5]" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 focus:border-crimson"
                }`}
                title="Print current document and metadata to PDF"
              >
                <Printer className="w-3.5 h-3.5 text-crimson" />
                <span className="font-elite text-[10px]">Print / PDF</span>
              </button>

              <div className={`h-4 w-[1px] mx-1 ${themeMode === "warm" ? "bg-amber-900/20" : "bg-zinc-800"} shrink-0`} division-line="true"></div>

              {/* Toggle Files Left Sidebar */}
              <button
                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                title={showLeftSidebar ? "Hide Files Menu" : "Show Files Menu"}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer text-xs shrink-0 ${
                  themeMode === "warm" 
                    ? "bg-[#faf6ee] border-amber-950/20 text-neutral-600 hover:bg-[#eae3d5]" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 focus:border-crimson"
                }`}
              >
                {showLeftSidebar ? (
                  <span className={`font-elite text-[10px] ${themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"}`}>Hide Files</span>
                ) : (
                  <span className="font-elite text-[10px] text-crimson font-bold">Show Files</span>
                )}
              </button>

              {/* Toggle Front Matter Right Sidebar */}
              <button
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                title={showRightSidebar ? "Hide Front Matter Core Panel" : "Show Front Matter Core Panel"}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer text-xs shrink-0 ${
                  themeMode === "warm" 
                    ? "bg-[#faf6ee] border-amber-955/20 text-neutral-600 hover:bg-[#eae3d5]" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 focus:border-crimson"
                }`}
              >
                {showRightSidebar ? (
                  <span className={`font-elite text-[10px] ${themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"}`}>Hide Front Matter</span>
                ) : (
                  <span className="font-elite text-[10px] text-crimson font-bold">Show Front Matter</span>
                )}
              </button>

              {/* Toggle Bottom Utilities Panel */}
              <button
                onClick={() => setShowBottomPanel(!showBottomPanel)}
                title={showBottomPanel ? "Hide Bottom Utilities & AI Assistant" : "Show Bottom Utilities & AI Assistant"}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer text-xs shrink-0 ${
                  themeMode === "warm" 
                    ? "bg-[#faf6ee] border-amber-955/20 text-neutral-600 hover:bg-[#eae3d5]" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 focus:border-crimson"
                }`}
              >
                {showBottomPanel ? (
                  <span className={`font-elite text-[10px] ${themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"}`}>Hide Utilities</span>
                ) : (
                  <span className="font-elite text-[10px] text-crimson font-bold">Show Utilities</span>
                )}
              </button>
            </div>
          </div>

          {/* Core Applet Workspace Split Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
            {editorMode === "merge" ? (
              <div className="flex-1 p-5 overflow-y-auto">
                <MergeHub
                  currentPostMarkdown={draftMarkdown}
                  snapshots={snapshots}
                  onApplyMerge={(mergedText) => {
                    setDraftMarkdown(mergedText);
                    const newSnap: Snapshot = {
                      id: `snap-merge-${Date.now()}`,
                      label: `Reconciled Merge: ${draftTitle}`,
                      createdAt: new Date().toISOString(),
                      postPath: activePost.path,
                      markdown: mergedText,
                      frontMatter: draftFrontMatter,
                      reason: "manual",
                    };
                    setSnapshots(prev => [newSnap, ...prev]);
                  }}
                  themeMode={themeMode}
                />
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
                {/* Split column left: Text Content Area */}
            <div className={`h-full flex flex-col overflow-y-auto ${
              editorMode === "raw" ? "lg:col-span-12" : editorMode === "visual" ? "lg:col-span-12" : "lg:col-span-6"
            }`}>
              {/* Mini Toolbar for formatting */}
              <div className={`p-2 border-b flex gap-1 items-center flex-wrap shrink-0 ${
                themeMode === "warm" ? "border-amber-955/15 bg-[#f7f2ea]" : "border-zinc-800 bg-zinc-950/20"
              }`}>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n\n## Section Head")}
                  className={`p-1 text-xs font-elite border rounded ${
                    themeMode === "warm" 
                      ? "bg-[#faf6ee] border-amber-955/25 text-neutral-800 hover:bg-[#eae3d5]" 
                      : "bg-zinc-900/50 border-zinc-900 text-zinc-300 hover:text-crimson"
                  }`}
                  title="Insert Header"
                >
                  H2
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + " **bold_text**")}
                  className={`p-1 text-xs font-elite border rounded ${
                    themeMode === "warm" 
                      ? "bg-[#faf6ee] border-amber-955/25 text-neutral-800 hover:bg-[#eae3d5]" 
                      : "bg-zinc-900/50 border-zinc-900 text-zinc-300 hover:text-crimson"
                  }`}
                  title="Make bold"
                >
                  B
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + " *italic_text*")}
                  className={`p-1 text-xs font-elite border rounded ${
                    themeMode === "warm" 
                      ? "bg-[#faf6ee] border-amber-955/25 text-neutral-800 hover:bg-[#eae3d5]" 
                      : "bg-zinc-900/50 border-zinc-900 text-zinc-300 hover:text-crimson"
                  }`}
                  title="Make italic"
                >
                  I
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n*   Item 1\n*   Item 2")}
                  className={`p-1 text-xs font-elite border rounded ${
                    themeMode === "warm" 
                      ? "bg-[#faf6ee] border-amber-955/25 text-neutral-800 hover:bg-[#eae3d5]" 
                      : "bg-zinc-900/50 border-zinc-900 text-zinc-300 hover:text-crimson"
                  }`}
                  title="Insert Bullet List"
                >
                  List
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n> [!NOTE]\n> Typographical editorial box.")}
                  className={`p-1 text-[10px] font-elite border rounded ${
                    themeMode === "warm" 
                      ? "bg-crimson/5 border-crimson/30 text-crimson font-bold hover:bg-crimson/10" 
                      : "bg-zinc-900/50 border-zinc-900 text-crimson hover:text-crimson-hover"
                  }`}
                  title="Insert Note Callout Block"
                >
                  Note Box
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n| Topic | Value | \n|---|---| \n| Item | Description |")}
                  className={`p-1 text-xs font-elite border rounded ${
                    themeMode === "warm" 
                      ? "bg-[#faf6ee] border-amber-955/25 text-neutral-850 hover:bg-[#eae3d5]" 
                      : "bg-zinc-900/50 border-zinc-910 text-zinc-300 hover:text-crimson"
                  }`}
                  title="Insert Table grid"
                >
                  Table
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n\n```yaml\n# code block\n```")}
                  className={`p-1 text-xs font-elite border rounded ${
                    themeMode === "warm" 
                      ? "bg-[#faf6ee] border-amber-955/25 text-neutral-850 hover:bg-[#eae3d5]" 
                      : "bg-zinc-900/50 border-zinc-900 text-zinc-300 hover:text-crimson"
                  }`}
                >
                  Code Block
                </button>
                <button
                  onClick={() => setDraftMarkdown(p => p + "\n{% include footer.html %}")}
                  className={`p-1 text-[10px] font-mono border rounded ${
                    themeMode === "warm" 
                      ? "bg-[#faf6ee] border-amber-955/25 text-pink-700 hover:bg-[#eae3d5]" 
                      : "bg-zinc-900/50 border-zinc-900 text-pink-400 hover:text-crimson"
                  }`}
                  title="Insert Jekyll Liquid include tag"
                >
                  &#123;% Liquid %&#125;
                </button>

                {/* Generate Table of Contents */}
                <button
                  onClick={handleGenerateTOC}
                  className={`ml-auto px-2 py-1 text-[10px] font-elite flex items-center gap-1 cursor-pointer transition-all border rounded ${
                    themeMode === "warm"
                      ? "bg-amber-50/50 border-amber-955/20 text-neutral-800 hover:bg-[#eae3d5]"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-350 hover:text-white hover:bg-zinc-800"
                  }`}
                  title="Scan document headers and inject Table of Contents block"
                >
                  <ListTodo className="w-3 h-3 text-crimson" />
                  <span>Generate TOC</span>
                </button>

                {/* Prettify Command Bot */}
                <button
                  onClick={handlePrettifyMarkdown}
                  className={`px-2 py-1 text-[10px] font-elite flex items-center gap-1 cursor-pointer transition-all border rounded ${
                    themeMode === "warm"
                      ? "bg-emerald-50 border-emerald-600/30 text-emerald-800 hover:bg-[#eae3d5]"
                      : "bg-emerald-955/20 border-emerald-900/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40"
                  }`}
                  title="Clean up whitespace & align raw Liquid markers"
                >
                  <Sparkles className={`w-3 h-3 animate-pulse ${
                    themeMode === "warm" ? "text-emerald-600" : "text-emerald-400"
                  }`} />
                  <span>Prettify Post</span>
                </button>
              </div>

              {/* Collapsible Jekyll/Markdown Syntax Guide Trigger */}
              <div className={`px-3 py-1.5 border-b flex items-center justify-between cursor-pointer select-none text-[10px] uppercase tracking-wider font-elite ${
                themeMode === "warm" 
                  ? "bg-[#faf6ee]/60 border-amber-955/10 text-neutral-600 hover:bg-[#eae3d5]/50" 
                  : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:bg-zinc-900/50"
              }`}
              onClick={() => setShowSyntaxGuide(!showSyntaxGuide)}
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-crimson" />
                  <span>Jekyll & Markdown Syntax Reference Scribe Guide</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="opacity-60">{showSyntaxGuide ? "COLLAPSE" : "EXPAND GUIDE"}</span>
                  {showSyntaxGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Syntax Guide Content */}
              {showSyntaxGuide && (
                <div className={`p-4 border-b font-sans text-xs transition-all ${
                  themeMode === "warm" 
                    ? "bg-[#faf6ee] border-amber-955/20 text-neutral-800" 
                    : "bg-zinc-900/90 border-zinc-800 text-zinc-300"
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
                    <div>
                      <h4 className="font-bold border-b pb-1 mb-1.5 text-crimson font-elite text-[11px] uppercase tracking-wider">Headers & Layout</h4>
                      <ul className="space-y-1 font-mono text-[10px]">
                        <li><span className="text-zinc-500">## Title</span> &rarr; Heading 2</li>
                        <li><span className="text-zinc-500">### Title</span> &rarr; Heading 3</li>
                        <li><span className="text-zinc-500">&lt;!--more--&gt;</span> &rarr; Post excerpt tag</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold border-b pb-1 mb-1.5 text-crimson font-elite text-[11px] uppercase tracking-wider">Emphasis</h4>
                      <ul className="space-y-1 font-mono text-[10px]">
                        <li><span className="text-zinc-500">**text**</span> &rarr; <strong>Bold Text</strong></li>
                        <li><span className="text-zinc-500">*text*</span> &rarr; <em>Italic Text</em></li>
                        <li><span className="text-zinc-500">`code`</span> &rarr; <code>Inline Code</code></li>
                       </ul>
                    </div>
                    <div>
                      <h4 className="font-bold border-b pb-1 mb-1.5 text-crimson font-elite text-[11px] uppercase tracking-wider">Lists & Callouts</h4>
                      <ul className="space-y-1 font-mono text-[10px]">
                        <li><span className="text-zinc-500">* Item</span> &rarr; Bullet List</li>
                        <li><span className="text-zinc-500">1. Item</span> &rarr; Ordered List</li>
                        <li><span className="text-zinc-500">&gt; [!NOTE]</span> &rarr; Custom Callout Box</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold border-b pb-1 mb-1.5 text-crimson font-elite text-[11px] uppercase tracking-wider">Jekyll Liquid</h4>
                      <ul className="space-y-1 font-mono text-[10px]">
                        <li><span className="text-zinc-500">&#123;&#123; site.title &#125;&#125;</span> &rarr; Site Variable</li>
                        <li><span className="text-zinc-500">&#123;% include f.html %&#125;</span> &rarr; Template</li>
                        <li><span className="text-zinc-500">[Text](URL)</span> &rarr; Hyperlink</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Editable body textbox */}
              <div className="flex-1 p-4 relative min-h-[400px]">
                {editorMode === "visual" ? (
                  <div className="w-full h-full flex flex-col">
                    <span className={`text-[10px] font-elite uppercase block mb-2 tracking-widest leading-none ${
                        themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                    }`}>
                      📖 Vintage typewriter paper sheets view
                    </span>
                    <textarea
                      value={draftMarkdown}
                      onChange={(e) => setDraftMarkdown(e.target.value)}
                      onKeyDown={handleTypewriterKeyPress}
                      className={`w-full flex-1 bg-transparent border-0 resize-none outline-none font-sans text-lg focus:ring-0 leading-relaxed ${
                        themeMode === "warm" ? "text-neutral-900 placeholder-stone-500" : "text-[#eae7e2] placeholder-zinc-500"
                      }`}
                      style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
                      placeholder="Typewriter keys waiting to strike cotton paper sheets..."
                    />
                  </div>
                ) : (
                  <div className={`w-full h-full flex flex-col font-mono text-sm leading-relaxed ${
                    themeMode === "warm" ? "text-neutral-900" : "text-zinc-300"
                  }`}>
                    <span className={`text-[10px] font-elite uppercase block mb-2 tracking-widest leading-none ${
                      themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                    }`}>
                      ⌨ RAW MARKDOWN CODE MODE WITH SYNTAX MARKUPS
                    </span>
                    <textarea
                      value={draftMarkdown}
                      onChange={(e) => setDraftMarkdown(e.target.value)}
                      onKeyDown={handleTypewriterKeyPress}
                      className={`w-full flex-1 bg-transparent resize-none border-0 outline-none font-mono focus:ring-0 ${
                        themeMode === "warm" 
                          ? "text-[#231a15] selection:bg-crimson/15 placeholder-neutral-500" 
                          : "text-amber-100/90 selection:bg-crimson/30 placeholder-zinc-600"
                      }`}
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
                  <div className={`pb-4 mb-6 border-b-2 border-dashed ${
                    themeMode === "warm" ? "border-amber-955/20" : "border-zinc-700"
                  }`}>
                    <span className="text-xs font-elite text-crimson tracking-wider uppercase inline-block pr-1">
                      {draftFrontMatter.layout ? `layout: ${draftFrontMatter.layout}` : "no layout"}
                    </span>
                    {draftFrontMatter.categories && draftFrontMatter.categories.length > 0 && (
                      <span className={`text-[10px] font-mono ${
                        themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                      }`}>
                        in {draftFrontMatter.categories.join(", ")}
                      </span>
                    )}

                    <h1 className={`text-3xl font-black font-elite tracking-tight mt-2 leading-tight ${
                      themeMode === "warm" ? "text-neutral-900" : "text-white"
                    }`}>
                      {draftTitle || "Untitled Chapter Draft"}
                    </h1>
                    
                    <div className={`flex flex-wrap gap-2 items-center text-xs mt-2 font-mono ${
                      themeMode === "warm" ? "text-neutral-600" : "text-zinc-400"
                    }`}>
                      <span>Author: <strong className={themeMode === "warm" ? "text-neutral-900" : "text-zinc-300"}>{draftFrontMatter.author || "Global Editor"}</strong></span>
                      <span>•</span>
                      <span>Date: {draftFrontMatter.date || new Date().toISOString()}</span>
                    </div>

                    {/* Metadata tags line */}
                    {draftFrontMatter.tags && draftFrontMatter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {draftFrontMatter.tags.map((t: string) => (
                          <span key={t} className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                            themeMode === "warm" 
                              ? "bg-[#faf6ee] border-amber-955/20 text-neutral-800" 
                              : "bg-zinc-900 border-zinc-800 text-zinc-400"
                          }`}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* HTML rendered markdown */}
                  <div
                    className={themeMode === "warm" 
                      ? "prose prose-stone text-neutral-900 max-w-none text-left leading-relaxed prose-headings:text-neutral-950 prose-a:text-crimson prose-strong:text-neutral-950" 
                      : "prose prose-invert text-zinc-300 max-w-none text-left leading-relaxed prose-headings:text-white prose-a:text-crimson prose-strong:text-white"}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(draftMarkdown, selectedRepo.owner, selectedRepo.name, selectedRepo.selectedBranch),
                    }}
                  />
                </div>
              </div>
            )}

              </div>
            )}
          </div>

          {/* LOWER INTERACTIVE SHEETS & SETTINGS (CONTAINED IN BOTTOM PANEL) */}
          {showBottomPanel && (
            <div className="border-t border-zinc-800 bg-zinc-950 shrink-0 max-h-[340px] overflow-y-auto">
              {/* LOWER INTERACTIVE SHEETS: AI PLUGINS AND SYSTEM AUDITS */}
              <div className="p-6 space-y-6">
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

                    <div className="space-y-2.5 flex-1 max-h-[320px] overflow-y-auto pr-1">
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
              <div className="border-t border-zinc-800/40 bg-zinc-950/40 p-6">
                <AISettings
                  settings={aiSettings}
                  onUpdate={(fields) => setAiSettings(prev => ({ ...prev, ...fields }))}
                  openaiKey={openaiKey}
                  onUpdateOpenaiKey={setOpenaiKey}
                />
              </div>
            </div>
          )}

        </main>

        {/* RIGHT SIDEBAR PANEL: DETAILED METADATA & FRONT-MATTER FORM */}
        {showRightSidebar && (
          <aside className={`w-80 border-l p-4 flex flex-col gap-6 overflow-y-auto shrink-0 select-none ${
            themeMode === "warm" ? "border-amber-955/15 bg-[#faf6ee]" : "border-zinc-800 bg-zinc-950"
          }`}>
            
            <div className={`flex items-center justify-between border-b pb-2 ${
              themeMode === "warm" ? "border-amber-955/10" : "border-zinc-800"
            }`}>
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-crimson" />
                <span className={`font-elite text-xs uppercase tracking-widest font-bold ${
                  themeMode === "warm" ? "text-neutral-800" : "text-zinc-300"
                }`}>
                  🛠 Front Matter Core
                </span>
              </div>
              
              <button
                onClick={() => setShowRawYAMLEditor(p => !p)}
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                  themeMode === "warm" 
                    ? "border-amber-955/20 text-neutral-600 hover:text-crimson" 
                    : "border-zinc-800 text-zinc-400 hover:text-red-300"
                }`}
              >
                {showRawYAMLEditor ? "LITERAL FIELD" : "RAW YAML"}
              </button>
            </div>

            {showRawYAMLEditor ? (
              <div className="space-y-2">
                <span className={`text-[10px] font-elite block uppercase ${
                  themeMode === "warm" ? "text-neutral-600" : "text-zinc-500"
                }`}>
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
                  className={`w-full font-mono text-[11px] p-2.5 rounded focus:border-crimson outline-none border ${
                    themeMode === "warm" 
                      ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-900" 
                      : "bg-zinc-950/80 border-zinc-800 text-zinc-300"
                  }`}
                />
                <p className="text-[9px] text-zinc-500 italic">
                  * Edit fields inside raw JSON structure notation above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* layout */}
                <div>
                  <label className={`block text-[10px] font-elite uppercase tracking-widest mb-1 leading-none ${
                    themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"
                  }`}>
                    Page Layout
                  </label>
                  <select
                    value={draftFrontMatter.layout || "post"}
                    onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, layout: e.target.value }))}
                    className={`w-full font-mono text-xs p-2 rounded focus:border-crimson outline-none shrink-0 cursor-pointer border ${
                      themeMode === "warm" 
                        ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-900" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-250 text-zinc-200"
                    }`}
                  >
                    <option value="post">post (Standard blog record)</option>
                    <option value="page">page (Static standalone site)</option>
                    <option value="default">default (Main wrapping wrapper)</option>
                    <option value="home">home (Landing container)</option>
                  </select>
                </div>

                {/* slug / permalink */}
                <div>
                  <label className={`block text-[10px] font-elite uppercase tracking-widest mb-1 leading-none ${
                    themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"
                  }`}>
                    Dynamic URL Path Slug
                  </label>
                  <input
                    type="text"
                    value={draftFrontMatter.slug || activePost.slug}
                    onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, slug: e.target.value }))}
                    className={`w-full font-mono text-xs p-2 rounded focus:border-crimson outline-none border ${
                      themeMode === "warm" 
                        ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-900 placeholder-stone-500" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 placeholder-zinc-650"
                    }`}
                    placeholder="slug-value-record"
                  />
                </div>

                {/* author */}
                <div>
                  <label className={`block text-[10px] font-elite uppercase tracking-widest mb-1 leading-none ${
                    themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"
                  }`}>
                    Author Signature
                  </label>
                  <input
                    type="text"
                    value={draftFrontMatter.author || ""}
                    onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, author: e.target.value }))}
                    className={`w-full font-mono text-xs p-2 rounded focus:border-crimson outline-none border ${
                      themeMode === "warm" 
                        ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-900 placeholder-stone-500" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 placeholder-zinc-650"
                    }`}
                    placeholder="Oliver Sterling"
                  />
                </div>

                {/* published_date (Jekyll dynamic scheduling) */}
                <div>
                  <label className="block text-[10px] font-elite uppercase tracking-widest mb-1 leading-none flex justify-between">
                    <span className={themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"}>Jekyll Publish Date</span>
                    <span className="font-mono text-[9px] text-zinc-500">Post scheduling</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={draftFrontMatter.published_date || ""}
                      onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, published_date: e.target.value }))}
                      className={`w-full font-mono text-xs p-2 rounded focus:border-crimson outline-none border ${
                        themeMode === "warm" 
                          ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-900" 
                          : "bg-zinc-900 border-zinc-800 text-zinc-350"
                      }`}
                    />
                  </div>
                  <p className="text-[9px] text-zinc-550 mt-1 italic">
                    * Select a future date to schedule Jekyll build runs.
                  </p>
                </div>

                {/* categories */}
                <div>
                  <label className="block text-[10px] font-elite uppercase tracking-widest mb-1 leading-none flex justify-between">
                    <span className={themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"}>Categories Array</span>
                    <span className="font-mono text-[9px] text-zinc-500">Comma split</span>
                  </label>
                  <input
                    type="text"
                    value={draftFrontMatter.categories ? draftFrontMatter.categories.join(", ") : ""}
                    onChange={(e) => handleUpdateArrayField("categories", e.target.value)}
                    className={`w-full font-mono text-xs p-2 rounded focus:border-crimson outline-none border ${
                      themeMode === "warm" 
                        ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-900 placeholder-stone-500" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 placeholder-zinc-c50"
                    }`}
                    placeholder="chronicles, web, review"
                  />
                </div>

                {/* tags */}
                <div>
                  <label className="block text-[10px] font-elite uppercase tracking-widest mb-1 leading-none flex justify-between">
                    <span className={themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"}>Tags Array</span>
                    <span className="font-mono text-[9px] text-zinc-500">Comma split</span>
                  </label>
                  <input
                    type="text"
                    value={draftFrontMatter.tags ? draftFrontMatter.tags.join(", ") : ""}
                    onChange={(e) => handleUpdateArrayField("tags", e.target.value)}
                    className={`w-full font-mono text-xs p-2 rounded focus:border-crimson outline-none border ${
                      themeMode === "warm" 
                        ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-900 placeholder-stone-500" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 placeholder-[#444]"
                    }`}
                    placeholder="ink, typewriter, vintage"
                  />
                </div>

                {/* description / excerpt */}
                <div>
                  <label className={`block text-[10px] font-elite uppercase tracking-widest mb-1 leading-none ${
                    themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"
                  }`}>
                    Seo Meta Description
                  </label>
                  <textarea
                    value={draftFrontMatter.description || ""}
                    onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full font-mono text-xs p-2 rounded focus:border-crimson outline-none leading-relaxed border ${
                      themeMode === "warm" 
                        ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-900 placeholder-stone-500" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 placeholder-zinc-600"
                    }`}
                    placeholder="Short, elegant SEO meta summary under 160 chars..."
                  />
                </div>

                {/* featured image path */}
                <div>
                  <label className={`block text-[10px] font-elite uppercase tracking-widest mb-1 leading-none ${
                    themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-500"
                  }`}>
                    Featured Image URL / Rel-path
                  </label>
                  <input
                    type="text"
                    value={draftFrontMatter.image || ""}
                    onChange={(e) => setDraftFrontMatter(prev => ({ ...prev, image: e.target.value }))}
                    className={`w-full font-mono text-xs p-2 rounded focus:border-crimson outline-none border ${
                      themeMode === "warm" 
                        ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-900 placeholder-stone-500" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 placeholder-zinc-600"
                    }`}
                    placeholder="assets/images/typewriter.jpg"
                  />
                </div>

                {/* Dynamic Added Metadata keys */}
                <div className={`pt-2 border-t ${
                  themeMode === "warm" ? "border-amber-955/10" : "border-zinc-900"
                }`}>
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
                        <div key={key} className={`p-2 rounded-md flex items-center justify-between border ${
                          themeMode === "warm" ? "bg-[#fbf9f4] border-amber-955/20 text-neutral-800" : "bg-zinc-900/40 border-zinc-900 text-zinc-300"
                        }`}>
                          <div className="font-mono text-[10px]">
                            <span className={`font-bold mr-1 ${
                              themeMode === "warm" ? "text-amber-955" : "text-zinc-300"
                            }`}>{key}:</span> 
                            <span className={themeMode === "warm" ? "text-neutral-700" : "text-zinc-400"}>{String(val)}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveCustomKey(key)}
                            className="text-zinc-650 hover:text-crimson font-mono text-[9px] cursor-pointer"
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
            <div className={`mt-auto border-t pt-4 space-y-4 ${
              themeMode === "warm" ? "border-amber-955/15" : "border-zinc-900"
            }`}>
              <span className={`font-elite text-[10px] uppercase tracking-widest block leading-none ${
                themeMode === "warm" ? "text-neutral-600 font-bold" : "text-zinc-500"
              }`}>
                ■ Active Jekyll Theme Settings
              </span>
              
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between">
                  <span className={themeMode === "warm" ? "text-neutral-600" : "text-zinc-500"}>Theme Gem:</span>
                  <span className="font-mono text-crimson font-bold">minima</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeMode === "warm" ? "text-neutral-600" : "text-zinc-500"}>Build Target:</span>
                  <span className={`font-mono ${
                    themeMode === "warm" ? "text-neutral-800 font-semibold" : "text-zinc-400"
                  }`}>GitHub Pages</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-[8px] font-mono uppercase mb-0.5 ${
                    themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                  }`}>Title Font</label>
                  <select
                    value={themeConfig.headingFont}
                    onChange={(e) => setThemeConfig(prev => ({ ...prev, headingFont: e.target.value }))}
                    className={`w-full text-[10px] font-mono p-1 rounded outline-none border cursor-pointer ${
                      themeMode === "warm" 
                        ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-800" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-300"
                    }`}
                  >
                    <option value="Special Elite">Special Elite</option>
                    <option value="Courier Prime">Courier Prime</option>
                    <option value="Cinzel">Cinzel</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[8px] font-mono uppercase mb-0.5 ${
                    themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                  }`}>Body Font</label>
                  <select
                    value={themeConfig.bodyFont}
                    onChange={(e) => setThemeConfig(prev => ({ ...prev, bodyFont: e.target.value }))}
                    className={`w-full text-[10px] font-mono p-1 rounded outline-none border cursor-pointer ${
                      themeMode === "warm" 
                        ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-800" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-300"
                    }`}
                  >
                    <option value="Crimson Pro">Crimson Pro</option>
                    <option value="Lora">Lora</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
              </div>
            </div>

          </aside>
        )}

      </div>

      {/* 3. FOOTER LIVE STATUS BOARD */}
      <footer className={`border-t flex flex-wrap gap-4 items-center justify-between px-4 py-2 shrink-0 text-[11px] font-sans ${
        themeMode === "warm" ? "border-amber-955/15 bg-[#f7f2ea] text-neutral-800" : "border-zinc-900 bg-zinc-950 text-zinc-400"
      }`}>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-emerald-550 text-emerald-500 shrink-0" />
            <span className="font-mono">{statusText}</span>
          </div>
          <span className={themeMode === "warm" ? "text-amber-955/25" : "text-zinc-800"}>|</span>
          <div>
            <span>Target Root: <strong className={`font-mono ${
              themeMode === "warm" ? "text-neutral-900" : "text-zinc-300"
            }`}>/{selectedRepo.rootPath}</strong></span>
          </div>
          <span className={themeMode === "warm" ? "text-amber-955/25" : "text-zinc-800"}>|</span>
          <div>
            <span>Active Branch: <strong className={`font-mono ${
              themeMode === "warm" ? "text-neutral-900" : "text-zinc-300"
            }`}>{selectedRepo.selectedBranch}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] border ${
            themeMode === "warm" 
              ? "bg-[#eae2d5] border-amber-955/15 text-neutral-800" 
              : "bg-zinc-900 border-zinc-800/80 text-zinc-400"
          }`}>
            <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Simulated Git Proxy Active</span>
          </div>
          
          <div className={themeMode === "warm" ? "text-neutral-600" : "text-zinc-500"}>
            Render Node Time: <span className={themeMode === "warm" ? "text-neutral-900" : "text-zinc-300"}>2026-05-20 UTC</span>
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

      {/* Modal 1.5: GitHub Branches & Commits History Sync */}
      {showGitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`border rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl ${
            themeMode === "warm" ? "bg-[#faf6ee] border-amber-955/20 text-neutral-800" : "bg-zinc-950 border-zinc-800 text-zinc-100"
          }`}>
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              themeMode === "warm" ? "border-amber-955/15 bg-[#f5efe4]" : "border-zinc-850 bg-zinc-900/40"
            }`}>
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-crimson animate-pulse" />
                <span className="font-elite text-sm text-crimson font-bold uppercase tracking-widest">
                  GitHub Workspace Branch & History
                </span>
              </div>
              <button
                onClick={() => setShowGitModal(false)}
                className={`text-sm p-1 rounded cursor-pointer transition-colors ${
                  themeMode === "warm" ? "text-neutral-500 hover:text-neutral-800 hover:bg-amber-955/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <span className={`text-[10px] font-elite uppercase tracking-wider block leading-none mb-1 ${
                  themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                }`}>
                  Repository Reference Scope
                </span>
                <span className={`font-mono font-semibold text-xs py-1 px-2.5 rounded border ${
                  themeMode === "warm" ? "bg-[#fbf9f4] border-amber-955/25 text-neutral-800" : "bg-zinc-900 border-zinc-850 text-zinc-300"
                }`}>
                  {selectedRepo.owner}/{selectedRepo.name}
                </span>
              </div>

              {/* Offline/Simulated Alert Banner */}
              {isSimulatedData && (
                <div className={`p-3.5 border rounded text-xs space-y-2.5 shadow-inner ${
                  themeMode === "warm" 
                    ? "bg-amber-955/5 border-amber-955/15 text-[#6c5431]" 
                    : "bg-amber-955/10 border-amber-900/20 text-amber-200/95"
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="leading-normal border-0 outline-none">
                      <strong>Offline Mock Mode Active:</strong> We projected a high-fidelity local snapshot of the repository's metadata because no live remote token is currently mapped, or request rate limits were reached.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowGitModal(false);
                        setShowGithubSetup(true);
                      }}
                      className={`text-[10px] uppercase font-elite border px-2 py-0.5 rounded cursor-pointer text-right transition-colors ${
                        themeMode === "warm" 
                          ? "text-amber-850 border-amber-955/35 hover:bg-amber-955/15" 
                          : "text-amber-400 border-amber-900/30 hover:bg-amber-950/40"
                      }`}
                    >
                      Configure GitHub Credentials
                    </button>
                  </div>
                </div>
              )}

              {/* State rendering */}
              {isGitLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <RefreshCw className="w-6 h-6 text-crimson animate-spin" />
                  <span className={`text-xs font-elite ${
                    themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                  }`}>
                    Querying live branches tree & commit activity payload...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                  {/* Left Column: Branches list */}
                  <div className="lg:col-span-5 space-y-2">
                    <label className={`block text-[10px] font-elite uppercase tracking-widest ${
                      themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                    }`}>
                      Remote Branches ({gitBranches.length})
                    </label>
                    <p className={`text-[10px] leading-normal ${
                      themeMode === "warm" ? "text-neutral-600" : "text-zinc-400"
                    }`}>
                      Choose an active target branch to switch editing focus:
                    </p>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {gitBranches.map((branch) => {
                        const isActive = branch.name === selectedRepo.selectedBranch;
                        return (
                          <button
                            key={branch.name}
                            onClick={() => handleSwitchRepositoryBranch(branch.name)}
                            className={`w-full p-2 rounded text-xs text-left cursor-pointer transition-all flex items-center justify-between border ${
                              isActive
                                ? "bg-crimson/10 border-crimson/30 text-crimson font-bold shadow-inner"
                                : themeMode === "warm"
                                  ? "bg-[#fbf9f4] hover:bg-[#eae3d5] border-amber-955/20 text-neutral-800"
                                  : "bg-zinc-900/60 hover:bg-zinc-900 border-zinc-850 hover:border-zinc-800 text-zinc-300"
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <GitBranch className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-crimson' : 'text-zinc-500'}`} />
                              <span className="truncate">{branch.name}</span>
                            </span>
                            {branch.protected && (
                              <span className={`text-[8px] font-elite uppercase px-1 rounded border ${
                                themeMode === "warm" 
                                  ? "bg-[#f5efe4] border-amber-955/30 text-neutral-500" 
                                  : "bg-zinc-800 border-zinc-700/30 text-zinc-500"
                              }`}>
                                Protected
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Commit logs */}
                  <div className="lg:col-span-7 space-y-2">
                    <label className={`block text-[10px] font-elite uppercase tracking-widest ${
                      themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                    }`}>
                      Recent Commit Logs ({selectedRepo.selectedBranch})
                    </label>
                    <div className={`space-y-2 max-h-[260px] overflow-y-auto pr-1 border p-2.5 rounded ${
                      themeMode === "warm" 
                        ? "bg-[#fbf9f4] border-amber-955/20 text-neutral-800" 
                        : "bg-zinc-950 border-zinc-900 text-zinc-300"
                    }`}>
                      {gitCommits.length === 0 ? (
                        <p className={`text-xs text-center py-6 leading-normal ${
                          themeMode === "warm" ? "text-neutral-500" : "text-zinc-500"
                        }`}>
                          No commits found for selected branch target.
                        </p>
                      ) : (
                        gitCommits.map((c) => {
                          const dateString = c.commit?.author?.date
                            ? new Date(c.commit.author.date).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A";
                          const shortSha = c.sha?.slice(0, 7) || "unknown";
                          const commitUrl = c.html_url || `https://github.com/${selectedRepo.owner}/${selectedRepo.name}/commit/${c.sha}`;

                          return (
                            <div
                              key={c.sha}
                              className={`p-2 rounded border transition-colors space-y-1 text-xs ${
                                themeMode === "warm" 
                                  ? "hover:bg-amber-955/5 border-transparent hover:border-amber-955/15" 
                                  : "hover:bg-zinc-900/60 border-transparent hover:border-zinc-850/50"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[10px] text-crimson font-bold bg-crimson/5 border border-crimson/10 px-1 py-0.5 rounded leading-none">
                                  {shortSha}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono tracking-wide leading-none">
                                  {dateString}
                                </span>
                              </div>
                              <p className={`font-medium leading-snug ${
                                themeMode === "warm" ? "text-neutral-900" : "text-zinc-300"
                              }`}>
                                {c.commit?.message}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                                <span>
                                  By: <strong className={themeMode === "warm" ? "text-neutral-700 font-semibold" : "text-zinc-400"}>{c.commit?.author?.name}</strong>
                                </span>
                                <a
                                  href={commitUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-crimson hover:text-crimson-hover flex items-center gap-0.5 inline-flex"
                                  title="Inspect commit raw payload on GitHub"
                                >
                                  <span>Inspect</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between ${
              themeMode === "warm" ? "border-amber-955/15 bg-[#f5efe4]" : "border-zinc-850 bg-zinc-900/20"
            }`}>
              <button
                onClick={fetchGitData}
                disabled={isGitLoading}
                className={`px-3 py-1.5 rounded border transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-elite ${
                  themeMode === "warm"
                    ? "bg-[#faf6ee] border-amber-955/25 text-neutral-700 hover:bg-[#eae3d5]"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isGitLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Logs</span>
              </button>
              <button
                onClick={() => setShowGitModal(false)}
                className="px-4 py-1.5 text-xs font-elite font-bold bg-crimson hover:bg-crimson-hover text-white rounded transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1.8: Custom PWA Mobile Installation Assistant */}
      {showPwaInstallModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`border rounded-lg max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl ${
            themeMode === "warm" ? "bg-[#faf6ee] border-amber-955/20 text-neutral-800" : "bg-zinc-950 border-zinc-800 text-zinc-100"
          }`}>
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              themeMode === "warm" ? "border-amber-955/15 bg-[#f5efe4]" : "border-zinc-850 bg-zinc-900/40"
            }`}>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-crimson animate-pulse" />
                <span className="font-elite text-sm text-crimson font-bold uppercase tracking-widest">
                  Mobile Jekyll Forge Installer
                </span>
              </div>
              <button
                onClick={() => setShowPwaInstallModal(false)}
                className={`text-sm p-1 rounded cursor-pointer transition-colors ${
                  themeMode === "warm" ? "text-neutral-500 hover:text-neutral-800 hover:bg-amber-955/10" : "text-zinc-500 hover:text-zinc-305 hover:bg-zinc-900"
                }`}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5 text-sm leading-relaxed">
              <div className="text-center font-sans space-y-2">
                <div className="w-16 h-16 bg-crimson/10 rounded-2xl mx-auto flex items-center justify-center border border-crimson/25 shadow-inner">
                  <Smartphone className="w-8 h-8 text-crimson" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-elite font-bold text-base text-crimson tracking-wider uppercase">Jekyll Forge Editorial CMS</h4>
                  <p className="text-xs opacity-70">Progressive Web Application Installation Framework</p>
                </div>
              </div>

              <p className={themeMode === "warm" ? "text-neutral-700 text-xs text-center" : "text-zinc-400 text-xs text-center"}>
                Jekyll Forge runs in a dedicated standalone app sandbox on Android or iOS. Install it below to enable persistent draft storage, desktop shortcut icons, and distraction-free editing.
              </p>

              <hr className={themeMode === "warm" ? "border-amber-955/10" : "border-zinc-900"} />

              {/* Walkthrough Platforms */}
              <div className="space-y-4">
                {/* 1. Android Platform Chrome */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 font-elite text-xs uppercase font-bold text-crimson tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-crimson"></span>
                    Android Chrome Deployment
                  </div>
                  <div className={`p-3 rounded-lg text-xs space-y-1.5 ${
                    themeMode === "warm" ? "bg-[#f5efe4]" : "bg-zinc-900/40"
                  }`}>
                    <p>1. Open Jekyll Forge in your Android Chrome or Samsung browser.</p>
                    <p>2. Tap the browser options menu <strong className="font-mono text-crimson font-bold">⋮</strong> (typically on the top-right corner).</p>
                    <p>3. Select <strong className="font-semibold text-crimson">"Add to Home screen"</strong> or <strong className="font-semibold text-crimson">"Install app"</strong>.</p>
                    <p>4. Confirm the installation. A native launcher shortcut will be compiled on your home screen.</p>
                  </div>
                </div>

                {/* 2. iOS Apple Safari */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 font-elite text-xs uppercase font-bold text-crimson tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-crimson"></span>
                    iOS Apple Safari Deployment
                  </div>
                  <div className={`p-3 rounded-lg text-xs space-y-1.5 ${
                    themeMode === "warm" ? "bg-[#f5efe4]" : "bg-zinc-900/40"
                  }`}>
                    <p>1. Launch Safari browser and navigate to the Jekyll Forge address.</p>
                    <p>2. Tap the central <strong className="font-semibold text-crimson">"Share"</strong> icon (the square with an arrow pointing up at the footer).</p>
                    <p>3. Scroll down the item list and click <strong className="font-semibold text-crimson">"Add to Home Screen" (+)</strong>.</p>
                    <p>4. Input a custom name and tap 'Add'. The app will instantly launch as a standalone web app.</p>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              <div className="p-3 bg-teal-950/15 border border-teal-850/50 rounded text-xs text-teal-400 font-sans leading-relaxed">
                💡 <strong>Pro Tip</strong>: In standalone modes, draft sync works even in tunnel transits! Any workspace drafts you commit locally will run on background Sync APIs once network returns.
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-3 border-t flex justify-end gap-2.5 shrink-0 ${
              themeMode === "warm" ? "border-amber-955/15 bg-[#f5efe4]" : "border-zinc-850 bg-zinc-900/40"
            }`}>
              <button
                onClick={() => setShowPwaInstallModal(false)}
                className="px-4 py-1.5 text-xs font-elite font-bold bg-crimson hover:bg-crimson-hover text-white rounded transition-colors cursor-pointer uppercase tracking-wider"
              >
                Understood, Got it!
              </button>
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
                { label: "Save workspace draft copy", desc: "Commit current chapter draft structures into _drafts directory via GitHub REST API.", action: () => handleSaveToDrafts() },
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
                      <p className="text-[10px] text-zinc-555 italic mt-0.5">{cmd.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-crimson" />
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* ZEN FOCUS MODE INTERACTIVE OVERLAY */}
      {isZenMode && (
        <div className={`fixed inset-0 z-50 flex flex-col font-sans select-none overflow-hidden transition-colors duration-300 ${
          zenTheme === "amber"
            ? "bg-black text-amber-500"
            : zenTheme === "green"
            ? "bg-black text-green-500"
            : zenTheme === "parchment"
            ? "bg-[#faf6ee] text-amber-955"
            : "bg-zinc-950 text-zinc-100"
        }`}>
          {/* Scanlines layer for CRT amber/green themes */}
          {(zenTheme === "amber" || zenTheme === "green") && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] z-20"></div>
          )}

          {/* Floating Zen Controls Bar */}
          <div className={`px-6 py-4 flex items-center justify-between border-b flex-wrap gap-3 ${
            zenTheme === "parchment" ? "bg-[#f4efe4] border-amber-955/20 text-[#2c2421]" : "bg-zinc-900/60 border-zinc-800 text-zinc-200"
          }`}>
            <div className="flex items-center gap-3">
              <span className="grungy-stamp border-crimson text-crimson text-xs font-bold font-elite bg-crimson/5 tracking-widest px-2.5 py-0.5 rounded">
                ZEN TYPEWRITER
              </span>
              <span className="font-sans text-xs opacity-60 hidden md:inline">
                Distraction-Free Vintage Scribe Draft Room
              </span>
            </div>

            {/* Adjusters Panel */}
            <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
              {/* Keystrokes Volume */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase opacity-70">Clicks:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={keystrokeVolume}
                  onChange={(e) => setKeystrokeVolume(parseFloat(e.target.value))}
                  className="w-16 accent-crimson h-1 bg-zinc-700 rounded-lg cursor-pointer"
                />
              </div>
              {/* Rain Soundscapes */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase opacity-70">Rain:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={rainVolume}
                  onChange={(e) => setRainVolume(parseFloat(e.target.value))}
                  className="w-16 accent-crimson h-1 bg-zinc-700 rounded-lg cursor-pointer"
                />
              </div>
              {/* Fireplace Hum */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase opacity-70">Fire:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={fireplaceVolume}
                  onChange={(e) => setFireplaceVolume(parseFloat(e.target.value))}
                  className="w-16 accent-crimson h-1 bg-zinc-700 rounded-lg cursor-pointer"
                />
              </div>
              {/* Theme select slider */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase opacity-70">Style:</span>
                <select
                  value={zenTheme}
                  onChange={(e) => setZenTheme(e.target.value as any)}
                  className={`text-[10px] p-1 border font-elite rounded outline-none ${
                    zenTheme === "parchment" ? "bg-[#faf6ee] border-amber-955/20 text-neutral-800" : "bg-black border-zinc-800 text-zinc-300"
                  }`}
                >
                  <option value="amber">Phosphor Amber</option>
                  <option value="green">Term Green</option>
                  <option value="parchment">Parchment 紙</option>
                  <option value="obsidian">Slate Slate</option>
                </select>
              </div>

              {/* Exit Button */}
              <button
                onClick={() => {
                  setIsZenMode(false);
                  setRainVolume(0);
                  setFireplaceVolume(0);
                }}
                className="bg-crimson hover:bg-[#a61515] text-white font-elite text-[10px] uppercase px-3.5 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer"
              >
                ✕ Close Zen
              </button>
            </div>
          </div>

          {/* Big Centered Typewriter Paper Page sheets */}
          <div className="flex-1 flex justify-center py-8 px-4 overflow-y-auto min-h-0 relative">
            <div className={`w-full max-w-3xl flex flex-col p-8 sm:p-12 shadow-2xl rounded-lg h-full min-h-[500px] border relative transition-all ${
              zenTheme === "amber"
                ? "bg-black border-amber-500/20 text-amber-500/95"
                : zenTheme === "green"
                ? "bg-black border-green-500/20 text-green-500/95"
                : zenTheme === "parchment"
                ? "bg-[#fbf9f4] border-amber-955/15 text-neutral-900 shadow-amber-950/5 shadow-2xl"
                : "bg-zinc-900 border-zinc-800 text-zinc-100"
            }`}>
              {/* Post title banner */}
              <div className="border-b border-dashed pb-3 mb-4 opacity-75">
                <span className="text-[10px] font-mono uppercase mr-2 tracking-widest font-bold">
                  Chapter Draft •
                </span>
                <span className="text-xs font-elite italic font-semibold">{draftTitle || "Untitled Draft"}</span>
              </div>

              {/* Typewriter text editor */}
              <textarea
                value={draftMarkdown}
                onChange={(e) => setDraftMarkdown(e.target.value)}
                onKeyDown={handleTypewriterKeyPress}
                className={`w-full flex-1 bg-transparent resize-none border-0 outline-none font-sans text-xl focus:ring-0 leading-relaxed placeholder:opacity-30 ${
                  zenTheme === "amber"
                    ? "font-mono text-amber-500 select-amber"
                    : zenTheme === "green"
                    ? "font-mono text-green-500 select-green"
                    : "font-serif text-[#1e130c]"
                }`}
                style={{
                  fontFamily: (zenTheme === "amber" || zenTheme === "green") ? "'JetBrains Mono', Courier, monospace" : "'Crimson Pro', Georgia, serif"
                }}
                placeholder="Unleash your classic stories. The infinite typing sheet is waiting... Clicks strike, enters bell, background winds blow."
                autoFocus
              />

              {/* Tactile Bottom Status */}
              <div className="mt-4 pt-3 border-t border-dashed opacity-50 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span>{countWords(draftMarkdown)} words spoken</span>
                  <span>•</span>
                  <span>{estimateReadingTime(draftMarkdown)} min read duration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="animate-pulse text-crimson">●</span>
                  <span className="uppercase text-[9px] tracking-wide font-elite">Live Ink Scribing active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Document Target */}
      <div id="print-document-target">
        <h1 className="print-title">{draftTitle || "Untitled Chapter Draft"}</h1>
        <div className="print-meta">
          <span><strong>Layout:</strong> {draftFrontMatter.layout || "post"}</span>
          <span><strong>Author:</strong> {draftFrontMatter.author || "Global Editor"}</span>
          <span><strong>Date:</strong> {draftFrontMatter.date || new Date().toISOString().split("T")[0]}</span>
          {draftFrontMatter.published_date && (
            <span><strong>Publish Date:</strong> {draftFrontMatter.published_date}</span>
          )}
          {draftFrontMatter.categories && draftFrontMatter.categories.length > 0 && (
            <span><strong>Categories:</strong> {draftFrontMatter.categories.join(", ")}</span>
          )}
        </div>
        <div 
          className="print-body"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(draftMarkdown, selectedRepo.owner, selectedRepo.name, selectedRepo.selectedBranch),
          }}
        />
      </div>

    </div>
  );
}
