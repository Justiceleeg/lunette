"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Header } from "@/components/layout/Header";
import { PatternCard } from "@/components/patterns/PatternCard";
import { PatternGridSkeleton } from "@/components/patterns/PatternCardSkeleton";
import { useInlinePlayer } from "@/hooks/useInlinePlayer";
import { useSession } from "@/lib/auth-client";
import { fetcher } from "@/lib/swr";

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

interface PatternsResponse {
  patterns: PublicPattern[];
}

export default function BrowsePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const currentUserId = session?.user?.id;

  // SWR for data fetching with caching
  const { data, error, isLoading } = useSWR<PatternsResponse>(
    "/api/patterns/public",
    fetcher
  );

  const patterns = data?.patterns ?? [];

  const { currentPatternId, isPlaying, isLoading: isPlayerLoading, play, stopPlayback } =
    useInlinePlayer();

  const handleForkSuccess = useCallback(
    (newPatternId: string) => {
      router.push(`/editor/${newPatternId}`);
    },
    [router]
  );

  // Show skeleton only on initial load (no cached data yet)
  if (isLoading && !data) {
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
          <PatternGridSkeleton count={6} />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col min-h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-destructive">Failed to load patterns</div>
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
                isLoading={isPlayerLoading && currentPatternId === pattern.id}
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
