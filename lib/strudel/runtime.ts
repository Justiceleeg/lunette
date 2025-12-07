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
let initPromise: Promise<void> | null = null;

export function onError(callback: ErrorCallback) {
  errorCallback = callback;

  // Also listen for Strudel's custom error event
  // Strudel dispatches errors via document events instead of throwing
  if (typeof document !== "undefined") {
    document.addEventListener("strudel.log", ((event: CustomEvent) => {
      const { message, type } = event.detail || {};
      if (type === "error" || message?.includes("error:")) {
        const errorMessage = message?.replace(/^\[.*?\]\s*error:\s*/i, "") || "Unknown error";
        const err = new Error(errorMessage);
        runtime.lastError = err;
        errorCallback?.(err);
      }
    }) as EventListener);
  }
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

// Resume AudioContext if suspended (browsers suspend to save resources)
async function resumeAudioContext(): Promise<void> {
  if (!runtime.repl) return;

  try {
    // Get audio context from the repl instance
    const repl = runtime.repl as {
      audioContext?: AudioContext;
      getAudioContext?: () => AudioContext;
    };

    const audioContext = repl.audioContext ?? repl.getAudioContext?.();
    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume();
    }
  } catch {
    // Audio context may not be available, continue anyway
  }
}

export async function initStrudel(): Promise<void> {
  // Already initialized
  if (runtime.isInitialized) return;

  // If initialization is in progress, wait for it instead of starting another
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const {
        initStrudel: init,
        samples,
        soundMap,
        registerSound,
        getAudioContext,
        getSoundIndex,
      } = await import("@strudel/web");
      const { registerSoundfontsWithRegister } = await import(
        "./soundfonts"
      );

      // initStrudel returns a promise that resolves to the repl instance
      // prebake loads the same samples as strudel.cc
      const ds = "https://raw.githubusercontent.com/felixroos/dough-samples/main";
      const repl = await init({
        prebake: async () => {
          await Promise.all([
            // Full Dirt-Samples library (bd, sd, hh, cp, 808, 909, etc.)
            // This is the same sample set used by strudel.cc
            samples(
              "https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/strudel.json"
            ),
            // Drum machines with full names (RolandTR909_bd, RolandTR808_bd, etc.)
            samples(`${ds}/tidal-drum-machines.json`),
            // Piano (Salamander Grand Piano)
            samples(`${ds}/piano.json`),
            // Emu SP12 sampler
            samples(`${ds}/EmuSP12.json`),
            // VCSL orchestral/percussion samples
            samples(`${ds}/vcsl.json`),
            // Mridangam (Indian percussion)
            samples(`${ds}/mridangam.json`),
          ]);

          // Register General MIDI soundfonts (gm_piano, gm_pad_warm, etc.)
          // Using custom loader to avoid module duplication issues
          registerSoundfontsWithRegister(
            registerSound,
            getAudioContext,
            getSoundIndex
          );

          // Official strudel.cc drum machine bank aliases
          // Maps full bank names to short aliases (e.g., RolandTR909 -> TR909)
          const bankAliases: Record<string, string> = {
            "AJKPercusyn": "Percusyn",
            "AkaiLinn": "Linn",
            "AkaiMPC60": "MPC60",
            "AkaiXR10": "XR10",
            "AlesisHR16": "HR16",
            "AlesisSR16": "SR16",
            "BossDR110": "DR110",
            "BossDR220": "DR220",
            "BossDR55": "DR55",
            "BossDR550": "DR550",
            "CasioRZ1": "RZ1",
            "CasioSK1": "SK1",
            "CasioVL1": "VL1",
            "DoepferMS404": "MS404",
            "EmuDrumulator": "Drumulator",
            "EmuSP12": "SP12",
            "KorgDDM110": "DDM110",
            "KorgKPR77": "KPR77",
            "KorgKR55": "KR55",
            "KorgKRZ": "KRZ",
            "KorgM1": "M1",
            "KorgMinipops": "Minipops",
            "KorgPoly800": "Poly800",
            "KorgT3": "T3",
            "Linn9000": "9000",
            "LinnLM1": "LM1",
            "LinnLM2": "LM2",
            "MoogConcertMateMG1": "ConcertMateMG1",
            "OberheimDMX": "DMX",
            "RhodesPolaris": "Polaris",
            "RhythmAce": "Ace",
            "RolandCompurhythm1000": "Compurhythm1000",
            "RolandCompurhythm78": "Compurhythm78",
            "RolandCompurhythm8000": "Compurhythm8000",
            "RolandD110": "D110",
            "RolandD70": "D70",
            "RolandDDR30": "DDR30",
            "RolandJD990": "JD990",
            "RolandMC202": "MC202",
            "RolandMC303": "MC303",
            "RolandMT32": "MT32",
            "RolandR8": "R8",
            "RolandS50": "S50",
            "RolandSH09": "SH09",
            "RolandSystem100": "System100",
            "RolandTR505": "TR505",
            "RolandTR606": "TR606",
            "RolandTR626": "TR626",
            "RolandTR707": "TR707",
            "RolandTR727": "TR727",
            "RolandTR808": "TR808",
            "RolandTR909": "TR909",
            "SakataDPM48": "DPM48",
            "SequentialCircuitsDrumtracks": "CircuitsDrumtracks",
            "SequentialCircuitsTom": "CircuitsTom",
            "SimmonsSDS400": "SDS400",
            "SimmonsSDS5": "SDS5",
            "SoundmastersR88": "R88",
            "UnivoxMicroRhythmer12": "MicroRhythmer12",
            "ViscoSpaceDrum": "SpaceDrum",
            "XdrumLM8953": "LM8953",
            "YamahaRM50": "RM50",
            "YamahaRX21": "RX21",
            "YamahaRX5": "RX5",
            "YamahaRY30": "RY30",
            "YamahaTG33": "TG33",
          };

          const smap = soundMap.get();

          // Create aliases using official strudel.cc bank mapping
          // e.g., rolandtr909_bd -> TR909_bd (and also tr909_bd for convenience)
          for (const [fullBank, shortBank] of Object.entries(bankAliases)) {
            const fullBankLower = fullBank.toLowerCase();
            const shortBankLower = shortBank.toLowerCase();

            // Find all samples with this bank prefix
            for (const key of Object.keys(smap)) {
              const keyLower = key.toLowerCase();
              if (keyLower.startsWith(fullBankLower + "_")) {
                // Get the drum type suffix (e.g., "_bd", "_hh")
                const suffix = keyLower.slice(fullBankLower.length);

                // Create official case alias: TR909_bd
                const officialAlias = shortBank + suffix;
                if (!smap[officialAlias]) {
                  soundMap.setKey(officialAlias, smap[key]);
                }

                // Create lowercase alias: tr909_bd
                const lowerAlias = shortBankLower + suffix;
                if (!smap[lowerAlias]) {
                  soundMap.setKey(lowerAlias, smap[key]);
                }
              }
            }
          }
        },
      });

      runtime.repl = repl;
      runtime.isInitialized = true;
      runtime.lastError = null;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      runtime.lastError = err;
      errorCallback?.(err);
      throw err;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export async function evaluate(code: string, autoplay = true): Promise<void> {
  if (!runtime.isInitialized) {
    throw new Error("Strudel not initialized. Call initStrudel() first.");
  }

  // Resume AudioContext if suspended before playback
  if (autoplay) {
    await resumeAudioContext();
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

  // Resume AudioContext if suspended
  await resumeAudioContext();

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
  initPromise = null;
}
