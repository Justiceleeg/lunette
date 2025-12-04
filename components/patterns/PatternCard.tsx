"use client";

import { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForkButton } from "./ForkButton";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface PatternCardProps {
  pattern: {
    id: string;
    name: string;
    code: string;
    authorId: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    forkedFromId: string | null;
    author: Author | null;
  };
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onStop: () => void;
  onForkSuccess?: (newPatternId: string) => void;
  isAuthenticated: boolean;
  currentUserId?: string;
}

export function PatternCard({
  pattern,
  isPlaying,
  isLoading,
  onPlay,
  onStop,
  onForkSuccess,
  isAuthenticated,
  currentUserId,
}: PatternCardProps) {
  const isOwner = currentUserId === pattern.authorId;

  const handlePlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isPlaying) {
        onStop();
      } else {
        onPlay();
      }
    },
    [isPlaying, onPlay, onStop]
  );

  return (
    <div className="group relative flex flex-col bg-card border border-border rounded-lg overflow-hidden hover:border-brand-600/50 transition-colors">
      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-600">
          <div className="h-full bg-brand-400 animate-pulse" />
        </div>
      )}

      {/* Pattern header with title */}
      <div className="p-4">
        <Link
          href={`/pattern/${pattern.id}`}
          className="block text-lg font-semibold text-default-font hover:text-brand-600 transition-colors truncate"
        >
          {pattern.name}
        </Link>

        {/* Author info */}
        <div className="flex items-center gap-2 mt-2 text-sm text-subtext-color">
          {pattern.author?.image && (
            <Image
              src={pattern.author.image}
              alt={pattern.author.name || "Author"}
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
          <span className="truncate">
            {pattern.author?.name || "Unknown"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-2 flex items-center gap-2 border-t border-border/50">
        {/* Play/Stop button */}
        <Button
          size="sm"
          onClick={handlePlayClick}
          disabled={isLoading}
          className={isPlaying ? "bg-destructive hover:bg-destructive/90" : ""}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <>
              <Square className="h-4 w-4 mr-1" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Play
            </>
          )}
        </Button>

        {/* Fork button - only show if authenticated and not owner */}
        {isAuthenticated && !isOwner && (
          <ForkButton
            patternId={pattern.id}
            patternName={pattern.name}
            patternCode={pattern.code}
            onForkSuccess={onForkSuccess}
          />
        )}

        {/* Date on the right */}
        <span className="ml-auto text-xs text-subtext-color">
          {new Date(pattern.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
