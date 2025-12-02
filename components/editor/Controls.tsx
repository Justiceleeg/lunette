"use client";

import { Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ControlsProps {
  isPlaying: boolean;
  isInitialized: boolean;
  bpm: number;
  onPlay: () => void;
  onStop: () => void;
  onEvaluate: () => void;
  onBpmChange: (bpm: number) => void;
  error?: string | null;
}

export function Controls({
  isPlaying,
  isInitialized,
  bpm,
  onPlay,
  onStop,
  onEvaluate,
  onBpmChange,
  error,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border">
      <div className="flex items-center gap-2">
        {/* Play/Stop Button */}
        <Button
          onClick={isPlaying ? onStop : onPlay}
          disabled={!isInitialized}
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

        {/* Evaluate Button */}
        <Button
          onClick={onEvaluate}
          disabled={!isInitialized}
          variant="secondary"
          className="h-10 gap-2"
          title="Evaluate (Cmd+Enter)"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Run</span>
          <kbd className="hidden sm:inline text-xs text-muted-foreground ml-1">
            {"\u2318"}+Enter
          </kbd>
        </Button>
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
          value={bpm}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value >= 20 && value <= 300) {
              onBpmChange(value);
            }
          }}
          className="w-16 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
