/**
 * AI Code Annotations - Trigger Logic
 *
 * Determines when to trigger AI analysis based on user editing patterns.
 * Analysis is triggered when:
 * 1. Newline is typed
 * 2. Closing paren `)` followed by whitespace, newline, or `.`
 * 3. 3 seconds of idle time (fallback)
 *
 * AND minimum 15 characters changed since last analysis.
 */

export interface TriggerOptions {
  /** Minimum characters changed to trigger analysis (default: 15) */
  minChangeThreshold: number;
  /** Idle timeout in ms before triggering analysis (default: 3000) */
  idleTimeout: number;
}

const DEFAULT_OPTIONS: TriggerOptions = {
  minChangeThreshold: 15,
  idleTimeout: 3000,
};

export type TriggerEvent = "newline" | "paren-close" | "idle" | "manual";

/**
 * Determines if analysis should be triggered based on code change
 */
export function shouldTriggerAnalysis(
  currentCode: string,
  lastAnalyzedCode: string,
  event: TriggerEvent,
  options: TriggerOptions = DEFAULT_OPTIONS
): boolean {
  // Always trigger on manual request
  if (event === "manual") {
    return currentCode.trim().length > 0;
  }

  // Check minimum change threshold
  const changeAmount = Math.abs(currentCode.length - lastAnalyzedCode.length);
  if (changeAmount < options.minChangeThreshold) {
    return false;
  }

  // Must have some code to analyze
  if (currentCode.trim().length === 0) {
    return false;
  }

  return true;
}

/**
 * Detects trigger events from code changes
 */
export function detectTriggerEvent(
  previousCode: string,
  currentCode: string
): TriggerEvent | null {
  // No change
  if (previousCode === currentCode) {
    return null;
  }

  // Detect newline insertion
  if (
    currentCode.endsWith("\n") &&
    !previousCode.endsWith("\n") &&
    currentCode.length === previousCode.length + 1
  ) {
    return "newline";
  }

  // Detect closing paren followed by trigger characters
  const addedChars = currentCode.slice(previousCode.length);
  if (addedChars.length === 1) {
    const lastTwoChars = currentCode.slice(-2);
    if (
      lastTwoChars[0] === ")" &&
      (lastTwoChars[1] === " " ||
        lastTwoChars[1] === "\n" ||
        lastTwoChars[1] === ".")
    ) {
      return "paren-close";
    }
  }

  return null;
}

interface TriggerHandler {
  /** Handle code changes - call this on every editor update */
  handleChange: (code: string) => void;
  /** Cleanup timers */
  cleanup: () => void;
  /** Force trigger analysis */
  forceTrigger: () => void;
}

/**
 * Creates a trigger handler that manages debouncing and idle detection
 */
export function createTriggerHandler(
  onTrigger: (event: TriggerEvent) => void,
  options: TriggerOptions = DEFAULT_OPTIONS
): TriggerHandler {
  let previousCode = "";
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const clearIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const startIdleTimer = () => {
    clearIdleTimer();
    idleTimer = setTimeout(() => {
      onTrigger("idle");
    }, options.idleTimeout);
  };

  const handleChange = (code: string) => {
    // Detect event-based triggers
    const event = detectTriggerEvent(previousCode, code);
    previousCode = code;

    if (event) {
      // Reset idle timer on detected events
      clearIdleTimer();
      onTrigger(event);
    } else {
      // Reset idle timer on any change
      startIdleTimer();
    }
  };

  const cleanup = () => {
    clearIdleTimer();
  };

  const forceTrigger = () => {
    clearIdleTimer();
    onTrigger("manual");
  };

  return {
    handleChange,
    cleanup,
    forceTrigger,
  };
}
