/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sliders, Sparkles, Key, Info, HelpCircle } from "lucide-react";

interface AISettingsProps {
  settings: {
    enabled: boolean;
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    brandVoicePrompt: string;
  };
  onUpdate: (fields: Partial<AISettingsProps["settings"]>) => void;
  openaiKey: string;
  onUpdateOpenaiKey: (key: string) => void;
}

export default function AISettings({
  settings,
  onUpdate,
  openaiKey,
  onUpdateOpenaiKey,
}: AISettingsProps) {
  return (
    <div className="space-y-6">
      <div className="border border-zinc-800 p-5 rounded-lg bg-zinc-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-crimson/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-crimson animate-pulse" />
            <h3 className="font-elite text-lg text-white">AI Engine Orchestrator</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => onUpdate({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-crimson"></div>
          </label>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          Enable server-side Gemini assist tools to automate post title layouts, fix YAML issues,
          validate SEO snippets, write tags, and write in custom author voice profiles safely.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs rounded">
          <Info className="w-3.5 h-3.5 text-crimson" />
          <span>No keys needed. Gemini API is pre-injected securely on the server context.</span>
        </div>
      </div>

      {settings.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Controls */}
          <div className="border border-zinc-800 p-5 rounded-lg bg-zinc-950/40 space-y-4">
            <div className="flex items-center gap-2 text-zinc-300 font-elite mb-2 border-b border-zinc-800 pb-2">
              <Sliders className="w-4 h-4 text-crimson" />
              <span>Hyperparameters</span>
            </div>

            <div>
              <label className="block text-xs font-elite text-zinc-400 uppercase tracking-widest mb-1">
                Active Provider Model
              </label>
              <select
                value={settings.model}
                onChange={(e) => onUpdate({ model: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm p-2 rounded focus:border-crimson outline-none font-mono"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Fost, standard text tasks)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Heavy reasoning & translations)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-elite text-zinc-400 uppercase tracking-widest mb-1">
                  Temperature ({settings.temperature})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) => onUpdate({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-crimson bg-zinc-900 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-elite text-zinc-400 uppercase tracking-widest mb-1">
                  Max Output Tokens
                </label>
                <input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => onUpdate({ maxTokens: parseInt(e.target.value) || 1000 })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm p-1.5 rounded focus:border-crimson outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-elite text-zinc-400 uppercase tracking-widest mb-1">
                Prompt Guard System Prompt
              </label>
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs p-2 rounded focus:border-crimson outline-none font-mono leading-relaxed"
                placeholder="Initial directives for the modeling system..."
              />
            </div>
          </div>

          {/* Tone & Branding Profiles */}
          <div className="border border-zinc-800 p-5 rounded-lg bg-zinc-950/40 space-y-4">
            <div className="flex items-center gap-2 text-zinc-300 font-elite mb-2 border-b border-zinc-800 pb-2">
              <Sparkles className="w-4 h-4 text-crimson" />
              <span>Brand Voice Blueprint</span>
            </div>

            <div>
              <label className="block text-xs font-elite text-zinc-400 uppercase tracking-widest mb-1">
                Active Brand Voice Target
              </label>
              <textarea
                value={settings.brandVoicePrompt}
                onChange={(e) => onUpdate({ brandVoicePrompt: e.target.value })}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs p-2.5 rounded focus:border-crimson outline-none font-mono leading-relaxed"
                placeholder="Describe your writing rules, e.g., 'Writing style must mimic an old 19th-century typewriter chronicles, witty, concise, using short paragraphs. Avoid AI buzzwords.'"
              />
            </div>

            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded text-xs text-zinc-400 leading-relaxed font-sans">
              <span className="font-elite text-crimson block mb-1">■ WRITING RULE PROFILE:</span>
              This style will be automatically appended to all text revisions, blog continuation suggestions,
              and outline formatting prompts to maintain consistency.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
