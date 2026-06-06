/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GitCompare, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, RefreshCw, Layers } from "lucide-react";
import { Snapshot } from "../types";

interface MergeHubProps {
  currentPostMarkdown: string;
  snapshots: Snapshot[];
  onApplyMerge: (mergedMarkdown: string) => void;
  themeMode: "warm" | "colophon" | "slate" | "charcoal" | "cyber" | string;
}

interface DiffLine {
  id: string;
  type: "addition" | "deletion" | "neutral" | "conflict";
  value: string;
  lineNumberLeft?: number;
  lineNumberRight?: number;
  selectedSide?: "left" | "right" | "both" | "none";
}

export default function MergeHub({
  currentPostMarkdown,
  snapshots,
  onApplyMerge,
  themeMode,
}: MergeHubProps) {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>("");
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isFullyMerged, setIsFullyMerged] = useState<boolean>(false);

  // Computed snapshot selection list
  const activeSnap = snapshots.find(s => s.id === selectedSnapshotId);

  // Initialize with the first available snapshot if any
  useEffect(() => {
    if (snapshots.length > 0 && !selectedSnapshotId) {
      setSelectedSnapshotId(snapshots[0].id);
    }
  }, [snapshots, selectedSnapshotId]);

  // Compute line-by-line diff when selected snapshot changes or live editor content changes
  useEffect(() => {
    if (!activeSnap) {
      setDiffLines([]);
      return;
    }

    const currentLines = currentPostMarkdown.split("\n");
    const snapLines = activeSnap.markdown.split("\n");

    const computedDiffs: DiffLine[] = [];
    let i = 0;
    let j = 0;

    // A simplified LCS-based line diff algorithm for side-by-side display
    while (i < currentLines.length || j < snapLines.length) {
      if (i < currentLines.length && j < snapLines.length) {
        const lineCur = currentLines[i];
        const lineSnap = snapLines[j];

        if (lineCur === lineSnap) {
          computedDiffs.push({
            id: `neutral-${i}-${j}`,
            type: "neutral",
            value: lineCur,
            lineNumberLeft: j + 1,
            lineNumberRight: i + 1,
            selectedSide: "both",
          });
          i++;
          j++;
        } else {
          // Check ahead for alignment to see if current line was added or snapshot line was deleted
          const nextIndexCur = currentLines.indexOf(lineSnap, i);
          const nextIndexSnap = snapLines.indexOf(lineCur, j);

          if (nextIndexCur !== -1 && (nextIndexSnap === -1 || nextIndexCur < nextIndexSnap)) {
            // Lines in current not in snapshot = Additions on the right side
            while (i < nextIndexCur) {
              computedDiffs.push({
                id: `addition-${i}-${Date.now()}`,
                type: "addition",
                value: currentLines[i],
                lineNumberRight: i + 1,
                selectedSide: "right", // Default to current draft
              });
              i++;
            }
          } else if (nextIndexSnap !== -1) {
            // Lines in snapshot not in current = Deletions on the left side
            while (j < nextIndexSnap) {
              computedDiffs.push({
                id: `deletion-${j}-${Date.now()}`,
                type: "deletion",
                value: snapLines[j],
                lineNumberLeft: j + 1,
                selectedSide: "left", // Suggest keeping old version if reverting
              });
              j++;
            }
          } else {
            // Actual conflict/mismatch on the same lines
            computedDiffs.push({
              id: `conflict-${i}-${j}-${Date.now()}`,
              type: "conflict",
              value: `${lineSnap} ⟷ ${lineCur}`,
              lineNumberLeft: j + 1,
              lineNumberRight: i + 1,
              selectedSide: "none", // Wait for human cherry-picking
            });
            // Custom placeholder strings
            (computedDiffs[computedDiffs.length - 1] as any).leftVal = lineSnap;
            (computedDiffs[computedDiffs.length - 1] as any).rightVal = lineCur;

            i++;
            j++;
          }
        }
      } else if (i < currentLines.length) {
        // Trailing addition
        computedDiffs.push({
          id: `addition-${i}-${Date.now()}`,
          type: "addition",
          value: currentLines[i],
          lineNumberRight: i + 1,
          selectedSide: "right",
        });
        i++;
      } else {
        // Trailing deletion
        computedDiffs.push({
          id: `deletion-${j}-${Date.now()}`,
          type: "deletion",
          value: snapLines[j],
          lineNumberLeft: j + 1,
          selectedSide: "left",
        });
        j++;
      }
    }

    setDiffLines(computedDiffs);
  }, [currentPostMarkdown, selectedSnapshotId, activeSnap]);

  // Adjust side selection for a specific conflict block line
  const handleSelectLineSide = (id: string, side: "left" | "right" | "both" | "none") => {
    setDiffLines(prev =>
      prev.map(line => {
        if (line.id === id) {
          return { ...line, selectedSide: side };
        }
        return line;
      })
    );
  };

  // Quick action: Take all changes from current draft workspace
  const handleBulkAcceptAllLeft = () => {
    setDiffLines(prev =>
      prev.map(line => {
        if (line.type === "deletion" || line.type === "conflict") {
          return { ...line, selectedSide: "left" };
        }
        if (line.type === "addition") {
          return { ...line, selectedSide: "none" }; // reject local additions
        }
        return line;
      })
    );
    setSuccessMessage("Aligned merge draft with all historical Snapshot lines!");
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleBulkAcceptAllRight = () => {
    setDiffLines(prev =>
      prev.map(line => {
        if (line.type === "addition" || line.type === "conflict") {
          return { ...line, selectedSide: "right" };
        }
        if (line.type === "deletion") {
          return { ...line, selectedSide: "none" }; // reject historical snapshot deletions
        }
        return line;
      })
    );
    setSuccessMessage("Kept all current Live Workstation draft changes!");
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  // Compile final merged text output and update original state
  const handleApplyMergedChangesValue = () => {
    const finalLinesCount: string[] = [];

    diffLines.forEach(line => {
      if (line.type === "neutral") {
        finalLinesCount.push(line.value);
      } else if (line.type === "addition") {
        if (line.selectedSide === "right") {
          finalLinesCount.push(line.value);
        }
      } else if (line.type === "deletion") {
        if (line.selectedSide === "left") {
          finalLinesCount.push(line.value);
        }
      } else if (line.type === "conflict") {
        const leftSide = (line as any).leftVal || "";
        const rightSide = (line as any).rightVal || "";

        if (line.selectedSide === "left") {
          finalLinesCount.push(leftSide);
        } else if (line.selectedSide === "right") {
          finalLinesCount.push(rightSide);
        } else if (line.selectedSide === "both") {
          finalLinesCount.push(leftSide);
          finalLinesCount.push(rightSide);
        }
        // If "none", line is excluded/rejected
      }
    });

    const assembledText = finalLinesCount.join("\n");
    onApplyMerge(assembledText);
    setSuccessMessage("Successfully resolved all discrepancies and synced live canvas!");
    setIsFullyMerged(true);
    setTimeout(() => {
      setSuccessMessage("");
      setIsFullyMerged(false);
    }, 4000);
  };

  return (
    <div className="space-y-4 h-full flex flex-col font-sans select-none">
      {/* Visual Header */}
      <div className={`p-4 border rounded-xl flex items-center justify-between ${
        themeMode === "warm" ? "bg-[#f5efe4] border-amber-955/15" : "bg-zinc-900/40 border-zinc-900"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-crimson/10 rounded-lg border border-crimson/25">
            <GitCompare className="w-4.5 h-4.5 text-crimson" />
          </div>
          <div>
            <h4 className="font-elite text-zinc-200 text-sm font-bold uppercase tracking-wider">
              Visual Conflict & Reconcile Center
            </h4>
            <p className="text-[10.5px] text-zinc-500 mt-0.5">
              Compare local revisions and selectively align lines before publishing to repository targets.
            </p>
          </div>
        </div>

        {snapshots.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-elite uppercase text-zinc-400">Snapshot Target:</label>
            <select
              value={selectedSnapshotId}
              onChange={(e) => setSelectedSnapshotId(e.target.value)}
              className="bg-zinc-950 text-xs font-mono text-crimson border border-zinc-800 p-1 rounded focus:border-crimson outline-none cursor-pointer"
            >
              {snapshots.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label.slice(0, 24)} ({new Date(s.createdAt).toLocaleTimeString([], { hour12: false })})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {snapshots.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-zinc-800 rounded-lg text-zinc-500 space-y-2 leading-relaxed">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h5 className="font-elite font-bold text-xs uppercase tracking-wide">No Snapshots Found</h5>
          <p className="text-[11px] max-w-sm mx-auto">
            Jekyll Forge compiles snapshots only after saving, importing, or editing with Gemini. Modify the canvas to forge an automated recovery marker!
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-3 min-h-0">
          {/* Quick Merge Panel */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleBulkAcceptAllLeft}
                className={`px-2.5 py-1 text-[10px] uppercase font-elite border rounded hover:border-crimson hover:bg-crimson/5 cursor-pointer transition-all ${
                  themeMode === "warm" ? "border-amber-955/20 text-neutral-800 bg-[#fbf9f4]" : "border-zinc-800 text-zinc-300 bg-zinc-950/20"
                }`}
              >
                Accept All Snapshot lines
              </button>
              <button
                onClick={handleBulkAcceptAllRight}
                className={`px-2.5 py-1 text-[10px] uppercase font-elite border rounded hover:border-crimson hover:bg-crimson/5 cursor-pointer transition-all ${
                  themeMode === "warm" ? "border-amber-955/20 text-neutral-800 bg-[#fbf9f4]" : "border-zinc-800 text-zinc-300 bg-zinc-950/20"
                }`}
              >
                Accept All Current draft lines
              </button>
            </div>

            <button
              onClick={handleApplyMergedChangesValue}
              className="bg-emerald-600 hover:bg-emerald-700 font-elite text-zinc-100 px-3.5 py-1 rounded text-[10px] uppercase tracking-wider font-bold transition-colors shadow flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Apply Checked Merge
            </button>
          </div>

          {/* Success Alerts */}
          {successMessage && (
            <div className="p-2.5 border border-emerald-900/40 bg-emerald-950/15 text-emerald-400 text-xs rounded-lg flex items-center gap-2 font-sans">
              <CheckCircle className="w-4 h-4 text-emerald-500 animate-bounce" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Side-by-Side Diff Console Grid */}
          <div className="flex-1 border border-zinc-850 bg-zinc-950 rounded-xl overflow-y-auto leading-normal font-mono text-[10.5px] max-h-[460px] scrollbar-thin">
            {/* Headers row */}
            <div className="grid grid-cols-12 bg-zinc-900 border-b border-zinc-850 p-2 text-[9px] text-zinc-400 font-elite uppercase tracking-wider sticky top-0 z-10">
              <div className="col-span-5 text-left pl-3 flex items-center gap-1">
                <Layers className="w-3 h-3 text-red-500" />
                Snapshot Code Checkpoint (Left)
              </div>
              <div className="col-span-2 text-center text-zinc-500">Selective Choice</div>
              <div className="col-span-5 text-left pl-3 flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-500" />
                Current Draft Editor (Right)
              </div>
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-zinc-900">
              {diffLines.map((line) => {
                const isNeut = line.type === "neutral";
                const isAdd = line.type === "addition";
                const isDel = line.type === "deletion";
                const isConf = line.type === "conflict";

                // Resolve values
                const leftStr = isConf ? (line as any).leftVal : (isDel || isNeut ? line.value : "");
                const rightStr = isConf ? (line as any).rightVal : (isAdd || isNeut ? line.value : "");

                return (
                  <div key={line.id} className={`grid grid-cols-12 min-h-[30px] items-center hover:bg-zinc-900/45 transition-colors ${
                    isAdd ? "bg-emerald-950/10" : isDel ? "bg-red-950/10" : isConf ? "bg-amber-950/10" : ""
                  }`}>
                    {/* Left Pane - Snapshot original line */}
                    <div className={`col-span-5 flex items-start border-r border-zinc-900 h-full p-2 whitespace-pre-wrap truncate leading-normal text-left ${
                      isDel ? "text-red-400/90 font-medium" : isConf ? "text-amber-400 font-medium" : "text-zinc-500"
                    }`}>
                      {line.lineNumberLeft && (
                        <span className="w-6 shrink-0 text-right pr-2 text-[9px] text-zinc-600 select-none">
                          {line.lineNumberLeft}
                        </span>
                      )}
                      <span className="truncate block flex-1" title={leftStr}>
                        {leftStr || <span className="opacity-15 italic">empty line</span>}
                      </span>
                    </div>

                    {/* Middle control switches */}
                    <div className="col-span-2 flex justify-center items-center gap-1.5 p-1 h-full select-none">
                      {isNeut && (
                        <span className="text-[10px] text-zinc-600 font-elite uppercase">Match</span>
                      )}

                      {isAdd && (
                        <button
                          onClick={() => handleSelectLineSide(line.id, line.selectedSide === "right" ? "none" : "right")}
                          className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide font-elite transition-colors cursor-pointer ${
                            line.selectedSide === "right"
                              ? "bg-emerald-600 text-white font-bold"
                              : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                          }`}
                          title="Click to toggle addition into editor"
                        >
                          {line.selectedSide === "right" ? "Accept" : "Ignore"}
                        </button>
                      )}

                      {isDel && (
                        <button
                          onClick={() => handleSelectLineSide(line.id, line.selectedSide === "left" ? "none" : "left")}
                          className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide font-elite transition-colors cursor-pointer ${
                            line.selectedSide === "left"
                              ? "bg-red-600 text-white font-bold"
                              : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                          }`}
                          title="Click to restore deleted line"
                        >
                          {line.selectedSide === "left" ? "Restore" : "Discard"}
                        </button>
                      )}

                      {isConf && (
                        <div className="flex flex-col items-center gap-1 w-full">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSelectLineSide(line.id, "left")}
                              className={`px-1 py-0.5 rounded text-[7.5px] uppercase font-elite transition-colors cursor-pointer ${
                                line.selectedSide === "left"
                                  ? "bg-red-600 text-white font-semibold"
                                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                              }`}
                              title="Keep left side"
                            >
                              Left
                            </button>
                            <button
                              onClick={() => handleSelectLineSide(line.id, "right")}
                              className={`px-1 py-0.5 rounded text-[7.5px] uppercase font-elite transition-colors cursor-pointer ${
                                line.selectedSide === "right"
                                  ? "bg-emerald-600 text-white font-semibold"
                                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                              }`}
                              title="Keep right side"
                            >
                              Right
                            </button>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSelectLineSide(line.id, "both")}
                              className={`px-1 py-0.5 rounded text-[7px] uppercase font-elite transition-colors cursor-pointer ${
                                line.selectedSide === "both"
                                  ? "bg-amber-600 text-white font-semibold"
                                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                              }`}
                              title="Accept BOTH lines"
                            >
                              Both
                            </button>
                            <button
                              onClick={() => handleSelectLineSide(line.id, "none")}
                              className={`px-1 py-0.5 rounded text-[7px] uppercase font-elite transition-colors cursor-pointer ${
                                line.selectedSide === "none"
                                  ? "bg-zinc-700 text-white font-semibold"
                                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                              }`}
                              title="Skip/Reject line completely"
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Pane - Current editor line */}
                    <div className={`col-span-5 flex items-start border-l border-zinc-900 h-full p-2 whitespace-pre-wrap truncate leading-normal text-left ${
                      isAdd ? "text-emerald-400/90 font-medium" : isConf ? "text-cyan-400 font-medium" : "text-zinc-400"
                    }`}>
                      {line.lineNumberRight && (
                        <span className="w-6 shrink-0 text-right pr-2 text-[9px] text-zinc-600 select-none">
                          {line.lineNumberRight}
                        </span>
                      )}
                      <span className="truncate block flex-1" title={rightStr}>
                        {rightStr || <span className="opacity-15 italic">empty line</span>}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
