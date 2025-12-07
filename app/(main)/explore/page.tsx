"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PatternCard } from "@/components/patterns/PatternCard";
import { useInlinePlayer } from "@/hooks/useInlinePlayer";
import { useSession } from "@/lib/auth-client";
import { Loader2, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  concepts,
  categoryInfo,
  type ConceptCategory,
} from "@/lib/concepts";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface PatternWithConcepts {
  id: string;
  name: string;
  code: string;
  authorId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  forkedFromId: string | null;
  originalAuthorId: string | null;
  author: Author | null;
  concepts?: string[];
}

interface StarterPattern {
  name: string;
  code: string;
  concepts: string[];
  description: string;
}

// Curated starter patterns for beginners
const starterPatterns: StarterPattern[] = [
  {
    name: "Basic Beat",
    code: 's("bd hh sd hh")',
    concepts: ["four-on-floor", "repetition"],
    description: "A simple four-on-the-floor beat to get started",
  },
  {
    name: "Syncopated Groove",
    code: 's("bd ~ sd [bd bd] sd ~")',
    concepts: ["syncopation", "rhythm"],
    description: "Off-beat accents that make it groove",
  },
  {
    name: "Euclidean Rhythm",
    code: 's("bd*8").euclid(5, 8)',
    concepts: ["euclidean", "pattern-composition"],
    description: "Mathematically distributed hits",
  },
  {
    name: "Layered Texture",
    code: 'stack(\n  s("bd sd:2"),\n  s("hh*8").gain(0.5),\n  s("~ cp")\n)',
    concepts: ["layering", "density"],
    description: "Multiple patterns playing together",
  },
  {
    name: "Melodic Arpeggio",
    code: 'note("c3 e3 g3 c4").sound("piano")',
    concepts: ["arpeggio", "chord-tones"],
    description: "Playing chord notes one at a time",
  },
  {
    name: "Phasing Experiment",
    code: 'stack(\n  s("bd sd bd sd"),\n  s("bd sd bd sd").slow(1.01)\n)',
    concepts: ["phasing", "polyrhythm"],
    description: "Two patterns slowly drifting apart",
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const currentUserId = session?.user?.id;

  const [patterns, setPatterns] = useState<PatternWithConcepts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ConceptCategory | null>(null);

  const { currentPatternId, isPlaying, isLoading, play, stopPlayback } =
    useInlinePlayer();

  // Fetch public patterns (will eventually be filtered by concepts)
  useEffect(() => {
    async function fetchPatterns() {
      try {
        const response = await fetch("/api/patterns/public?limit=6");
        if (!response.ok) {
          throw new Error("Failed to fetch patterns");
        }
        const data = await response.json();
        setPatterns(data.patterns);
      } catch {
        // Silently fail - we still have starter patterns
      } finally {
        setLoading(false);
      }
    }

    fetchPatterns();
  }, []);

  const handleForkSuccess = useCallback(
    (newPatternId: string) => {
      router.push(`/editor/${newPatternId}`);
    },
    [router]
  );

  const handleStarterPlay = (code: string) => {
    play("starter", code);
  };

  const handleStarterEdit = (code: string) => {
    // Store code in sessionStorage and navigate to new editor
    sessionStorage.setItem("starterCode", code);
    router.push("/editor/new");
  };

  return (
    <main className="flex flex-col min-h-screen bg-default-background">
      <Header />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-default-font">Explore Concepts</h1>
          <p className="text-subtext-color mt-1">
            Discover music theory through code - no prerequisites required
          </p>
        </div>

        {/* Category Grid */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-default-font mb-4">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {(Object.keys(concepts) as ConceptCategory[]).map((category) => {
              const info = categoryInfo[category];
              const conceptList = concepts[category];
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : category)
                  }
                  className={`
                    p-4 rounded-lg border text-left transition-all
                    ${
                      isSelected
                        ? "bg-brand-600/20 border-brand-600"
                        : "bg-neutral-50 border-neutral-border hover:border-neutral-300"
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{info.icon}</div>
                  <h3 className="font-medium text-default-font text-sm">
                    {info.name}
                  </h3>
                  <p className="text-xs text-subtext-color mt-0.5">
                    {conceptList.length} concepts
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Category Concepts */}
        {selectedCategory && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-default-font">
                {categoryInfo[selectedCategory].icon}{" "}
                {categoryInfo[selectedCategory].name}
              </h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-subtext-color hover:text-default-font"
              >
                Clear
              </button>
            </div>
            <p className="text-subtext-color text-sm mb-4">
              {categoryInfo[selectedCategory].description}
            </p>
            <div className="flex flex-wrap gap-2">
              {concepts[selectedCategory].map((conceptId) => (
                <Link
                  key={conceptId}
                  href={`/explore/${conceptId}`}
                  className="px-3 py-1.5 rounded-full bg-neutral-100 text-subtext-color text-sm hover:bg-neutral-200 hover:text-default-font transition-colors flex items-center gap-1"
                >
                  {conceptId
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Starter Patterns */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-default-font mb-2">
            Starter Patterns
          </h2>
          <p className="text-subtext-color text-sm mb-4">
            Simple patterns to explore - click to hear, then open in editor to modify
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starterPatterns.map((starter) => (
              <div
                key={starter.name}
                className="p-4 rounded-lg bg-neutral-50 border border-neutral-border"
              >
                <h3 className="font-medium text-default-font mb-1">
                  {starter.name}
                </h3>
                <p className="text-xs text-subtext-color mb-3">
                  {starter.description}
                </p>
                <pre className="text-xs bg-neutral-0 p-2 rounded mb-3 overflow-x-auto text-subtext-color border border-neutral-border">
                  <code>{starter.code}</code>
                </pre>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {starter.concepts.map((c) => (
                    <Link
                      key={c}
                      href={`/explore/${c}`}
                      className="text-xs px-2 py-0.5 rounded-full bg-brand-600/20 text-brand-400 hover:bg-brand-600/30"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={() =>
                      isPlaying && currentPatternId === "starter"
                        ? stopPlayback()
                        : handleStarterPlay(starter.code)
                    }
                  >
                    <Play className="h-3 w-3" />
                    {isPlaying && currentPatternId === "starter"
                      ? "Stop"
                      : "Listen"}
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => handleStarterEdit(starter.code)}
                  >
                    Open in Editor
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Patterns */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-default-font">
                Community Patterns
              </h2>
              <p className="text-subtext-color text-sm">
                Patterns shared by other learners
              </p>
            </div>
            <Link href="/browse">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-subtext-color" />
            </div>
          ) : patterns.length === 0 ? (
            <div className="text-center py-12 text-subtext-color">
              <p>No community patterns yet.</p>
              <p className="text-sm mt-1">Be the first to share!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.slice(0, 6).map((pattern) => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  isPlaying={isPlaying && currentPatternId === pattern.id}
                  isLoading={isLoading && currentPatternId === pattern.id}
                  onPlay={() => play(pattern.id, pattern.code)}
                  onStop={stopPlayback}
                  onForkSuccess={handleForkSuccess}
                  isAuthenticated={isAuthenticated}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
