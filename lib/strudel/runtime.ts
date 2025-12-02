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
    const { initStrudel: init } = await import("@strudel/web");

    // initStrudel returns a promise that resolves to the repl instance
    // Using minimal options - Strudel uses webaudio by default
    const repl = await init();

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
        setCps: (cps: number) => void;
      };
      // Strudel uses cycles per second (CPS), not BPM
      // 1 cycle = 1 bar (4 beats at 4/4), so CPS = BPM / 60 / 4
      repl.setCps(bpm / 60 / 4);
    } catch {
      // CPS setter may not be available in all versions
    }
  }
}

function startHighlightLoop(): void {
  if (animationFrameId !== null) return;

  const loop = () => {
    if (!runtime.isPlaying) {
      animationFrameId = null;
      return;
    }

    try {
      const repl = runtime.repl as {
        scheduler: {
          getAudioContext: () => AudioContext;
          pattern?: {
            queryArc: (
              start: number,
              end: number
            ) => Array<{ value?: { locations?: Array<{ start: number; end: number }> } }>;
          };
        };
      };

      const audioContext = repl.scheduler.getAudioContext();
      const pattern = repl.scheduler.pattern;

      if (pattern && audioContext) {
        const now = audioContext.currentTime;
        const activeHaps = pattern.queryArc(now, now + 0.1);

        const ranges = activeHaps
          .filter((hap) => hap.value?.locations)
          .flatMap((hap) => hap.value?.locations ?? []);

        if (ranges.length > 0) {
          highlightCallback?.(ranges);
        }
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
