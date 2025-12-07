"use client";

import Link from "next/link";
import {
  getConcept,
  formatConceptName,
  categoryInfo,
  type ConceptCategory,
} from "@/lib/concepts";

interface ConceptBadgeProps {
  conceptId: string;
  showTooltip?: boolean;
  linkToExplore?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const categoryColors: Record<ConceptCategory, string> = {
  rhythm: "bg-orange-900/30 text-orange-300 border-orange-800/50",
  melody: "bg-blue-900/30 text-blue-300 border-blue-800/50",
  harmony: "bg-purple-900/30 text-purple-300 border-purple-800/50",
  structure: "bg-green-900/30 text-green-300 border-green-800/50",
  texture: "bg-pink-900/30 text-pink-300 border-pink-800/50",
  code: "bg-cyan-900/30 text-cyan-300 border-cyan-800/50",
};

export function ConceptBadge({
  conceptId,
  showTooltip = true,
  linkToExplore = true,
  size = "sm",
  className = "",
}: ConceptBadgeProps) {
  const concept = getConcept(conceptId);

  if (!concept) {
    // Fallback for unknown concepts
    return (
      <span
        className={`
          inline-flex items-center gap-1 rounded-full border px-2 py-0.5
          bg-neutral-900/30 text-neutral-400 border-neutral-800/50
          ${size === "sm" ? "text-xs" : "text-sm"}
          ${className}
        `}
      >
        {formatConceptName(conceptId)}
      </span>
    );
  }

  const colorClass = categoryColors[concept.category];
  const icon = categoryInfo[concept.category].icon;

  const badge = (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border px-2 py-0.5
        transition-colors cursor-default
        ${colorClass}
        ${size === "sm" ? "text-xs" : "text-sm"}
        ${linkToExplore ? "hover:opacity-80 cursor-pointer" : ""}
        ${className}
      `}
      title={showTooltip ? concept.description : undefined}
    >
      <span className="opacity-70">{icon}</span>
      <span>{concept.name}</span>
    </span>
  );

  if (linkToExplore) {
    return <Link href={`/explore/${conceptId}`}>{badge}</Link>;
  }

  return badge;
}

interface ConceptBadgeListProps {
  concepts: string[];
  showTooltip?: boolean;
  linkToExplore?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ConceptBadgeList({
  concepts,
  showTooltip = true,
  linkToExplore = true,
  size = "sm",
  className = "",
}: ConceptBadgeListProps) {
  if (concepts.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {concepts.map((conceptId) => (
        <ConceptBadge
          key={conceptId}
          conceptId={conceptId}
          showTooltip={showTooltip}
          linkToExplore={linkToExplore}
          size={size}
        />
      ))}
    </div>
  );
}
