// Runtime state type for passing to the LLM
export interface RuntimeState {
  currentCode: string;
  isPlaying: boolean;
  bpm: number;
  lastError: string | null;
  isInitialized: boolean;
}
