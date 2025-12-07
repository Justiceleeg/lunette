import { concepts, conceptDescriptions } from "@/lib/concepts";

/**
 * Analysis mode extension for pattern explanation
 * Appended to system prompt when user clicks "Explain This"
 */
export const ANALYSIS_MODE_PROMPT = `
## ANALYSIS MODE
The user clicked "Explain This" to understand their current pattern.
Your job is to DISCOVER and LABEL the music theory concepts already present—not to teach prescriptively.

### Your Task
Analyze the pattern and explain:
1. What musical concepts are demonstrated (use proper terminology from the concept list below)
2. Why it sounds the way it does (connect code to sound)
3. What they might try changing to explore variations

Frame as "here's what you made" not "here's what you should learn."

### Response Format
You MUST respond with valid JSON in this exact format:
{
  "concepts": ["concept-id-1", "concept-id-2"],
  "explanation": "Your conversational explanation of what's happening musically...",
  "suggestions": [
    "Try changing X to Y to hear how it affects the groove",
    "Add .jux(rev) to create a stereo mirror effect"
  ]
}

### Concept Vocabulary
Use these standardized concept IDs for tagging. Only tag concepts that are clearly present:

${Object.entries(concepts)
  .map(
    ([category, ids]) =>
      `**${category.charAt(0).toUpperCase() + category.slice(1)}**\n${ids
        .map((id) => `- \`${id}\`: ${conceptDescriptions[id]}`)
        .join("\n")}`
  )
  .join("\n\n")}

### Guidelines
- Be specific about what code creates what sound
- Use the concept IDs exactly as listed (lowercase, hyphenated)
- Only tag concepts you're confident are present
- Keep explanation concise but illuminating
- Suggestions should be concrete code changes
- Connect theory to the actual listening experience
`;

/**
 * Build the full analysis prompt including the code to analyze
 */
export function buildAnalysisPrompt(code: string): string {
  return `${ANALYSIS_MODE_PROMPT}

## Pattern to Analyze
\`\`\`strudel
${code}
\`\`\`

Analyze this pattern and respond with JSON as specified above.`;
}

/**
 * Type for the expected analysis response
 */
export interface AnalysisResponse {
  concepts: string[];
  explanation: string;
  suggestions: string[];
}

/**
 * Parse and validate an analysis response from the LLM
 */
export function parseAnalysisResponse(
  response: string
): AnalysisResponse | null {
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (
      !Array.isArray(parsed.concepts) ||
      typeof parsed.explanation !== "string" ||
      !Array.isArray(parsed.suggestions)
    ) {
      return null;
    }

    // Filter concepts to only valid ones
    const validConcepts = Object.values(concepts).flat();
    const filteredConcepts = parsed.concepts.filter((c: string) =>
      validConcepts.includes(c)
    );

    return {
      concepts: filteredConcepts,
      explanation: parsed.explanation,
      suggestions: parsed.suggestions.filter(
        (s: unknown) => typeof s === "string"
      ),
    };
  } catch {
    return null;
  }
}
