/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parses Jekyll YAML front matter from a string.
 * Handles strings, numbers, booleans, dates, inline arrays [a, b], and multiline arrays.
 */
export function parseYAML(yamlString: string): Record<string, any> {
  const result: Record<string, any> = {};
  if (!yamlString) return result;

  const lines = yamlString.split(/\r?\n/);
  let currentKey: string | null = null;
  let currentArray: any[] = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Check for array list element (e.g. "  - tag1")
    if (trimmed.startsWith("-") && currentKey) {
      const val = trimmed.substring(1).trim().replace(/^['"]|['"]$/g, "");
      currentArray.push(val);
      result[currentKey] = [...currentArray];
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Reset array state for new key
    currentKey = key;
    currentArray = [];

    // Parse values
    if (value === "") {
      result[key] = "";
      continue;
    }

    // Check for inline lists e.g., "[tag1, tag2]"
    if (value.startsWith("[") && value.endsWith("]")) {
      const items = value
        .substring(1, value.length - 1)
        .split(",")
        .map((i) => i.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
      result[key] = items;
      continue;
    }

    // Strip wrapping quotes
    const quoteMatch = value.match(/^(['"])(.*)\1$/);
    if (quoteMatch) {
      result[key] = quoteMatch[2];
      continue;
    }

    // Boolean
    if (value.toLowerCase() === "true") {
      result[key] = true;
      continue;
    }
    if (value.toLowerCase() === "false") {
      result[key] = false;
      continue;
    }

    // Number
    const num = Number(value);
    if (!isNaN(num) && value !== "") {
      result[key] = num;
      continue;
    }

    result[key] = value;
  }

  return result;
}

/**
 * Convert a key-value record back to a clean yaml front matter string.
 */
export function stringifyYAML(obj: Record<string, any>): string {
  let out = "";
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        out += `${key}: []\n`;
      } else {
        out += `${key}:\n`;
        for (const item of value) {
          out += `  - ${escapeYAMLString(String(item))}\n`;
        }
      }
    } else if (typeof value === "boolean" || typeof value === "number") {
      out += `${key}: ${value}\n`;
    } else {
      const strVal = String(value);
      if (strVal.includes(":") || strVal.includes("#") || strVal.includes("'") || strVal.includes("\"") || strVal.includes("\n")) {
        // Needs double quote escaping
        out += `${key}: "${strVal.replace(/"/g, '\\"')}"\n`;
      } else {
        out += `${key}: ${strVal}\n`;
      }
    }
  }
  return out;
}

function escapeYAMLString(val: string): string {
  if (val.includes(":") || val.includes("#") || val.includes("\"") || val.includes("'")) {
    return `"${val.replace(/"/g, '\\"')}"`;
  }
  return val;
}

/**
 * Extract front matter block and body Markdown from a full file content string
 */
export function parseJekyllPost(content: string): { frontMatter: Record<string, any>; markdown: string } {
  const norm = content.replace(/\r\n/g, "\n").trim();
  if (!norm.startsWith("---")) {
    return { frontMatter: {}, markdown: content };
  }

  const parts = norm.split("\n---");
  if (parts.length < 3) {
    // No closing delimiter
    return { frontMatter: {}, markdown: content };
  }

  // First element is empty before first ---, second is raw front matter
  const fmPart = parts[0] === "" ? parts[1] : parts[0];
  const fm = parseYAML(fmPart);

  // Combine back the rest as markdown content
  const restIndex = parts[0] === "" ? 2 : 1;
  const mdPart = parts.slice(restIndex).join("\n---").trim();

  return { frontMatter: fm, markdown: mdPart };
}

/**
 * Creates full file content matching Jekyll style
 */
export function formatJekyllPost(frontMatter: Record<string, any>, markdown: string): string {
  const yamlBlock = stringifyYAML(frontMatter);
  return `---\n${yamlBlock}---\n\n${markdown.trim()}\n`;
}
