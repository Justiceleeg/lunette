"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Play, Square, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Attribution } from "@/components/patterns/Attribution";
import { ForkButton } from "@/components/patterns/ForkButton";
import { useSession } from "@/lib/auth-client";
import {
  initStrudel,
  evaluate,
  play,
  stop,
  isInitialized,
  getPlayingState,
  cleanup,
} from "@/lib/strudel/runtime";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface ForkedFrom {
  id: string;
  name: string;
  author: Author | null;
}

interface PatternWithAuthor {
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
  originalAuthor: Author | null;
  forkedFrom: ForkedFrom | null;
}

export default function PatternPage() {
  const params = useParams();
  const router = useRouter();
  const patternId = params.id as string;

  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const currentUserId = session?.user?.id;

  const [pattern, setPattern] = useState<PatternWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch pattern
  useEffect(() => {
    async function fetchPattern() {
      try {
        const response = await fetch(`/api/patterns/${patternId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Pattern not found");
          } else {
            throw new Error("Failed to fetch pattern");
          }
          return;
        }
        const data = await response.json();
        setPattern(data.pattern);
      } catch {
        setError("Failed to load pattern");
      } finally {
        setLoading(false);
      }
    }

    fetchPattern();
  }, [patternId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Sync playing state
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInitialized()) {
        setPlaying(getPlayingState());
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handlePlay = useCallback(async () => {
    if (!pattern) return;

    try {
      if (!isInitialized()) {
        await initStrudel();
      }
      await evaluate(pattern.code);
      await play();
      setPlaying(true);
    } catch (err) {
      console.error("Playback error:", err);
    }
  }, [pattern]);

  const handleStop = useCallback(() => {
    stop();
    setPlaying(false);
  }, []);

  const handleCopyCode = useCallback(async () => {
    if (!pattern) return;
    await navigator.clipboard.writeText(pattern.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pattern]);

  const handleOpenInEditor = useCallback(() => {
    if (!pattern) return;
    // Store code in sessionStorage and navigate to editor
    sessionStorage.setItem("lunette_load_code", pattern.code);
    router.push("/");
  }, [pattern, router]);

  const handleForkSuccess = useCallback((newPatternId: string) => {
    router.push(`/pattern/${newPatternId}`);
  }, [router]);

  if (loading) {
    return (
      <main className="flex flex-col h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-subtext-color">Loading...</div>
        </div>
      </main>
    );
  }

  if (error || !pattern) {
    return (
      <main className="flex flex-col h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-subtext-color">{error || "Pattern not found"}</div>
          <Link href="/">
            <Button variant="outline">Go to Editor</Button>
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = currentUserId === pattern.authorId;

  return (
    <main className="flex flex-col min-h-screen bg-default-background">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Pattern Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-default-font mb-2">
            {pattern.name}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-2 text-subtext-color">
            {pattern.author?.image && (
              <Image
                src={pattern.author.image}
                alt={pattern.author.name || "Author"}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span>
              by {pattern.author?.name || "Unknown"}
            </span>
          </div>

          {/* Attribution for forks */}
          {(pattern.forkedFrom || pattern.originalAuthor) && (
            <div className="mt-2">
              <Attribution
                forkedFrom={pattern.forkedFrom}
                originalAuthor={pattern.originalAuthor}
              />
            </div>
          )}
        </div>

        {/* Code Display */}
        <div className="relative mb-6">
          <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto font-mono text-sm text-default-font">
            {pattern.code}
          </pre>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleCopyCode}
            title="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Play/Stop Button */}
          <Button
            onClick={playing ? handleStop : handlePlay}
            className={playing ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {playing ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Play
              </>
            )}
          </Button>

          {/* Open in Editor */}
          <Button variant="outline" onClick={handleOpenInEditor}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Editor
          </Button>

          {/* Fork Button - only show if authenticated and not owner */}
          {isAuthenticated && !isOwner && (
            <ForkButton
              patternId={pattern.id}
              patternName={pattern.name}
              patternCode={pattern.code}
              onForkSuccess={handleForkSuccess}
            />
          )}

          {/* Edit link for owner */}
          {isOwner && (
            <Link href="/">
              <Button variant="outline" onClick={handleOpenInEditor}>
                Edit Pattern
              </Button>
            </Link>
          )}
        </div>

        {/* Pattern Metadata */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-sm text-subtext-color">
            Created {new Date(pattern.createdAt).toLocaleDateString()}
            {pattern.updatedAt !== pattern.createdAt && (
              <> · Updated {new Date(pattern.updatedAt).toLocaleDateString()}</>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
