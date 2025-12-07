"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ConceptBadge } from "./ConceptBadge";
import { categoryInfo, type ConceptCategory, getConceptCategory } from "@/lib/concepts";
import { Loader2, Compass } from "lucide-react";

interface Discovery {
  id: string;
  concept: string;
  firstSeenAt: string;
  patternId: string | null;
}

interface DiscoveryLogProps {
  className?: string;
}

export function DiscoveryLog({ className = "" }: DiscoveryLogProps) {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDiscoveries() {
      try {
        const response = await fetch("/api/discoveries");
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated - not an error
            setDiscoveries([]);
            return;
          }
          throw new Error("Failed to fetch discoveries");
        }
        const data = await response.json();
        setDiscoveries(data.discoveries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    fetchDiscoveries();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-subtext-color" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-400 p-4 ${className}`}>{error}</div>
    );
  }

  if (discoveries.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Compass className="h-4 w-4 text-subtext-color" />
          <h3 className="text-sm font-medium text-default-font">
            Your Explorations
          </h3>
        </div>
        <p className="text-xs text-subtext-color">
          Concepts you&apos;ve encountered will appear here. Click &quot;Explain This&quot;
          in the editor to discover what&apos;s in your patterns!
        </p>
      </div>
    );
  }

  // Group discoveries by category
  const byCategory: Record<ConceptCategory, Discovery[]> = {
    rhythm: [],
    melody: [],
    harmony: [],
    structure: [],
    texture: [],
    code: [],
  };

  for (const discovery of discoveries) {
    const category = getConceptCategory(discovery.concept);
    if (category) {
      byCategory[category].push(discovery);
    }
  }

  const nonEmptyCategories = (Object.keys(byCategory) as ConceptCategory[]).filter(
    (cat) => byCategory[cat].length > 0
  );

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Compass className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-medium text-default-font">
          Your Explorations
        </h3>
        <span className="text-xs text-subtext-color">
          ({discoveries.length} concepts)
        </span>
      </div>

      <div className="space-y-4">
        {nonEmptyCategories.map((category) => {
          const info = categoryInfo[category];
          const categoryDiscoveries = byCategory[category];

          return (
            <div key={category}>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-sm">{info.icon}</span>
                <span className="text-xs text-subtext-color font-medium">
                  {info.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categoryDiscoveries.map((discovery) => (
                  <ConceptBadge
                    key={discovery.id}
                    conceptId={discovery.concept}
                    size="sm"
                    showTooltip
                    linkToExplore
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/explore"
        className="block mt-4 text-xs text-brand-600 hover:text-brand-500"
      >
        Explore more concepts →
      </Link>
    </div>
  );
}

/**
 * Compact version for use in sidebars or small spaces
 */
export function DiscoveryLogCompact({ className = "" }: DiscoveryLogProps) {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiscoveries() {
      try {
        const response = await fetch("/api/discoveries");
        if (response.ok) {
          const data = await response.json();
          setDiscoveries(data.discoveries);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchDiscoveries();
  }, []);

  if (loading || discoveries.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <Compass className="h-3 w-3 text-brand-600" />
        <span className="text-xs text-subtext-color">
          {discoveries.length} concepts explored
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {discoveries.slice(0, 5).map((discovery) => (
          <ConceptBadge
            key={discovery.id}
            conceptId={discovery.concept}
            size="sm"
            showTooltip={false}
            linkToExplore
          />
        ))}
        {discoveries.length > 5 && (
          <Link
            href="/explore"
            className="text-xs text-subtext-color hover:text-default-font px-2 py-0.5"
          >
            +{discoveries.length - 5} more
          </Link>
        )}
      </div>
    </div>
  );
}
