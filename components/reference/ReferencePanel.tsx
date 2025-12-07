"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategorySection } from "./CategorySection";
import { FunctionCard } from "./FunctionCard";
import { STRUDEL_REFERENCE } from "@/lib/strudel/strudel-reference";
import type { FunctionDef } from "@/lib/strudel/strudel-reference";

interface ReferencePanelProps {
  onPlay: (code: string) => void;
  onStop: () => void;
  playingCode: string | null;
}

export function ReferencePanel({
  onPlay,
  onStop,
  playingCode,
}: ReferencePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter functions across all categories when searching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: FunctionDef[] = [];

    for (const category of STRUDEL_REFERENCE) {
      for (const fn of category.functions) {
        if (
          fn.name.toLowerCase().includes(query) ||
          fn.description.toLowerCase().includes(query) ||
          fn.aliases?.some((alias) => alias.toLowerCase().includes(query))
        ) {
          results.push(fn);
        }
      }
    }

    return results;
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="flex-shrink-0 p-3 border-b border-neutral-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext-color" />
          <Input
            type="text"
            placeholder="Search functions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 bg-neutral-50 border-neutral-border"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {searchResults ? (
          // Search results - flat list
          <div>
            <div className="px-4 py-2 text-xs text-subtext-color border-b border-neutral-border">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
            </div>
            {searchResults.length === 0 ? (
              <div className="p-8 text-center text-subtext-color">
                <p>No functions found matching your search.</p>
                <p className="text-sm mt-2">
                  Try searching for function names like &quot;fast&quot;, &quot;lpf&quot;, or &quot;stack&quot;.
                </p>
              </div>
            ) : (
              <div>
                {searchResults.map((fn) => (
                  <FunctionCard
                    key={fn.name}
                    fn={fn}
                    onPlay={onPlay}
                    onStop={onStop}
                    playingCode={playingCode}
                    defaultExpanded={true}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Category view
          <div>
            {STRUDEL_REFERENCE.map((category, index) => (
              <CategorySection
                key={category.name}
                category={category}
                onPlay={onPlay}
                onStop={onStop}
                playingCode={playingCode}
                defaultExpanded={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
