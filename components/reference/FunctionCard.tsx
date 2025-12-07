"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeSuggestion } from "@/components/chat/CodeSuggestion";
import type { FunctionDef } from "@/lib/strudel/strudel-reference";

interface FunctionCardProps {
  fn: FunctionDef;
  onPlay: (code: string) => void;
  onStop: () => void;
  playingCode: string | null;
  defaultExpanded?: boolean;
}

export function FunctionCard({
  fn,
  onPlay,
  onStop,
  playingCode,
  defaultExpanded = false,
}: FunctionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-neutral-border last:border-b-0">
      {/* Header - clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-start gap-2 p-3 text-left hover:bg-neutral-50 transition-colors",
          isExpanded && "bg-neutral-50"
        )}
      >
        <span className="mt-0.5 text-subtext-color">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-semibold text-brand-600">
              {fn.name}
            </span>
            {fn.signature && (
              <span className="text-xs text-subtext-color font-mono">
                {fn.signature}
              </span>
            )}
          </div>
          {!isExpanded && (
            <p className="text-sm text-subtext-color mt-0.5 line-clamp-1">
              {fn.description}
            </p>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 pl-9">
          {/* Description */}
          <p className="text-sm text-default-font mb-3">{fn.description}</p>

          {/* Aliases */}
          {fn.aliases && fn.aliases.length > 0 && (
            <div className="mb-3">
              <span className="text-xs text-subtext-color">Also known as: </span>
              <span className="text-xs font-mono text-default-font">
                {fn.aliases.join(", ")}
              </span>
            </div>
          )}

          {/* Examples */}
          {fn.examples.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-subtext-color uppercase tracking-wide">
                Examples
              </span>
              {fn.examples.map((example, index) => (
                <div key={index}>
                  {example.description && (
                    <p className="text-xs text-subtext-color mb-1">
                      {example.description}
                    </p>
                  )}
                  <CodeSuggestion
                    code={example.code}
                    language="strudel"
                    onPlay={onPlay}
                    onStop={onStop}
                    isPlaying={playingCode === example.code}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Related functions */}
          {fn.related && fn.related.length > 0 && (
            <div className="mt-3 pt-3 border-t border-neutral-border">
              <span className="text-xs text-subtext-color">Related: </span>
              <span className="text-xs font-mono text-brand-600">
                {fn.related.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
