"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PatternCard } from "@/components/patterns/PatternCard";
import { useInlinePlayer } from "@/hooks/useInlinePlayer";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";

interface Pattern {
  id: string;
  name: string;
  code: string;
  authorId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  forkedFromId: string | null;
  originalAuthorId: string | null;
}

export default function MyPatternsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const isAuthenticated = !!session?.user;
  const currentUserId = session?.user?.id;

  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentPatternId, isPlaying, isLoading, play, stopPlayback } =
    useInlinePlayer();

  useEffect(() => {
    if (sessionLoading) return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    async function fetchPatterns() {
      try {
        const response = await fetch("/api/patterns");
        if (!response.ok) {
          throw new Error("Failed to fetch patterns");
        }
        const data = await response.json();
        setPatterns(data.patterns);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load patterns");
      } finally {
        setLoading(false);
      }
    }

    fetchPatterns();
  }, [session, sessionLoading, router]);

  if (sessionLoading || loading) {
    return (
      <main className="flex flex-col min-h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-subtext-color">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading patterns...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col min-h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-destructive">{error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-default-background">
      <Header />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-default-font">My Patterns</h1>
            <p className="text-subtext-color mt-1">
              Your saved patterns and creations
            </p>
          </div>
          <Link href="/editor/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Pattern
            </Button>
          </Link>
        </div>

        {patterns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-subtext-color">You haven&apos;t created any patterns yet.</p>
            <p className="text-sm text-subtext-color mt-1">
              Start by creating your first pattern!
            </p>
            <Link href="/editor/new" className="mt-4 inline-block">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Pattern
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={{
                  ...pattern,
                  author: {
                    id: currentUserId || "",
                    name: session?.user?.name || null,
                    image: session?.user?.image || null,
                  },
                }}
                isPlaying={isPlaying && currentPatternId === pattern.id}
                isLoading={isLoading && currentPatternId === pattern.id}
                onPlay={() => play(pattern.id, pattern.code)}
                onStop={stopPlayback}
                isAuthenticated={isAuthenticated}
                currentUserId={currentUserId}
                showEditButton
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
