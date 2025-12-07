"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lunette-docs-tooltip-enabled";
const DEFAULT_ENABLED = true;

interface UseDocsTooltipReturn {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export function useDocsTooltip(): UseDocsTooltipReturn {
  // Initialize from localStorage or default
  const [enabled, setEnabledState] = useState(() => {
    // Only run on client
    if (typeof window === "undefined") return DEFAULT_ENABLED;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === "true";
    }
    return DEFAULT_ENABLED;
  });

  // Sync state to localStorage
  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(value));
    }
  }, []);

  // Handle SSR hydration - read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setEnabledState(stored === "true");
    }
  }, []);

  return { enabled, setEnabled };
}
