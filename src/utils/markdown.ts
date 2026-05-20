/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Super lightweight, extremely fast Markdown to HTML converter tailored for previewing.
 * Supports Jekyll layouts, tables, checkboxes, checkboxes, code-highlight fences, inline formats, and liquid tags.
 */
export function countWords(markdown: string): number {
  if (!markdown) return 0;
  return markdown.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateReadingTime(markdown: string): number {
  const words = countWords(markdown);
  return Math.max(1, Math.ceil(words / 220)); // Average rate: 220 words per minute
}

export interface HeaderOutlineItem {
  id: string;
  level: number;
  text: string;
}

export function extractHeaderOutline(markdown: string): HeaderOutlineItem[] {
  const lines = markdown.split(/\r?\n/);
  const outline: HeaderOutlineItem[] = [];
  let codeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      codeBlock = !codeBlock;
      continue;
    }
    if (codeBlock) continue;

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      outline.push({ id, level, text });
    }
  }
  return outline;
}

/**
 * Render standard Jekyll relative path asset paths into safe mock asset URLs
 */
export function resolveAssetPath(url: string, activeBranch: string, repoOwner: string, repoName: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  
  // Repo relative asset paths: e.g., "/assets/images/pic.png" or "assets/images/pic.png"
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  
  // Use jsDelivr CDN or direct raw contents to preview the image directly from the GitHub repo
  if (repoOwner && repoName) {
    return `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${activeBranch}/${cleanPath}`;
  }
  
  // Fallback to local placeholders
  return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600";
}

/**
 * Sanitizes and parses markdown text to HTML
 */
