"use client";

import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { ConceptBadgeList } from "./ConceptBadge";
import type { AnalysisResponse } from "@/lib/ai/analysis-prompt";

interface InsightsPanelProps {
  code: string;
  savedInsights?: AnalysisResponse | null;
  savedCodeHash?: string | null;
  isOwner?: boolean; // Whether the current user owns this pattern
}

// Simple hash function for comparing code changes
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export function InsightsPanel({
  code,
  savedInsights,
  savedCodeHash,
  isOwner = true,
}: InsightsPanelProps) {
  const [insights, setInsights] = useState<AnalysisResponse | null>(savedInsights || null);
  const [currentCodeHash, setCurrentCodeHash] = useState<string>("");

  // Calculate current code hash
  useEffect(() => {
    const hash = hashCode(code.trim());
    setCurrentCodeHash(hash);
  }, [code]);

  // Check if insights are stale (code changed since generation)
  const isStale = savedCodeHash ? currentCodeHash !== savedCodeHash : false;

  // Update insights when savedInsights prop changes
  useEffect(() => {
    if (savedInsights) {
      setInsights(savedInsights);
    }
  }, [savedInsights]);

  // Empty state - no code
  if (!code.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Lightbulb className="w-10 h-10 text-neutral-600 mb-3" />
        <h3 className="text-sm font-medium text-neutral-400 mb-1">No Code Yet</h3>
        <p className="text-xs text-neutral-500">
          Write some Strudel code to see insights about what you&apos;re creating.
        </p>
      </div>
    );
  }

  // No insights yet
  if (!insights) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Lightbulb className="w-10 h-10 text-neutral-600 mb-3" />
        {isOwner ? (
          <>
            <h3 className="text-sm font-medium text-neutral-400 mb-1">
              No Insights Yet
            </h3>
            <p className="text-xs text-neutral-500">
              Save your pattern to generate insights.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-sm font-medium text-neutral-400 mb-1">
              No Insights Available
            </h3>
            <p className="text-xs text-neutral-500">
              Insights will appear once the author saves this pattern.
            </p>
          </>
        )}
      </div>
    );
  }

  // Insights display
  return (
    <div className="flex flex-col h-full">
      {/* Stale indicator - only show for owners */}
      {isStale && isOwner && (
        <div className="flex-shrink-0 px-4 py-2 bg-amber-950/30 border-b border-amber-800/30">
          <span className="text-xs text-amber-400">
            Code has changed — save to update insights
          </span>
        </div>
      )}

      {/* Insights content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Concepts */}
        {insights.concepts.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
              Concepts in Your Pattern
            </h3>
            <ConceptBadgeList concepts={insights.concepts} size="md" />
          </section>
        )}

        {/* Explanation */}
        <section>
          <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            What You Made
          </h3>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {insights.explanation}
          </p>
        </section>

        {/* Suggestions */}
        {insights.suggestions.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
              Try This
            </h3>
            <ul className="space-y-2">
              {insights.suggestions.map((suggestion, i) => (
                <li
                  key={i}
                  className="text-sm text-neutral-400 pl-4 border-l-2 border-brand-600/50"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
