"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PatternCard } from "@/components/patterns/PatternCard";
import { useInlinePlayer } from "@/hooks/useInlinePlayer";
import { useSession } from "@/lib/auth-client";
import { Loader2, ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getConcept,
  getConceptsByCategory,
  categoryInfo,
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
}

// Example patterns for each concept (could be moved to DB or separate file)
const conceptExamples: Record<
  string,
  { code: string; description: string }[]
> = {
  syncopation: [
    {
      code: 's("bd ~ sd ~")',
      description: "Basic syncopation - kick and snare on beats 1 and 3",
    },
    {
      code: 's("bd [~ bd] sd ~")',
      description: "Adding an off-beat kick creates more groove",
    },
    {
      code: 's("bd ~ sd [bd bd]")',
      description: "Syncopated fill at the end",
    },
  ],
  polyrhythm: [
    {
      code: 'stack(\n  s("bd*4"),\n  s("hh*3")\n)',
      description: "4 against 3 - a classic polyrhythm",
    },
    {
      code: 'stack(\n  s("bd*5").slow(2),\n  s("sd*4").slow(2)\n)',
      description: "5 against 4 - more complex polyrhythm",
    },
  ],
  euclidean: [
    {
      code: 's("bd*8").euclid(3, 8)',
      description: "3 hits distributed across 8 slots (Cuban tresillo)",
    },
    {
      code: 's("bd*8").euclid(5, 8)',
      description: "5 hits across 8 - Cuban cinquillo",
    },
    {
      code: 's("hh*16").euclid(7, 16)',
      description: "7 across 16 - creates an interesting shuffle",
    },
  ],
  layering: [
    {
      code: 'stack(\n  s("bd sd"),\n  s("hh*4")\n)',
      description: "Simple two-layer pattern",
    },
    {
      code: 'stack(\n  s("bd sd:2"),\n  s("hh*8").gain(0.5),\n  s("~ ~ ~ cp")\n)',
      description: "Three layers with different rhythms",
    },
  ],
  arpeggio: [
    {
      code: 'note("c3 e3 g3 c4").sound("piano")',
      description: "C major arpeggio going up",
    },
    {
      code: 'note("c4 g3 e3 c3").sound("piano")',
      description: "C major arpeggio going down",
    },
    {
      code: 'note("<c3 d3 e3 f3> <e3 f3 g3 a3> <g3 a3 b3 c4>").sound("piano")',
      description: "Arpeggios with chord changes",
    },
  ],
  "four-on-floor": [
    {
      code: 's("bd bd bd bd")',
      description: "The foundation - kick on every beat",
    },
    {
      code: 'stack(\n  s("bd bd bd bd"),\n  s("~ hh ~ hh")\n)',
      description: "Four-on-the-floor with off-beat hi-hats",
    },
  ],
  phasing: [
    {
      code: 'stack(\n  s("bd sd bd sd"),\n  s("bd sd bd sd").slow(1.01)\n)',
      description: "Same pattern at slightly different speeds",
    },
  ],
  randomness: [
    {
      code: 's("bd hh sd hh").sometimes(fast(2))',
      description: "Sometimes double the speed",
    },
    {
      code: 'note("c3 e3 g3 b3").sound("piano").sometimesBy(0.3, rev)',
      description: "Occasionally reverse the pattern",
    },
  ],
};

export default function ConceptPage() {
  const router = useRouter();
  const params = useParams();
  const conceptId = params.concept as string;

  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const currentUserId = session?.user?.id;

  const [patterns, setPatterns] = useState<PatternWithConcepts[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentPatternId, isPlaying, isLoading, play, stopPlayback } =
    useInlinePlayer();

  const concept = getConcept(conceptId);

  // Fetch patterns tagged with this concept
  useEffect(() => {
    async function fetchPatterns() {
      try {
        const response = await fetch(
          `/api/patterns/public?concept=${conceptId}&limit=12`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch patterns");
        }
        const data = await response.json();
        setPatterns(data.patterns);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchPatterns();
  }, [conceptId]);

  const handleForkSuccess = useCallback(
    (newPatternId: string) => {
      router.push(`/editor/${newPatternId}`);
    },
    [router]
  );

  const handleExamplePlay = (code: string) => {
    play("example", code);
  };

  const handleTryIt = (code: string) => {
    sessionStorage.setItem("starterCode", code);
    router.push("/editor/new");
  };

  // Handle unknown concept
  if (!concept) {
    return (
      <main className="flex flex-col min-h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold text-default-font mb-2">
            Concept Not Found
          </h1>
          <p className="text-subtext-color mb-4">
            We don&apos;t have information about &quot;{conceptId}&quot; yet.
          </p>
          <Link href="/explore">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const examples = conceptExamples[conceptId] || [];
  const categoryInformation = categoryInfo[concept.category];
  const relatedConcepts = getConceptsByCategory(concept.category).filter(
    (c) => c.id !== conceptId
  );

  return (
    <main className="flex flex-col min-h-screen bg-default-background">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Back Link */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-subtext-color hover:text-default-font mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>

        {/* Concept Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-subtext-color mb-2">
            <span>{categoryInformation.icon}</span>
            <span>{categoryInformation.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-default-font mb-2">
            {concept.name}
          </h1>
          <p className="text-lg text-subtext-color">{concept.description}</p>
        </div>

        {/* Examples */}
        {examples.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-default-font mb-4">
              Examples
            </h2>
            <div className="space-y-4">
              {examples.map((example, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-neutral-50 border border-neutral-border"
                >
                  <p className="text-sm text-subtext-color mb-3">
                    {example.description}
                  </p>
                  <pre className="text-sm bg-neutral-0 p-3 rounded mb-3 overflow-x-auto border border-neutral-border">
                    <code className="text-subtext-color">{example.code}</code>
                  </pre>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() =>
                        isPlaying && currentPatternId === "example"
                          ? stopPlayback()
                          : handleExamplePlay(example.code)
                      }
                    >
                      <Play className="h-3 w-3" />
                      {isPlaying && currentPatternId === "example"
                        ? "Stop"
                        : "Listen"}
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleTryIt(example.code)}
                    >
                      Try It
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Try It Yourself */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-default-font mb-4">
            Try It Yourself
          </h2>
          <p className="text-subtext-color mb-4">
            Start with a blank canvas and experiment with {concept.name.toLowerCase()}.
          </p>
          <Link href="/editor/new">
            <Button>Open New Editor</Button>
          </Link>
        </section>

        {/* Community Patterns */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-default-font mb-2">
            Community Patterns
          </h2>
          <p className="text-subtext-color text-sm mb-4">
            Patterns from other learners that use {concept.name.toLowerCase()}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-subtext-color" />
            </div>
          ) : patterns.length === 0 ? (
            <div className="text-center py-12 text-subtext-color border border-dashed border-neutral-border rounded-lg">
              <p>No community patterns with this concept yet.</p>
              <p className="text-sm mt-1">Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((pattern) => (
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

        {/* Related Concepts */}
        {relatedConcepts.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-default-font mb-4">
              Related Concepts
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedConcepts.map((related) => (
                <Link
                  key={related.id}
                  href={`/explore/${related.id}`}
                  className="px-3 py-1.5 rounded-full bg-neutral-100 text-subtext-color text-sm hover:bg-neutral-200 hover:text-default-font transition-colors"
                >
                  {related.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
