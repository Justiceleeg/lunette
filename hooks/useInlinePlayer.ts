"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  initStrudel,
  evaluate,
  stop,
  isInitialized,
  getPlayingState,
  cleanup,
} from "@/lib/strudel/runtime";

interface UseInlinePlayerReturn {
  currentPatternId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  play: (patternId: string, code: string) => Promise<void>;
  stopPlayback: () => void;
}

export function useInlinePlayer(): UseInlinePlayerReturn {
  const [currentPatternId, setCurrentPatternId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  // Sync playing state with runtime
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInitialized()) {
        const playing = getPlayingState();
        setIsPlaying(playing);
        // Clear current pattern ID if playback stopped externally
        if (!playing && currentPatternId) {
          setCurrentPatternId(null);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentPatternId]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []);

  const play = useCallback(async (patternId: string, code: string) => {
    setIsLoading(true);
    try {
      // Initialize Strudel if needed
      if (!isInitialized()) {
        await initStrudel();
      }

      // Stop any currently playing pattern
      if (getPlayingState()) {
        stop();
      }

      // Evaluate and play the new pattern
      await evaluate(code, true);

      if (mountedRef.current) {
        setCurrentPatternId(patternId);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Playback error:", error);
      if (mountedRef.current) {
        setCurrentPatternId(null);
        setIsPlaying(false);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const stopPlayback = useCallback(() => {
    stop();
    setCurrentPatternId(null);
    setIsPlaying(false);
  }, []);

  return {
    currentPatternId,
    isPlaying,
    isLoading,
    play,
    stopPlayback,
  };
}