export function renderMarkdown(
  md: string,
  repoOwner: string = "",
  repoName: string = "",
  branch: string = "main"
): string {
  if (!md) return "<p class='text-zinc-400 italic font-mono'>Content is blank...</p>";

  let html = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
  // 1. Blocks: Code blocks (```language ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    return `<pre class="bg-zinc-900 border border-zinc-700/50 text-emerald-400 font-mono text-sm p-4 rounded-lg my-4 overflow-x-auto"><span class="block text-xs font-elite text-zinc-500 uppercase tracking-wider mb-2 border-b border-zinc-800 pb-1">${lang || "plain"}</span><code>${code}</code></pre>`;
  });

  // 1.5. Liquid Tags warning markup e.g. {% post_url ... %} or {% include ... %}
  html = html.replace(/({%.*?%})/g, '<span class="px-2 py-0.5 my-1 text-xs bg-amber-500/10 border border-amber-600/30 text-amber-500 font-mono inline-block rounded" title="Jekyll Liquid statement ($1) - Cannot render locally.">$1</span>');
  html = html.replace(/({{.*?}})/g, '<span class="px-2 py-0.5 my-1 text-xs bg-indigo-500/10 border border-indigo-600/30 text-indigo-400 font-mono inline-block rounded" title="Liquid Variable ($1)">$1</span>');

  // Admonitions / Alert blocks: e.g. > [!NOTE] followed by multi lines
  html = html.replace(/^&gt;\s+\[!NOTE\]\s*([\s\S]*?)(?=(?:\n\n|\n&gt;\s*\[|^\s*$))/gim, (_, block) => {
    return `<div class="p-4 my-4 bg-zinc-800/40 border-l-4 border-crimson text-zinc-200 rounded-r-lg"><strong class="font-elite text-xs uppercase tracking-wider text-crimson block mb-1">■ NOTE:</strong>${block}</div>`;
  });
  html = html.replace(/^&gt;\s+\[!WARNING\]\s*([\s\S]*?)(?=(?:\n\n|\n&gt;\s*\[|^\s*$))/gim, (_, block) => {
    return `<div class="p-4 my-4 bg-amber-500/10 border-l-4 border-amber-500 text-amber-200 rounded-r-lg"><strong class="font-elite text-xs uppercase tracking-wider text-amber-500 block mb-1">▲ WARNING:</strong>${block}</div>`;
  });
  html = html.replace(/^&gt;\s+\[!DANGER\]\s*([\s\S]*?)(?=(?:\n\n|\n&gt;\s*\[|^\s*$))/gim, (_, block) => {
    return `<div class="p-4 my-4 bg-red-500/10 border-l-4 border-red-500 text-red-200 rounded-r-lg"><strong class="font-elite text-xs uppercase tracking-wider text-red-500 block mb-1">☠ DANGER:</strong>${block}</div>`;
  });

  // 2. Base Blockquotes
  html = html.replace(/^&gt;\s+(.*)$/gm, '<blockquote class="border-l-4 border-zinc-600 pl-4 py-1 italic my-3 text-zinc-300">$1</blockquote>');

  // 3. Headings Matching
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-base font-semibold text-zinc-200 font-sans my-2">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-lg font-semibold text-zinc-100 font-sans my-2">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-xl font-bold text-zinc-100 font-sans my-3">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-2xl font-bold font-sans text-white border-b border-zinc-800 pb-1 mt-6 mb-3">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-3xl font-bold font-sans text-white mt-8 mb-4 border-b border-zinc-800 pb-2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-4xl font-black font-elite tracking-tight text-white mt-10 mb-6 border-b-2 border-crimson pb-2">$1</h1>');

  // 4. Horizontal Rule
  html = html.replace(/^(---\s*)$/gm, '<hr class="border-t border-dashed border-zinc-800 my-6" />');

  // 5. Lists (Checklists first, then Unordered list, then Ordered list)
  html = html.replace(/^[\*\+-]\s+\[x\]\s+(.+)$/gm, '<li class="flex items-center gap-2 text-zinc-200"><input type="checkbox" checked readonly class="accent-crimson rounded text-crimson mb-0.5" /> <span class="line-through text-zinc-500">$1</span></li>');
  html = html.replace(/^[\*\+-]\s+\[\s\]\s+(.+)$/gm, '<li class="flex items-center gap-2 text-zinc-200"><input type="checkbox" disabled class="rounded" /> <span>$1</span></li>');
  html = html.replace(/^[\*\+-]\s+(.+)$/gm, '<li class="list-disc ml-6 my-1 text-zinc-200">$1</li>');
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="list-decimal ml-6 my-1 text-zinc-200">$1</li>');

  // 6. Tables Matching
  html = html.replace(/\|(.+)\|/g, (_, row) => {
    const cols = row.split("|").map((c: string) => c.trim());
    const isHead = row.includes("---");
    if (isHead) return ""; // Skip delimiter rows
    const colHTML = cols.map((col: string) => `<td class="border border-zinc-800 px-4 py-2 font-mono text-zinc-300">${col}</td>`).join("");
    return `<tr class="hover:bg-zinc-800/20">${colHTML}</tr>`;
  });

  // 7. Inline Formatting: Images
  // e.g. ! [alt] (url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
    const resolvedUrl = resolveAssetPath(url, branch, repoOwner, repoName);
    return `<figure class="my-6 border border-zinc-800 p-2 rounded-lg bg-zinc-900/30 text-center">
      <img src="${resolvedUrl}" alt="${alt}" class="mx-auto rounded-md max-h-96 object-contain shadow-md" onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600'; this.title='Image URL not found yet';" />
      ${alt ? `<figcaption class="text-xs font-elite italic text-zinc-500 mt-2">📖 Fig: ${alt}</figcaption>` : ""}
    </figure>`;
  });

  // Inline Formatting: Link
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-red-400 font-elite border-b border-dashed border-red-400/50 hover:text-crimson transition-colors">$1</a>');

  // Inline Formatting: Strong/Italic/Inline Code
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/`(.*?)`/g, '<code class="bg-zinc-800 text-red-300 font-mono text-xs px-1.5 py-0.5 rounded border border-zinc-700">$1</code>');

  return html;
}
