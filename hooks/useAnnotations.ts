"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Annotation, AnnotationResponse } from "@/lib/annotations/types";
import {
  createTriggerHandler,
  shouldTriggerAnalysis,
  type TriggerEvent,
} from "@/lib/annotations/trigger";
import { invalidateAnnotations, shouldReanalyze } from "@/lib/annotations/diff";

const STORAGE_KEY = "lunette-annotations-enabled";
const DEFAULT_ENABLED = true;

interface UseAnnotationsOptions {
  /** Minimum characters changed to trigger analysis */
  minChangeThreshold?: number;
  /** Idle timeout in ms before triggering analysis */
  idleTimeout?: number;
}

interface UseAnnotationsReturn {
  /** Current annotations */
  annotations: Annotation[];
  /** Whether analysis is in progress */
  isAnalyzing: boolean;
  /** Whether annotations are enabled */
  enabled: boolean;
  /** Toggle annotations on/off */
  setEnabled: (enabled: boolean) => void;
  /** Manually trigger analysis */
  triggerAnalysis: () => void;
  /** Clear all annotations */
  clearAnnotations: () => void;
  /** Handle code changes - call this on every editor update */
  handleCodeChange: (code: string) => void;
}

export function useAnnotations(
  options: UseAnnotationsOptions = {}
): UseAnnotationsReturn {
  const { minChangeThreshold = 15, idleTimeout = 3000 } = options;

  // Enabled state with localStorage persistence
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_ENABLED;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
    return DEFAULT_ENABLED;
  });

  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Track code for change detection
  const currentCodeRef = useRef("");
  const lastAnalyzedCodeRef = useRef("");

  // Persist enabled state
  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(value));
    }
    // Clear annotations when disabled
    if (!value) {
      setAnnotations([]);
    }
  }, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setEnabledState(stored === "true");
    }
  }, []);

  // Fetch annotations from API
  const fetchAnnotations = useCallback(async (code: string) => {
    if (!code.trim()) {
      setAnnotations([]);
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        console.error("Annotations API error:", response.status);
        return;
      }

      const data = (await response.json()) as AnnotationResponse;
      setAnnotations(data.annotations);
      lastAnalyzedCodeRef.current = code;
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Handle trigger events
  const handleTrigger = useCallback(
    (event: TriggerEvent) => {
      if (!enabled) return;

      const currentCode = currentCodeRef.current;
      const lastAnalyzedCode = lastAnalyzedCodeRef.current;

      // Check if we should trigger analysis
      if (!shouldTriggerAnalysis(currentCode, lastAnalyzedCode, event, {
        minChangeThreshold,
        idleTimeout,
      })) {
        return;
      }

      // Check if we need full re-analysis or just invalidation
      if (shouldReanalyze(lastAnalyzedCode, currentCode)) {
        fetchAnnotations(currentCode);
      } else {
        // Just invalidate affected annotations
        const validAnnotations = invalidateAnnotations(
          annotations,
          lastAnalyzedCode,
          currentCode
        );
        setAnnotations(validAnnotations);
        lastAnalyzedCodeRef.current = currentCode;

        // If we have few annotations left, re-analyze
        if (validAnnotations.length < 2 && currentCode.trim().length > 30) {
          fetchAnnotations(currentCode);
        }
      }
    },
    [enabled, annotations, fetchAnnotations, minChangeThreshold, idleTimeout]
  );

  // Create trigger handler
  const triggerHandlerRef = useRef<ReturnType<typeof createTriggerHandler> | null>(null);

  useEffect(() => {
    triggerHandlerRef.current = createTriggerHandler(handleTrigger, {
      minChangeThreshold,
      idleTimeout,
    });

    return () => {
      triggerHandlerRef.current?.cleanup();
    };
  }, [handleTrigger, minChangeThreshold, idleTimeout]);

  // Handle code changes from editor
  const handleCodeChange = useCallback(
    (code: string) => {
      const previousCode = currentCodeRef.current;
      currentCodeRef.current = code;

      // Invalidate annotations on any change
      if (enabled && previousCode !== code && annotations.length > 0) {
        const validAnnotations = invalidateAnnotations(
          annotations,
          previousCode,
          code
        );
        if (validAnnotations.length !== annotations.length) {
          setAnnotations(validAnnotations);
        }
      }

      // Let trigger handler decide if we need analysis
      triggerHandlerRef.current?.handleChange(code);
    },
    [enabled, annotations]
  );

  // Manually trigger analysis
  const triggerAnalysis = useCallback(() => {
    if (enabled && currentCodeRef.current.trim()) {
      fetchAnnotations(currentCodeRef.current);
    }
  }, [enabled, fetchAnnotations]);

  // Clear all annotations
  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    lastAnalyzedCodeRef.current = "";
  }, []);

  return {
    annotations,
    isAnalyzing,
    enabled,
    setEnabled,
    triggerAnalysis,
    clearAnnotations,
    handleCodeChange,
  };
}
