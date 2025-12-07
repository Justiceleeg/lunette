/**
 * Concept taxonomy for pattern tagging and discovery
 * Based on the BrainLift pedagogical methodology
 */

export type ConceptCategory =
  | "rhythm"
  | "melody"
  | "harmony"
  | "structure"
  | "texture"
  | "code";

export interface ConceptDefinition {
  id: string;
  name: string;
  description: string;
  category: ConceptCategory;
}

/**
 * All concept IDs grouped by category
 */
export const concepts: Record<ConceptCategory, string[]> = {
  rhythm: [
    "syncopation",
    "polyrhythm",
    "swing",
    "euclidean",
    "phasing",
    "four-on-floor",
  ],
  melody: [
    "scale",
    "arpeggio",
    "chord-tones",
    "passing-tones",
    "call-response",
  ],
  harmony: [
    "chord-progression",
    "parallel-harmony",
    "drone",
    "tension-release",
  ],
  structure: ["repetition", "variation", "layering", "builds", "drops"],
  texture: ["density", "space", "contrast", "timbre-blend"],
  code: ["functions", "randomness", "conditionals", "pattern-composition"],
};

/**
 * Human-readable descriptions for each concept
 * Used in tooltips, badges, and explanations
 */
export const conceptDescriptions: Record<string, string> = {
  // Rhythm
  syncopation: "Accents on unexpected beats—the 'off-beat' feel that makes music groove",
  polyrhythm: "Two or more conflicting rhythms playing at once",
  swing: "Unequal subdivision of beats—gives a 'jazzy' feel",
  euclidean: "Mathematically distributed hits across a pattern",
  phasing: "Gradual drift between layers that creates evolving patterns",
  "four-on-floor": "Kick drum on every beat—classic dance music foundation",

  // Melody
  scale: "A set of notes that work together (major, minor, pentatonic, etc.)",
  arpeggio: "Playing chord notes one at a time instead of all together",
  "chord-tones": "Notes that belong to the underlying harmony",
  "passing-tones": "Notes that connect chord tones—adding movement",
  "call-response": "Musical question and answer—a conversation in sound",

  // Harmony
  "chord-progression": "A sequence of chords that creates a musical journey",
  "parallel-harmony": "Same interval moving together—creates thickness",
  drone: "A sustained note that anchors changing melody above",
  "tension-release": "Building dissonance then resolving—creates emotion",

  // Structure
  repetition: "The same pattern recurring—creates familiarity",
  variation: "A pattern with modifications—keeps things interesting",
  layering: "Multiple patterns stacked—builds complexity",
  builds: "Gradual increase in intensity—anticipation",
  drops: "Sudden textural change—impact and surprise",

  // Texture
  density: "How many events per unit time—busy vs sparse",
  space: "Silence and gaps in the pattern—as important as notes",
  contrast: "Difference between sections—creates interest",
  "timbre-blend": "How different sounds combine and interact",

  // Code Techniques
  functions: "Reusable pattern definitions—DRY code",
  randomness: "Probabilistic elements—controlled chaos",
  conditionals: "Pattern logic—different behavior based on conditions",
  "pattern-composition": "Combining patterns with operators like stack and cat",
};

/**
 * Get all concepts as a flat list with their definitions
 */
export function getAllConcepts(): ConceptDefinition[] {
  const result: ConceptDefinition[] = [];

  for (const category of Object.keys(concepts) as ConceptCategory[]) {
    for (const id of concepts[category]) {
      result.push({
        id,
        name: formatConceptName(id),
        description: conceptDescriptions[id] || "",
        category,
      });
    }
  }

  return result;
}

/**
 * Get concepts for a specific category
 */
export function getConceptsByCategory(
  category: ConceptCategory
): ConceptDefinition[] {
  return concepts[category].map((id) => ({
    id,
    name: formatConceptName(id),
    description: conceptDescriptions[id] || "",
    category,
  }));
}

/**
 * Get a single concept by ID
 */
export function getConcept(id: string): ConceptDefinition | undefined {
  for (const category of Object.keys(concepts) as ConceptCategory[]) {
    if (concepts[category].includes(id)) {
      return {
        id,
        name: formatConceptName(id),
        description: conceptDescriptions[id] || "",
        category,
      };
    }
  }
  return undefined;
}

/**
 * Get the category for a concept ID
 */
export function getConceptCategory(id: string): ConceptCategory | undefined {
  for (const category of Object.keys(concepts) as ConceptCategory[]) {
    if (concepts[category].includes(id)) {
      return category;
    }
  }
  return undefined;
}

/**
 * Format concept ID to human-readable name
 * e.g., "four-on-floor" -> "Four on Floor"
 */
export function formatConceptName(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Category display names and descriptions
 */
export const categoryInfo: Record<
  ConceptCategory,
  { name: string; description: string; icon: string }
> = {
  rhythm: {
    name: "Rhythm",
    description: "Time, beats, and groove",
    icon: "🥁",
  },
  melody: {
    name: "Melody",
    description: "Notes and musical lines",
    icon: "🎵",
  },
  harmony: {
    name: "Harmony",
    description: "Chords and vertical sound",
    icon: "🎹",
  },
  structure: {
    name: "Structure",
    description: "Form and arrangement",
    icon: "🏗️",
  },
  texture: {
    name: "Texture",
    description: "Sonic character and feel",
    icon: "🎨",
  },
  code: {
    name: "Code Techniques",
    description: "Programming patterns",
    icon: "💻",
  },
};
