"use client";

import { useState, useEffect } from "react";
import { Play, Square, RotateCcw, Save, Circle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ControlsProps {
  isPlaying: boolean;
  hasEvaluated: boolean;
  bpm: number;
  onPlay: () => void;
  onStop: () => void;
  onEvaluate: () => void;
  onBpmChange: (bpm: number) => void;
  onSave?: () => void;
  onShare?: () => void;
  error?: string | null;
  hasUnsavedChanges?: boolean;
  isAuthenticated?: boolean;
  hasCurrentPattern?: boolean;
}

export function Controls({
  isPlaying,
  hasEvaluated,
  bpm,
  onPlay,
  onStop,
  onEvaluate,
  onBpmChange,
  onSave,
  onShare,
  error,
  hasUnsavedChanges,
  isAuthenticated,
  hasCurrentPattern,
}: ControlsProps) {
  // Local state for typing - allows intermediate values
  const [bpmInput, setBpmInput] = useState(bpm.toString());

  // Sync with external bpm changes
  useEffect(() => {
    setBpmInput(bpm.toString());
  }, [bpm]);

  const applyBpm = () => {
    const value = parseInt(bpmInput, 10);
    if (!isNaN(value) && value >= 20 && value <= 300) {
      onBpmChange(value);
    } else {
      // Reset to current valid bpm if invalid
      setBpmInput(bpm.toString());
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border">
      <div className="flex items-center gap-2">
        {/* Play/Stop Button - disabled until pattern has been evaluated */}
        <Button
          onClick={isPlaying ? onStop : onPlay}
          disabled={!hasEvaluated}
          size="icon"
          className={cn(
            "w-10 h-10",
            isPlaying
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90"
          )}
          title={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? (
            <Square className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </Button>

        {/* Evaluate Button - initializes audio on first click */}
        <Button
          onClick={onEvaluate}
          variant="secondary"
          className="h-10 gap-2"
          title="Evaluate (Cmd+Enter)"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Evaluate</span>
          <kbd className="hidden sm:inline text-xs text-muted-foreground ml-1">
            {"\u2318"}+Enter
          </kbd>
        </Button>

        {/* Save Button - only show when authenticated */}
        {isAuthenticated && onSave && (
          <Button
            onClick={onSave}
            variant="outline"
            size="sm"
            className="gap-2"
            title="Save pattern"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
            {hasUnsavedChanges && (
              <Circle className="h-2 w-2 fill-current text-amber-500" />
            )}
          </Button>
        )}

        {/* Share Button - only show when authenticated and has a saved pattern */}
        {isAuthenticated && hasCurrentPattern && onShare && (
          <Button
            onClick={onShare}
            variant="outline"
            size="sm"
            className="gap-2"
            title="Share pattern"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        )}
      </div>

      {/* BPM Control */}
      <div className="flex items-center gap-2">
        <label htmlFor="bpm" className="text-sm text-muted-foreground">
          BPM
        </label>
        <Input
          id="bpm"
          type="number"
          min={20}
          max={300}
          value={bpmInput}
          onChange={(e) => setBpmInput(e.target.value)}
          onBlur={applyBpm}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyBpm();
              e.currentTarget.blur();
            }
          }}
          className="w-20 h-8 text-center"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-14 left-4 right-4 p-3 bg-destructive/20 border border-destructive rounded text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
