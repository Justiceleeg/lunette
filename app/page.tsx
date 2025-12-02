"use client";

import { useState, useCallback, useEffect } from "react";
import { Editor } from "@/components/editor/Editor";
import { Controls } from "@/components/editor/Controls";
import { Button } from "@/components/ui/button";
import {
  initStrudel,
  evaluate,
  play,
  stop,
  setBpm,
  getBpm,
  getPlayingState,
  isInitialized,
  onError,
  onHighlight,
  cleanup,
} from "@/lib/strudel/runtime";

const DEFAULT_CODE = `// Welcome to Lunette!
// Press Cmd+Enter (or Ctrl+Enter) to run the code
// The pattern will start playing automatically

note("c3 e3 g3 b3").sound("sawtooth")`;

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [initialized, setInitialized] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpmState] = useState(120);
  const [error, setError] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Array<{ start: number; end: number }>>([]);

  // Initialize Strudel on first user interaction
  const handleInit = useCallback(async () => {
    if (initialized) return;

    try {
      await initStrudel();
      setInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize audio");
    }
  }, [initialized]);

  // Set up error and highlight callbacks
  useEffect(() => {
    onError((err) => {
      setError(err.message);
    });

    onHighlight((ranges) => {
      setHighlights(ranges);
    });

    return () => {
      cleanup();
    };
  }, []);

  // Sync state with runtime
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInitialized()) {
        setPlaying(getPlayingState());
        setBpmState(getBpm());
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleEvaluate = useCallback(async (codeToEvaluate: string) => {
    if (!isInitialized()) {
      setError("Click to start audio first");
      return;
    }

    try {
      setError(null);
      await evaluate(codeToEvaluate);
      setPlaying(true); // evaluate auto-plays
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    }
  }, []);

  const handlePlay = useCallback(async () => {
    if (!isInitialized()) return;

    try {
      setError(null);
      await play();
      setPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playback failed");
    }
  }, []);

  const handleStop = useCallback(() => {
    stop();
    setPlaying(false);
    setHighlights([]);
  }, []);

  const handleBpmChange = useCallback((newBpm: number) => {
    setBpm(newBpm);
    setBpmState(newBpm);
  }, []);

  return (
    <main className="flex flex-col h-screen bg-default-background">
      {/* Initialization Overlay */}
      {!initialized && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-default-background/95 cursor-pointer"
          onClick={handleInit}
        >
          <h1 className="text-heading-1 font-semibold text-default-font mb-4">
            Lunette
          </h1>
          <p className="text-subtext-color mb-8">Learn music through code</p>
          <Button
            size="lg"
            className="px-6 py-3 text-lg"
            onClick={handleInit}
          >
            Click to Start
          </Button>
          <p className="text-sm text-subtext-color mt-4">
            (Audio requires user interaction to start)
          </p>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <Editor
          value={code}
          onChange={setCode}
          onEvaluate={handleEvaluate}
          highlights={highlights}
        />
      </div>

      {/* Controls Bar */}
      <Controls
        isPlaying={playing}
        isInitialized={initialized}
        bpm={bpm}
        onPlay={handlePlay}
        onStop={handleStop}
        onEvaluate={() => handleEvaluate(code)}
        onBpmChange={handleBpmChange}
        error={error}
      />
    </main>
  );
}
