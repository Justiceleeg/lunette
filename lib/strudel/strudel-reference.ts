/**
 * Transforms @strudel/reference data into the format used by the Reference Panel
 * Provides comprehensive function documentation organized by category
 *
 * This file imports all Strudel function documentation from @strudel/reference
 * and organizes it into logical categories for browsing and search.
 */

import { reference } from "@strudel/reference";

// ============================================================================
// Type Definitions
// ============================================================================

export interface FunctionExample {
  code: string;
  description?: string;
}

export interface FunctionDef {
  name: string;
  description: string;
  signature?: string;
  examples: FunctionExample[];
  aliases?: string[];
  related?: string[];
}

export interface Category {
  name: string;
  description?: string;
  functions: FunctionDef[];
}

// Type for reference entries from @strudel/reference
interface ReferenceEntry {
  name: string;
  description?: string;
  params?: Array<{
    name: string;
    type?: { names: string[] };
    description?: string;
    optional?: boolean;
  }>;
  examples?: string[];
  synonyms?: string[];
  synonyms_text?: string;
  returns?: {
    type?: { names: string[] };
    description?: string;
  };
}

// Reference data from @strudel/reference
// Structure: { reference: { docs: ReferenceEntry[] } }
const referenceData: ReferenceEntry[] = reference?.docs ?? [];

// ============================================================================
// Category Definitions
// ============================================================================

/**
 * Category definitions with explicit function lists and keywords for matching.
 * Functions are listed in recommended learning order within each category.
 */
