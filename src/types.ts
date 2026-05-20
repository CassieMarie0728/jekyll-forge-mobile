/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Repository {
  owner: string;
  name: string;
  defaultBranch: string;
  selectedBranch: string;
  rootPath: string; // usually "/" or "docs"
  isJekyll: boolean;
  permissions?: {
    admin?: boolean;
    push?: boolean;
    pull?: boolean;
  };
}

export interface JekyllPost {
  path: string; // e.g., "_posts/2026-05-20-hello-world.md"
  filename: string; // e.g., "2026-05-20-hello-world.md"
  slug: string; // e.g., "hello-world"
  frontMatter: Record<string, any>;
  markdown: string;
  status: "draft" | "published" | "modified" | "new"| "scheduled";
  sha?: string; // GitHub SHA for updates
  localUnsaved?: boolean;
}

export interface Asset {
  path: string;
  name: string;
  url: string;
  mimeType: string;
  size?: number;
  sha?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface Snapshot {
  id: string;
  label: string;
  createdAt: string;
  postPath?: string;
  markdown: string;
  frontMatter: Record<string, any>;
  reason: "manual" | "autosave" | "before-ai" | "before-publish" | "before-theme" | "before-plugin";
}

export interface AIStyleProfile {
  id: string;
  name: string;
  tone: string;
  vocabulary: string;
  formality: "Casual" | "Professional" | "Academic" | "Conversational";
  sentenceLength: "Short" | "Varied" | "Long";
  rules: string;
}

export interface AIUsageRecord {
  timestamp: string;
  task: string;
  promptLength: number;
  responseLength: number;
  estimatedCost: number;
}

export interface SEOReportItem {
  id: string;
  type: "seo" | "accessibility" | "structure";
  severity: "critical" | "warning" | "suggestion";
  message: string;
  fixed?: boolean;
}
