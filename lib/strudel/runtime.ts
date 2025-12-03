// Singleton Strudel runtime manager
// Manages audio context, pattern evaluation, and playback state

type ErrorCallback = (error: Error) => void;
type HighlightCallback = (ranges: Array<{ start: number; end: number }>) => void;

interface StrudelRuntime {
  isInitialized: boolean;
  isPlaying: boolean;
  bpm: number;
  currentCode: string;
  lastError: Error | null;
  repl: unknown | null;
}

const runtime: StrudelRuntime = {
  isInitialized: false,
  isPlaying: false,
  bpm: 120,
  currentCode: "",
  lastError: null,
  repl: null,
};

let errorCallback: ErrorCallback | null = null;
let highlightCallback: HighlightCallback | null = null;
let animationFrameId: number | null = null;

export function onError(callback: ErrorCallback) {
  errorCallback = callback;
}

export function onHighlight(callback: HighlightCallback) {
  highlightCallback = callback;
}

export function getPlayingState(): boolean {
  return runtime.isPlaying;
}

export function getBpm(): number {
  return runtime.bpm;
}

export function getCurrentCode(): string {
  return runtime.currentCode;
}

export function getLastError(): Error | null {
  return runtime.lastError;
}

export function isInitialized(): boolean {
  return runtime.isInitialized;
}

export async function initStrudel(): Promise<void> {
  if (runtime.isInitialized) return;

  try {
    const { initStrudel: init, samples } = await import("@strudel/web");

    // initStrudel returns a promise that resolves to the repl instance
    // prebake loads the standard dirt-samples (bd, sd, hh, etc.)
    const repl = await init({
      prebake: () =>
        samples("https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/strudel.json"),
    });

    runtime.repl = repl;
    runtime.isInitialized = true;
    runtime.lastError = null;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    runtime.lastError = err;
    errorCallback?.(err);
    throw err;
  }
}

export async function evaluate(code: string, autoplay = true): Promise<void> {
  if (!runtime.isInitialized) {
    throw new Error("Strudel not initialized. Call initStrudel() first.");
  }

  try {
    const repl = runtime.repl as {
      evaluate: (code: string, autoplay?: boolean) => Promise<unknown>;
    };
    await repl.evaluate(code, autoplay);
    runtime.currentCode = code;
    runtime.lastError = null;

    if (autoplay) {
      runtime.isPlaying = true;
      startHighlightLoop();
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    runtime.lastError = err;
    errorCallback?.(err);
    throw err;
  }
}

export async function play(): Promise<void> {
  if (!runtime.isInitialized) {
    throw new Error("Strudel not initialized. Call initStrudel() first.");
  }

  // If we have code, re-evaluate it to start playback
  if (runtime.currentCode) {
    await evaluate(runtime.currentCode, true);
    return;
  }

  throw new Error("No pattern to play. Evaluate code first with Cmd+Enter.");
}

export function stop(): void {
  if (!runtime.isInitialized) return;

  try {
    const repl = runtime.repl as {
      stop: () => void;
    };
    repl.stop();
    runtime.isPlaying = false;

    // Stop highlight animation loop
    stopHighlightLoop();

    // Clear highlights
    highlightCallback?.([]);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    runtime.lastError = err;
    errorCallback?.(err);
  }
}

export function setBpm(bpm: number): void {
  if (bpm < 20 || bpm > 300) {
    throw new Error("BPM must be between 20 and 300");
  }
  runtime.bpm = bpm;

  if (runtime.isInitialized && runtime.repl) {
    try {
      const repl = runtime.repl as {
        scheduler: {
          setCps: (cps: number) => void;
        };
      };
      // Strudel uses cycles per second (CPS), not BPM
      // 1 cycle = 1 bar (4 beats at 4/4), so CPS = BPM / 60 / 4
      const cps = bpm / 60 / 4;
      repl.scheduler.setCps(cps);
    } catch {
      // setCps may not be available on all scheduler versions
    }
  }
}

// Type definition for Strudel's hap (event) structure
interface StrudelHap {
  whole: { begin: number; end: number };
  part: { begin: number; end: number };
  context?: {
    locations?: Array<{ start: number; end: number }>;
  };
  // Some versions might store locations in value
  value?: {
    locations?: Array<{ start: number; end: number }>;
  };
  // Hap methods
  hasOnset?: () => boolean;
  isActive?: (time: number) => boolean;
  endClipped?: number;
}

// Strudel scheduler interface - scheduler.now() is a function!
interface StrudelScheduler {
  now: () => number; // Returns current cycle position
  pattern?: {
    queryArc: (start: number, end: number) => StrudelHap[];
  };
}

function extractLocations(hap: StrudelHap): Array<{ start: number; end: number }> {
  // Location data might be in context.locations or value.locations
  return hap.context?.locations ?? hap.value?.locations ?? [];
}

// Track last frame for incremental querying (like Strudel's Drawer)
let lastFrame: number | null = null;
let visibleHaps: StrudelHap[] = [];

function startHighlightLoop(): void {
  if (animationFrameId !== null) return;

  // Reset state
  lastFrame = null;
  visibleHaps = [];

  const loop = () => {
    if (!runtime.isPlaying) {
      animationFrameId = null;
      lastFrame = null;
      visibleHaps = [];
      return;
    }

    try {
      const repl = runtime.repl as {
        scheduler: StrudelScheduler;
      };

      const scheduler = repl.scheduler;

      // scheduler.now() is a function that returns current cycle position
      if (scheduler && typeof scheduler.now === "function" && scheduler.pattern) {
        const lookahead = 0.1; // Look 0.1 cycles ahead
        const lookbehind = 0.5; // Keep haps visible for 0.5 cycles
        const phase = scheduler.now() + lookahead;

        if (lastFrame === null) {
          lastFrame = phase;
          animationFrameId = requestAnimationFrame(loop);
          return;
        }

        // Query the pattern for new haps (like Strudel's Drawer)
        const queryStart = Math.max(lastFrame, phase - 1 / 10);
        const newHaps = scheduler.pattern.queryArc(queryStart, phase);
        lastFrame = phase;

        // Accumulate visible haps and filter out old ones
        const currentTime = phase - lookahead;
        visibleHaps = visibleHaps
          .filter((h) => {
            // Keep haps that are still within visible window
            const endTime = h.endClipped ?? h.whole.end;
            return endTime >= currentTime - lookbehind;
          })
          .concat(newHaps.filter((h) => h.hasOnset?.() ?? true));

        // Filter for currently active haps and extract locations
        const ranges = visibleHaps
          .filter((hap) => {
            // Check if hap has location data
            const hasLocation = extractLocations(hap).length > 0;
            // Check if hap is active at current time
            const isActive = hap.isActive
              ? hap.isActive(currentTime)
              : hap.whole.begin <= currentTime && currentTime < hap.whole.end;
            return hasLocation && isActive;
          })
          .flatMap(extractLocations);

        // Always call callback to update/clear highlights
        highlightCallback?.(ranges);
      }
    } catch {
      // Ignore errors in highlight loop
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);
}

function stopHighlightLoop(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// Cleanup function for unmounting
export function cleanup(): void {
  stop();
  runtime.isInitialized = false;
  runtime.repl = null;
  runtime.currentCode = "";
  runtime.lastError = null;
}
