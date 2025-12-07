"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FunctionCard } from "./FunctionCard";
import type { Category } from "@/lib/strudel/strudel-reference";

interface CategorySectionProps {
  category: Category;
  onPlay: (code: string) => void;
  onStop: () => void;
  playingCode: string | null;
  searchQuery?: string;
  defaultExpanded?: boolean;
}

export function CategorySection({
  category,
  onPlay,
  onStop,
  playingCode,
  searchQuery = "",
  defaultExpanded = false,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Filter functions by search query
  const filteredFunctions = searchQuery
    ? category.functions.filter(
        (fn) =>
          fn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fn.aliases?.some((alias) =>
            alias.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : category.functions;

  // Don't render if no matching functions
  if (searchQuery && filteredFunctions.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-neutral-border last:border-b-0">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-neutral-50 transition-colors",
          isExpanded && "bg-neutral-50"
        )}
      >
        <span className="text-subtext-color">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        <span className="font-medium text-default-font flex-1">
          {category.name}
        </span>
        <span className="text-xs text-subtext-color bg-neutral-100 px-2 py-0.5 rounded-full">
          {filteredFunctions.length}
        </span>
      </button>

      {/* Category Description */}
      {isExpanded && category.description && (
        <p className="px-4 pb-2 text-sm text-subtext-color pl-10">
          {category.description}
        </p>
      )}

      {/* Functions List */}
      {isExpanded && (
        <div className="pl-6">
          {filteredFunctions.map((fn) => (
            <FunctionCard
              key={fn.name}
              fn={fn}
              onPlay={onPlay}
              onStop={onStop}
              playingCode={playingCode}
              defaultExpanded={searchQuery.length > 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
