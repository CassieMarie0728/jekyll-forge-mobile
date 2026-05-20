/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, ArrowRight, Clipboard, RefreshCw, Send, CheckCircle } from "lucide-react";

interface AIAssistantProps {
  currentPostMarkdown: string;
  currentPostTitle: string;
  onModifyContent: (newContent: string) => void;
  onModifyFrontMatter: (key: string, value: any) => void;
  brandVoicePrompt: string;
}

const PRESET_TEMPLATES = [
  { id: "title", label: "Generate Catchy Title", prompt: "Suggest 5 SEO-friendly, gorgeous typewriter post titles based on this article. Keep them typewriter stylized." },
  { id: "outline", label: "Draft Article Outline", prompt: "Generate a detailed heading structure using H2 and H3 elements for a blog post based on these key items." },
  { id: "seo", label: "Write Meta Description", prompt: "Analyze this content and write a concise, human-sounding Jekyll meta-description under 160 characters. Return ONLY the description, no quotes." },
  { id: "excerpt", label: "Generate Short Excerpt", prompt: "Produce a 50-word high-quality preview excerpt to show in lists for the home page." },
  { id: "tags", label: "Recommend Jekyll Tags", prompt: "Generate a comma-separated list of 5 relevant lowercase Jekyll tags for this content. Deliver them as tag1, tag2..." },
  { id: "alt-text", label: "Write Alt Text for Images", prompt: "Look at the context of this writing and explain what a featured illustrative image caption should look like. Provide elegant alt text." },
  { id: "continue", label: "Continue Story Thread", prompt: "Write the next logical paragraph for this chapter in an elegant classic narrative tone." },
];

