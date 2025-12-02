// Type declarations for Strudel packages
declare module "@strudel/web" {
  interface StrudelInitOptions {
    drawTime?: [number, number];
    defaultOutput?: "webaudio" | "osc";
    prebake?: () => Promise<void>;
  }

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
    setCps: (cps: number) => void;
    setPattern: (pattern: unknown, autoplay?: boolean) => void;
    stop: () => void;
  }

  export function initStrudel(options?: StrudelInitOptions): Promise<Repl>;
}

declare module "@strudel/core" {
  export function evaluate(code: string): Promise<unknown>;
}