const CATEGORY_DEFINITIONS: Array<{
  name: string;
  description: string;
  keywords: string[];
  functions: string[];
}> = [
  // -------------------------------------------------------------------------
  // Sound Sources
  // -------------------------------------------------------------------------
  {
    name: "Sound Sources",
    description: "Create sounds using samples or synthesizers",
    keywords: ["sound", "sample", "synth", "instrument", "source"],
    functions: [
      "s", "sound", "note", "n", "freq", "midinote", "bank", "samples", "samplesCached",
      "aliasBank", "source", "unison", "channels",
      // FM synthesis
      "fm", "fmi", "fmh", "fmwave", "ftype",
      // Noise types
      "noise", "pink", "white", "brown",
      // Experimental
      "csoundm", "byteBeatExpression", "byteBeatStartTime", "chyx",
      // SuperDirt synths
      "superpiano", "supergong", "supervibe", "superhammond", "superhoover",
      "superzow", "superchip", "superfork", "supersaw", "supersquare",
      "superpwm", "supercomparator", "superreese",
    ],
  },

  // -------------------------------------------------------------------------
  // Pattern Constructors
  // -------------------------------------------------------------------------
  {
    name: "Pattern Constructors",
    description: "Build and sequence patterns",
    keywords: ["pattern", "sequence", "construct", "build"],
    functions: [
      "pure", "silence", "rest", "mini", "m", "miniLocations",
      "cat", "seq", "sequence", "slowcat", "fastcat", "slowcatPrime",
      "stack", "layer", "polyrhythm", "polymeter",
      "alt", "alternate", "timeCat", "timecat", "arrange", "ur",
      "inhabit", "inhabitmod", "seqPLoop", "sequenceP", "tour",
      // Euclidean
      "euclid", "euclidRot", "euclidLegato", "euclidLegatoRot", "euclidish",
      // Run/scan
      "run", "scan",
    ],
  },

  // -------------------------------------------------------------------------
  // Timing
  // -------------------------------------------------------------------------
  {
    name: "Timing",
    description: "Control speed, timing, and temporal aspects",
    keywords: ["speed", "time", "tempo", "cycle", "shift", "fast", "slow"],
    functions: [
      "fast", "slow", "hurry", "sparsity", "density",
      "compress", "compressTo", "stretch", "fastGap", "slowGap",
      "early", "late", "off", "offWith",
      "cpm", "setcpm", "setCps", "cps",
      "linger", "zoom", "inside", "outside", "section",
      "rotL", "rotR", "duration", "pace",
      // Time signals
      "time", "beat",
    ],
  },

  // -------------------------------------------------------------------------
  // Pitch & Harmony
  // -------------------------------------------------------------------------
  {
    name: "Pitch & Harmony",
    description: "Control pitch, notes, scales, chords, and arpeggios",
    keywords: ["pitch", "note", "scale", "chord", "arpeggio", "transpose"],
    functions: [
      "add", "sub", "transpose", "octave", "oc", "oct",
      "scale", "scaleTranspose", "detune", "tune", "cents",
      "voicing", "voicings", "addVoicings", "rootNotes", "chord",
      "interval", "up", "down", "freq", "hz", "midi2note", "invert",
      // Arpeggios
      "arp", "arpWith",
    ],
  },

  // -------------------------------------------------------------------------
  // Dynamics & Compression
  // -------------------------------------------------------------------------
  {
    name: "Dynamics",
    description: "Control volume, velocity, compression, and dynamics",
    keywords: ["volume", "gain", "velocity", "compress", "duck"],
    functions: [
      "gain", "amp", "velocity", "vel", "postgain",
      "accent", "accentWith", "orbit",
      // Compression & ducking
      "compressor", "duckattack", "duckdepth", "duckorbit",
    ],
  },

  // -------------------------------------------------------------------------
  // Sample Control
  // -------------------------------------------------------------------------
  {
    name: "Sample Control",
    description: "Manipulate sample playback - slicing, looping, and speed",
    keywords: ["sample", "slice", "chop", "loop", "playback"],
    functions: [
      "speed", "accelerate", "unit", "begin", "end", "cut", "clip",
      "loop", "loopAt", "loopAtCps", "loopBegin", "loopEnd",
      "slice", "splice", "chop", "striate", "striateBy", "gap", "randslice",
      "legato", "sustain",
      // Pick variations
      "pick", "pickF", "pickmod", "pickRestart", "pickOut", "pickReset",
      "pickmodF", "pickmodOut", "pickmodReset", "pickmodRestart",
    ],
  },

  // -------------------------------------------------------------------------
  // Filters
  // -------------------------------------------------------------------------
  {
    name: "Filters",
    description: "Shape frequency content with filters",
    keywords: ["filter", "lpf", "hpf", "cutoff", "resonance"],
    functions: [
      // Low-pass
      "lpf", "lowpass", "lp", "lpq", "lpattack", "lpdecay", "lpenv", "lpsustain", "lprelease",
      // High-pass
      "hpf", "highpass", "hp", "hpq", "hpattack", "hpdecay", "hpenv", "hpsustain", "hprelease",
      // Band-pass
      "bpf", "bandpass", "bp", "bpq", "bpattack", "bpdecay", "bpenv", "bpsustain", "bprelease",
      // Other
      "vowel", "formant", "djf", "djfWith", "hicut", "locut", "midicut",
    ],
  },

  // -------------------------------------------------------------------------
  // Delay & Reverb
  // -------------------------------------------------------------------------
  {
    name: "Delay & Reverb",
    description: "Add space and echo effects",
    keywords: ["delay", "reverb", "echo", "room", "space"],
    functions: [
      "delay", "delaytime", "delayt", "delayfeedback", "delayfb", "delaysync", "lock",
      "room", "roomsize", "size", "roomlp", "roomfade", "roomdim", "dry",
      "leslie", "lrate", "lsize", "iresponse",
    ],
  },

  // -------------------------------------------------------------------------
  // Distortion
  // -------------------------------------------------------------------------
  {
    name: "Distortion",
    description: "Add grit, crunch, and saturation",
    keywords: ["distort", "crush", "overdrive"],
    functions: [
      "distort", "shape", "triode", "crush", "coarse", "squiz", "drive", "krush", "kcutoff",
    ],
  },

  // -------------------------------------------------------------------------
  // Modulation
  // -------------------------------------------------------------------------
  {
    name: "Modulation",
    description: "Add movement with modulation effects",
    keywords: ["modulate", "vibrato", "tremolo", "phaser", "chorus"],
    functions: [
      // Phaser
      "phaser", "phaserrate", "phaserdepth", "phasercenter", "phasersweep",
      // Chorus
      "chorus", "chorusrate", "chorusdepth",
      // Vibrato/tremolo
      "vibrato", "vibmod", "vib",
      "tremolo", "tremolodepth", "tremolorate", "tremolophase", "tremoloshape", "tremoloskew", "tremolosync",
      // Ring mod
      "ring", "ringf", "ringdf",
      // Pulse width
      "pw", "pwrate", "pwsweep",
    ],
  },

  // -------------------------------------------------------------------------
  // Spatial
  // -------------------------------------------------------------------------
  {
    name: "Spatial",
    description: "Control stereo position and spatial effects",
    keywords: ["pan", "stereo", "jux", "width"],
    functions: [
      "pan", "panspan", "pansplay", "panwidth", "panorient", "panchor",
      "jux", "juxBy", "juxcut", "width", "binshift", "fanchor",
    ],
  },

  // -------------------------------------------------------------------------
  // Envelopes
  // -------------------------------------------------------------------------
  {
    name: "Envelopes",
    description: "Shape sounds over time with ADSR envelopes",
    keywords: ["envelope", "attack", "decay", "sustain", "release", "adsr"],
    functions: [
      "attack", "decay", "sustain", "release", "hold", "env", "adsr",
      // Pitch envelope
      "pattack", "pdecay", "penv", "prelease", "pcurve",
      // FM envelopes
      "fmenv", "fmattack", "fmdecay", "fmsustain", "fmrelease",
    ],
  },

  // -------------------------------------------------------------------------
  // Layering & Combining
  // -------------------------------------------------------------------------
  {
    name: "Layering",
    description: "Combine and layer multiple patterns",
    keywords: ["stack", "layer", "combine", "superimpose"],
    functions: [
      "stack", "layer", "overlay", "superimpose", "sup",
      "stut", "stutWith", "ply", "plyWith", "echo", "echoWith", "bite", "biteWith",
      "add", "sub", "mul", "div", "mod",
      "xfade", "morph",
    ],
  },

  // -------------------------------------------------------------------------
  // Randomness
  // -------------------------------------------------------------------------
  {
    name: "Randomness",
    description: "Add controlled unpredictability",
    keywords: ["random", "chance", "probability", "shuffle"],
    functions: [
      "sometimes", "sometimesBy", "rarely", "almostNever", "often", "almostAlways", "never", "always",
      "degrade", "degradeBy", "undegradeBy", "undegrade",
      "shuffle", "shuffleWith", "scramble",
      "choose", "choose2", "chooseWith", "chooseInWith", "chooseCycles",
      "wchoose", "wchooseBy", "wchooseCycles", "randcat", "wrandcat",
      "rand", "rand2", "irand", "brand", "brandBy", "perlin", "perlinWith",
      "randslice", "randomSample", "seed", "seedWith",
    ],
  },

  // -------------------------------------------------------------------------
  // Cyclic Transformations
  // -------------------------------------------------------------------------
  {
    name: "Cyclic",
    description: "Apply changes on specific cycles",
    keywords: ["every", "cycle", "when", "first", "last"],
    functions: [
      "every", "everyCycle", "firstOf", "lastOf",
      "when", "whenmod", "whenKey", "while",
      "within", "withinArc",
      "focus", "brak",
      "fadeIn", "fadeOut", "fadeInOut",
      "someCycles", "someCyclesBy", "repeatCycles",
    ],
  },

  // -------------------------------------------------------------------------
  // Ordering & Rearranging
  // -------------------------------------------------------------------------
  {
    name: "Order",
    description: "Rearrange and reorder pattern elements",
    keywords: ["reverse", "rotate", "palindrome", "permute"],
    functions: [
      "rev", "reverse", "palindrome",
      "iter", "iterBack",
      "chunk", "chunkBack", "chunkInto", "chunkBackInto", "fastChunk",
      "rotate", "rot", "rotL", "rotR",
      "swing", "swingBy",
      "permute", "permuteWith",
      "drop", "take",
    ],
  },

  // -------------------------------------------------------------------------
  // Structure
  // -------------------------------------------------------------------------
  {
    name: "Structure",
    description: "Control pattern structure",
    keywords: ["struct", "mask", "rhythm", "structure"],
    functions: [
      "struct", "structAll", "mask", "unMask",
      "fit", "fitWith", "segment", "range", "rangex", "range2",
      "steps", "stepJoin", "stepcat", "stepalt",
      "binary", "ascii", "binaryN",
      "press", "pressBy", "contract", "expand", "extend", "shrink", "grow",
      "reset", "restart", "hush",
    ],
  },

  // -------------------------------------------------------------------------
  // Signals & LFOs
  // -------------------------------------------------------------------------
  {
    name: "Signals",
    description: "Continuous control patterns and LFO shapes",
    keywords: ["sine", "saw", "tri", "wave", "lfo", "signal"],
    functions: [
      "sine", "cosine", "sine2", "cosine2",
      "saw", "saw2", "isaw", "isaw2",
      "tri", "tri2", "itri", "itri2",
      "square", "square2",
      "rand", "irand", "perlin", "perlinWith",
      "range", "rangex", "rangeFloor",
      "segment", "floor", "ceil", "round", "smooth", "discretise", "discreteOnly",
      "fromBipolar", "toBipolar", "berlin",
    ],
  },

  // -------------------------------------------------------------------------
  // Pattern Combinators
  // -------------------------------------------------------------------------
  {
    name: "Pattern Combinators",
    description: "Higher-order pattern operations",
    keywords: ["apply", "combine", "transform", "combinator"],
    functions: [
      "apply", "applyArg", "applyLeft", "applyRight",
      "appLeft", "appRight", "appBoth", "appWhole",
      "set", "setIn", "setOut", "keep", "keepif", "setS", "keepS",
      "squeeze", "squeezeJoin", "spread", "spreadf", "spreadChoose",
      "focus", "focusSpan", "fix", "unfix", "contrast", "contrastBy",
      "fmap", "filter", "filterWhen", "into", "each",
      "zip", "ratio",
    ],
  },

  // -------------------------------------------------------------------------
  // MIDI & OSC
  // -------------------------------------------------------------------------
  {
    name: "MIDI & OSC",
    description: "External device communication",
    keywords: ["midi", "osc", "cc", "control"],
    functions: [
      "midi", "midichan", "midicmd", "midimap", "defaultmidimap", "midimaps",
      "cc", "ccn", "ccv", "control", "progNum",
      "velocity", "vel", "channel",
      "midin", "midiport", "midibend", "miditouch", "pitchwheel",
      "nrpnn", "nrpv", "sysex", "sysexdata", "sysexid",
      "osc",
    ],
  },

  // -------------------------------------------------------------------------
  // Visualization
  // -------------------------------------------------------------------------
  {
    name: "Visualization",
    description: "Visualize patterns",
    keywords: ["visual", "color", "display", "scope"],
    functions: [
      "color", "colour", "hue", "saturation", "lightness", "alpha",
      "pianoroll", "spiral", "scope", "fscope", "spectrum",
      "log", "logValues", "drawLine", "wordfall", "markcss",
    ],
  },

  // -------------------------------------------------------------------------
  // Input & Sensors
  // -------------------------------------------------------------------------
  {
    name: "Input & Sensors",
    description: "Mouse, keyboard, and device sensor input",
    keywords: ["mouse", "keyboard", "sensor", "input", "control"],
    functions: [
      "mousex", "mousey", "keyDown", "slider", "scrub", "ribbon",
      // Device orientation
      "orientationAlpha", "orientationBeta", "orientationGamma",
      "absoluteOrientationAlpha", "absoluteOrientationBeta", "absoluteOrientationGamma",
      "rotationAlpha", "rotationBeta", "rotationGamma",
      // Acceleration
      "accelerationX", "accelerationY", "accelerationZ",
      "gravityX", "gravityY", "gravityZ",
    ],
  },

  // -------------------------------------------------------------------------
  // Utility & Labels
  // -------------------------------------------------------------------------
  {
    name: "Utility",
    description: "Utility functions and helpers",
    keywords: ["utility", "helper", "label", "tag"],
    functions: [
      "label", "tag", "as", "ref", "register",
      "showFirstCycle", "firstCycle", "firstCycleValues",
      "getFreq", "onTriggerTime", "onsetsOnly",
    ],
  },
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Strip HTML tags from a string
 */
function stripHtml(html: string): string {
  return html
    .replace(/<code[^>]*>/gi, "`")
    .replace(/<\/code>/gi, "`")
    .replace(/<a[^>]*>/gi, "")
    .replace(/<\/a>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Clean up description text for display
 */
function cleanDescription(desc: string): string {
  const stripped = stripHtml(desc);

  // If description is too long, truncate at sentence boundary
  if (stripped.length > 200) {
    const sentenceEnd = stripped.search(/[.!?]\s/);
    if (sentenceEnd > 50 && sentenceEnd < 200) {
      return stripped.slice(0, sentenceEnd + 1);
    }
    const truncated = stripped.slice(0, 180);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 100) {
      return truncated.slice(0, lastSpace) + "...";
    }
    return truncated + "...";
  }

  return stripped;
}

/**
 * Build function signature from params
 */
function buildSignature(entry: ReferenceEntry): string | undefined {
  if (!entry.params || entry.params.length === 0) {
    return undefined;
  }

  const params = entry.params
    .map((p) => {
      const type = p.type?.names?.join(" | ") || "any";
      const opt = p.optional ? "?" : "";
      return `${p.name}${opt}: ${type}`;
    })
    .join(", ");

  return `(${params})`;
}

/**
 * Convert example code strings to FunctionExample format
 */
function convertExamples(examples: string[] | undefined): FunctionExample[] {
  if (!examples || examples.length === 0) {
    return [];
  }

  // Take up to 4 examples, clean them up
  return examples.slice(0, 4).map((code) => {
    // Clean up the example code
    const cleaned = code
      .trim()
      // Remove HTML if present
      .replace(/<[^>]*>/g, "")
      // Normalize whitespace in single-line examples
      .replace(/\s+/g, " ");

    return { code: cleaned };
  });
}

/**
 * Convert a ReferenceEntry to FunctionDef format
 */
function convertToFunctionDef(entry: ReferenceEntry): FunctionDef {
  return {
    name: entry.name,
    description: entry.description ? cleanDescription(entry.description) : "",
    signature: buildSignature(entry),
    examples: convertExamples(entry.examples),
    aliases:
      entry.synonyms && entry.synonyms.length > 0 ? entry.synonyms : undefined,
  };
}

// ============================================================================
// Reference Building
// ============================================================================

/**
 * Build function lookup map for O(1) access by name
 */
function buildFunctionLookup(): Map<string, ReferenceEntry> {
  const map = new Map<string, ReferenceEntry>();

  for (const entry of referenceData) {
    // Skip invalid entries
    if (!entry.name) continue;
    if (entry.name.startsWith("exports.")) continue;
    if (entry.name.startsWith("_") && !entry.name.startsWith("_rot")) continue;

    map.set(entry.name, entry);

    // Also index by synonyms
    if (entry.synonyms) {
      for (const alias of entry.synonyms) {
        if (!map.has(alias)) {
          map.set(alias, entry);
        }
      }
    }
  }

  return map;
}

/**
 * Check if a function name matches any category
 */
function getCategoryForFunction(
  name: string
): { name: string; description: string } | null {
  for (const cat of CATEGORY_DEFINITIONS) {
    if (cat.functions.includes(name)) {
      return { name: cat.name, description: cat.description };
    }
  }
  return null;
}

/**
 * Build the complete categorized reference from @strudel/reference
 */
function buildStrudelReference(): Category[] {
  const lookup = buildFunctionLookup();
  const categorizedFunctions = new Set<string>();
  const categories: Category[] = [];

  // Build each defined category
  for (const catDef of CATEGORY_DEFINITIONS) {
    const functions: FunctionDef[] = [];

    for (const funcName of catDef.functions) {
      const entry = lookup.get(funcName);
      if (entry && !categorizedFunctions.has(entry.name)) {
        functions.push(convertToFunctionDef(entry));
        categorizedFunctions.add(entry.name);
      }
    }

    // Only add category if it has functions
    if (functions.length > 0) {
      categories.push({
        name: catDef.name,
        description: catDef.description,
        functions,
      });
    }
  }

  // Collect remaining uncategorized functions
  const otherFunctions: FunctionDef[] = [];
  for (const entry of referenceData) {
    // Skip invalid entries
    if (!entry.name) continue;
    if (entry.name.startsWith("exports.")) continue;
    if (entry.name.startsWith("_")) continue;

    // Skip already categorized
    if (categorizedFunctions.has(entry.name)) continue;

    // Skip if no description (likely internal)
    if (!entry.description) continue;

    otherFunctions.push(convertToFunctionDef(entry));
    categorizedFunctions.add(entry.name);
  }

  // Add "Other Functions" category if there are uncategorized functions
  if (otherFunctions.length > 0) {
    // Sort alphabetically for easier browsing
    otherFunctions.sort((a, b) => a.name.localeCompare(b.name));

    categories.push({
      name: "Other Functions",
      description: "Additional Strudel functions and utilities",
      functions: otherFunctions,
    });
  }

  return categories;
}

// ============================================================================
// Exports
// ============================================================================

/**
 * The complete Strudel function reference, organized by category.
 * This is built once at module load time from @strudel/reference.
 */
export const STRUDEL_REFERENCE: Category[] = buildStrudelReference();

/**
 * Map of function names to their reference entries for quick lookup.
 * Includes synonyms/aliases as keys pointing to the main entry.
 */
export const functionLookup: Map<string, ReferenceEntry> = buildFunctionLookup();

/**
 * Get a function definition by name (including aliases)
 */
export function getFunctionByName(name: string): FunctionDef | null {
  const entry = functionLookup.get(name);
  if (!entry) return null;
  return convertToFunctionDef(entry);
}

/**
 * Search functions by name, description, or alias
 */
export function searchFunctions(query: string): FunctionDef[] {
  const lowerQuery = query.toLowerCase();
  const results: FunctionDef[] = [];
  const seen = new Set<string>();

  for (const entry of referenceData) {
    if (!entry.name || seen.has(entry.name)) continue;
    if (entry.name.startsWith("exports.")) continue;
    if (entry.name.startsWith("_")) continue;

    const nameMatch = entry.name.toLowerCase().includes(lowerQuery);
    const descMatch = entry.description
      ?.toLowerCase()
      .includes(lowerQuery);
    const aliasMatch = entry.synonyms?.some((s) =>
      s.toLowerCase().includes(lowerQuery)
    );

    if (nameMatch || descMatch || aliasMatch) {
      results.push(convertToFunctionDef(entry));
      seen.add(entry.name);
    }
  }

  return results;
}

/**
 * Get total count of available functions
 */
export function getTotalFunctionCount(): number {
  let count = 0;
  for (const category of STRUDEL_REFERENCE) {
    count += category.functions.length;
  }
  return count;
}