export default function AIAssistant({
  currentPostMarkdown,
  currentPostTitle,
  onModifyContent,
  onModifyFrontMatter,
  brandVoicePrompt,
}: AIAssistantProps) {
  const [selectedTask, setSelectedTask] = useState("title");
  const [customUserPrompt, setCustomUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState("");
  const [errorWord, setErrorWord] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Simple token budget simulation
  const [usageDashboard, setUsageDashboard] = useState({
    requestsCount: 0,
    estimatedTokens: 0,
    savedCost: 0,
  });

  const handleLaunchAI = async (taskOverride?: string) => {
    setLoading(true);
    setGeneratedResult("");
    setErrorWord("");
    setSuccessMsg("");

    const task = taskOverride || selectedTask;
    let basePrompt = PRESET_TEMPLATES.find((p) => p.id === task)?.prompt || "";
    
    if (task === "custom") {
      basePrompt = customUserPrompt;
    }

    const fullPrompt = `
Task Directive: ${basePrompt}
ARTICLE TITLE: ${currentPostTitle || "Untitled Chapter"}
BRAND WRITING CODES: ${brandVoicePrompt || "Standard human editorial voice, typewriter styled."}

CURRENT CONTENT:
${currentPostMarkdown || "The editor canvas is currently empty."}
`;

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          systemInstruction: "You are Jekyll Forge AI, an expert static blog editor. You follow the user's specific guidelines. You return output as clean text, preserving Markdown formatting without conversational fluff.",
        }),
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setGeneratedResult(data.text);
        
        // Update stats
        const approxTokens = Math.ceil((fullPrompt.length + data.text.length) / 3.8);
        setUsageDashboard((prev) => ({
          requestsCount: prev.requestsCount + 1,
          estimatedTokens: prev.estimatedTokens + approxTokens,
          savedCost: prev.savedCost + (approxTokens * 0.000002), // mock valuation
        }));
      } else {
        setErrorWord(data.error || "The AI model encountered an unexpected problem.");
      }
    } catch (e: any) {
      setErrorWord(e.message || "Failed to contact proxy server. Code error.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToEditor = (action: "replace" | "append" | "fm-title" | "fm-desc") => {
    if (!generatedResult) return;

    if (action === "replace") {
      onModifyContent(generatedResult);
      setSuccessMsg("Text has replaced the entire canvas!");
    } else if (action === "append") {
      onModifyContent(currentPostMarkdown + "\n\n" + generatedResult);
      setSuccessMsg("Text appended to the bottom!");
    } else if (action === "fm-title") {
      const cleanTitle = generatedResult.replace(/^['"]|['"]$/g, "").trim();
      onModifyFrontMatter("title", cleanTitle);
      setSuccessMsg("Front matter title updated successfully!");
    } else if (action === "fm-desc") {
      const cleanDesc = generatedResult.replace(/^['"]|['"]$/g, "").trim();
      onModifyFrontMatter("description", cleanDesc);
      setSuccessMsg("Front matter description updated successfully!");
    }
    
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Visual Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <Sparkles className="w-4.5 h-4.5 text-crimson" />
        <h4 className="font-elite text-zinc-200">Gemini Writing Assistant</h4>
      </div>

      {/* Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-elite text-zinc-400 uppercase tracking-wider">
          Choose Predefined Task Code
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedTask(tpl.id);
                handleLaunchAI(tpl.id);
              }}
              disabled={loading}
              className={`text-left text-xs font-sans px-2.5 py-2 border rounded transition-all flex items-center justify-between ${
                selectedTask === tpl.id
                  ? "border-crimson bg-crimson/5 text-red-100"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <span>{tpl.label}</span>
              <ArrowRight className="w-3 h-3 text-crimson opacity-60" />
            </button>
          ))}
          <button
            onClick={() => setSelectedTask("custom")}
            className={`text-left text-xs font-sans px-2.5 py-1.5 border rounded transition-all flex items-center justify-between ${
              selectedTask === "custom"
                ? "border-crimson bg-crimson/5 text-red-100"
                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            }`}
          >
            <span>Custom Prompt...</span>
            <Sparkles className="w-3 h-3 text-crimson" />
          </button>
        </div>
      </div>

      {/* Custom Prompt Box */}
      {selectedTask === "custom" && (
        <div className="space-y-1.5">
          <textarea
            value={customUserPrompt}
            onChange={(e) => setCustomUserPrompt(e.target.value)}
            disabled={loading}
            rows={3}
            placeholder="Type your instruction: e.g. 'Format this raw data table into complete Jekyll responsive table syntax...'"
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs p-2.5 rounded focus:border-crimson outline-none font-mono placeholder:text-zinc-600"
          />
          <button
            onClick={() => handleLaunchAI("custom")}
            disabled={loading || !customUserPrompt.trim()}
            className="w-full bg-crimson hover:bg-crimson-hover disabled:bg-zinc-800 text-white font-elite text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Execute Custom Directive</span>
          </button>
        </div>
      )}

      {/* Progress Loading */}
      {loading && (
        <div className="p-4 border border-zinc-800 bg-zinc-900/30 rounded flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 text-crimson animate-spin" />
          <span className="font-elite text-xs text-zinc-400">Consulting Typewriter Models...</span>
          <p className="text-[10px] text-zinc-500 italic max-w-xs text-center leading-normal">
            "Injecting ink, weaving formatting blocks, compiling prose threads."
          </p>
        </div>
      )}

      {/* Error Alert */}
      {errorWord && (
        <div className="p-3 border border-red-900/30 bg-red-950/20 text-red-400 text-xs rounded font-sans leading-relaxed">
          <strong className="font-elite text-crimson text-xs block mb-1">■ RETRO AI FAIL:</strong>
          {errorWord}
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="p-2 border border-emerald-900/40 bg-emerald-950/20 text-emerald-400 text-xs rounded font-sans flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Output Console Box */}
      {generatedResult && (
        <div className="border border-zinc-800 bg-zinc-950 rounded overflow-hidden space-y-2">
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800">
            <span className="font-elite text-xs text-zinc-400">Typewriter Output Log</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedResult);
                setSuccessMsg("Copied to keyboard buffer!");
                setTimeout(() => setSuccessMsg(""), 3000);
              }}
              className="text-zinc-500 hover:text-red-300 text-xs font-mono flex items-center gap-1"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
          <div className="p-3 max-h-56 overflow-y-auto text-xs text-zinc-200 font-mono leading-relaxed whitespace-pre-wrap">
            {generatedResult}
          </div>
          <div className="p-2.5 bg-zinc-900/40 border-t border-zinc-800 flex flex-wrap gap-1.5">
            <button
              onClick={() => handleApplyToEditor("replace")}
              className="px-2 py-1 bg-crimson/15 border border-crimson/30 hover:bg-crimson/30 text-red-100 font-elite text-[10px] rounded transition-colors"
            >
              Overwrite Entire Document
            </button>
            <button
              onClick={() => handleApplyToEditor("append")}
              className="px-2 py-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 font-elite text-[10px] rounded transition-colors"
            >
              Append to End
            </button>
            <button
              onClick={() => handleApplyToEditor("fm-title")}
              className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-elite text-[10px] rounded transition-colors"
            >
              Set as Title Field
            </button>
            <button
              onClick={() => handleApplyToEditor("fm-desc")}
              className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-elite text-[10px] rounded transition-colors"
            >
              Set as Description
            </button>
          </div>
        </div>
      )}

      {/* AI Budget Metrics */}
      <div className="p-3 border border-zinc-800 bg-zinc-900/10 rounded">
        <span className="text-[10px] font-elite uppercase tracking-wider text-zinc-500 block mb-1">
          ■ Typewriter Budget Log
        </span>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px] text-zinc-400">
          <div className="border border-zinc-800 py-1.5 rounded">
            <div className="text-zinc-500 uppercase tracking-widest text-[8px] mb-0.5">Sessions</div>
            <div className="font-bold text-zinc-300">{usageDashboard.requestsCount}</div>
          </div>
          <div className="border border-zinc-800 py-1.5 rounded">
            <div className="text-zinc-500 uppercase tracking-widest text-[8px] mb-0.5">EST. TOKENS</div>
            <div className="font-bold text-zinc-300">{usageDashboard.estimatedTokens}</div>
          </div>
          <div className="border border-zinc-800 py-1.5 rounded">
            <div className="text-zinc-500 uppercase tracking-widest text-[8px] mb-0.5">Equivalent Cost</div>
            <div className="font-bold text-emerald-400">${usageDashboard.savedCost.toFixed(5)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
