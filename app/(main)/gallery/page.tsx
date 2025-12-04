"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PatternCard } from "@/components/patterns/PatternCard";
import { useInlinePlayer } from "@/hooks/useInlinePlayer";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

interface UserPattern {
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

export default function GalleryPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const isAuthenticated = !!session?.user;
  const currentUserId = session?.user?.id;

  const [patterns, setPatterns] = useState<UserPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentPatternId, isPlaying, isLoading, play, stopPlayback } =
    useInlinePlayer();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [sessionLoading, isAuthenticated, router]);

  // Fetch user's patterns
  useEffect(() => {
    async function fetchPatterns() {
      if (!isAuthenticated) return;

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

    if (isAuthenticated) {
      fetchPatterns();
    }
  }, [isAuthenticated]);

  const handleDelete = useCallback(async (patternId: string) => {
    try {
      const response = await fetch(`/api/patterns/${patternId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete pattern");
      }
      setPatterns((prev) => prev.filter((p) => p.id !== patternId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  }, []);

  // Show loading while checking auth
  if (sessionLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-subtext-color">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </main>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-subtext-color">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading your patterns...</span>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-default-font">My Patterns</h1>
            <p className="text-subtext-color mt-1">
              Your personal collection of patterns
            </p>
          </div>
          <Link href="/editor/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Pattern
            </Button>
          </Link>
        </div>

        {patterns.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-subtext-color mb-4">You haven&apos;t created any patterns yet.</p>
            <Link href="/editor/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Pattern
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
                    id: currentUserId!,
                    name: session?.user?.name ?? null,
                    image: session?.user?.image ?? null,
                  },
                }}
                isPlaying={isPlaying && currentPatternId === pattern.id}
                isLoading={isLoading && currentPatternId === pattern.id}
                onPlay={() => play(pattern.id, pattern.code)}
                onStop={stopPlayback}
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
