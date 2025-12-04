"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PatternCard } from "@/components/patterns/PatternCard";
import { useInlinePlayer } from "@/hooks/useInlinePlayer";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface PublicPattern {
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

export default function BrowsePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const currentUserId = session?.user?.id;

  const [patterns, setPatterns] = useState<PublicPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentPatternId, isPlaying, isLoading, play, stopPlayback } =
    useInlinePlayer();

  // Fetch public patterns
  useEffect(() => {
    async function fetchPatterns() {
      try {
        const response = await fetch("/api/patterns/public");
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
  }, []);

  const handleForkSuccess = useCallback(
    (newPatternId: string) => {
      router.push(`/pattern/${newPatternId}`);
    },
    [router]
  );

  if (loading) {
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-default-font">Browse Patterns</h1>
          <p className="text-subtext-color mt-1">
            Discover and play patterns shared by the community
          </p>
        </div>

        {patterns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-subtext-color">No public patterns yet.</p>
            <p className="text-sm text-subtext-color mt-1">
              Be the first to share a pattern!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    </main>
  );
}
