// Type declarations for Strudel packages
declare module "@strudel/web" {
  // Sound registration
  export function registerSound(
    name: string,
    trigger: (
      time: number,
      value: Record<string, unknown>,
      onended: () => void
    ) => Promise<{ node: AudioNode; stop: (time: number) => void }>
  ): void;
  export function getAudioContext(): AudioContext;
  export function getSoundIndex(n: unknown, length: number): number;

  interface StrudelInitOptions {
    drawTime?: [number, number];
    defaultOutput?: "webaudio" | "osc";
    prebake?: () => Promise<void>;
  }

  // samples function for loading audio samples
  export function samples(
    sampleMap: string | Record<string, string | string[]>,
    baseUrl?: string,
    options?: { tag?: string }
  ): Promise<void>;

  // Sound map for accessing loaded samples (uses nanostores)
  interface SoundMap {
    get: () => Record<string, unknown>;
    set: (value: Record<string, unknown>) => void;
    setKey: (key: string, value: unknown) => void;
  }
  export const soundMap: SoundMap;

  interface Scheduler {
    start: () => void;
    stop: () => void;
    now: () => number;
    getAudioContext: () => AudioContext;
    pattern?: Pattern;
  }

  interface Pattern {
    queryArc: (
      start: number,
      end: number
    ) => Array<{
      value?: {
        locations?: Array<{ start: number; end: number }>;
      };
    }>;
  }

  interface Repl {
    evaluate: (code: string, autoplay?: boolean) => Promise<unknown>;
    scheduler: Scheduler;
    audioContext?: AudioContext;
    getAudioContext?: () => AudioContext;
    setCps: (cps: number) => void;
    setPattern: (pattern: unknown, autoplay?: boolean) => void;
    stop: () => void;
  }

  export function initStrudel(options?: StrudelInitOptions): Promise<Repl>;
}
