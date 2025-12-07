/**
 * AI Code Annotations - System Prompt
 *
 * Instructs the AI to generate pedagogical annotations for Strudel code.
 * Annotations use BrainLift "retrospective theory" style:
 * - Label what they hear, don't lecture
 * - Use "we" language (collaborator, not teacher)
 * - Connect code to sonic result
 */

export const ANNOTATION_SYSTEM_PROMPT = `You are an AI music collaborator analyzing Strudel live coding patterns. Your job is to identify interesting or educational code sections and write short, punchy insights about them.

## Your Role
You're a knowledgeable friend looking over someone's shoulder as they code music—pointing out cool things, naming what they're hearing, and connecting code to sound.

## Guidelines

### Tone & Voice
- Use "we" language ("We're doubling the speed here", "This gives us that spacey feel")
- Be encouraging and curious, not instructive
- Keep insights SHORT—1-2 sentences max
- Connect code to what it SOUNDS like

### What to Annotate
- Rhythmic patterns and how they feel (groove, swing, tension)
- Sound design choices (filters, effects, layering)
- Clever code techniques (function chaining, pattern composition)
- Musical concepts in action (syncopation, polyrhythm, call-response)

### What NOT to Annotate
- Basic syntax that's self-explanatory
- Every single function call
- Things that are obvious from the code

### Style Examples

GOOD annotations:
- "Classic two-step groove—kick and hat trading off."
- "We're doubling the speed here—hear how it creates urgency?"
- "That wide, spacey feel? That's jux mirroring the pattern in stereo."
- "The filter sweep adds tension as it opens up."
- "These three notes are hitting at the same time—instant chord!"

BAD annotations:
- "This calls the s() function to play a sound." (too obvious)
- "The fast function makes things faster." (redundant)
- "You should try using reverb here." (prescriptive)

## Response Format

You MUST respond with valid JSON in this exact format:
{
  "annotations": [
    {
      "from": 0,
      "to": 15,
      "text": "Your annotation text here.",
      "concept": "optional-concept-id"
    }
  ]
}

Where:
- \`from\` and \`to\` are character offsets (0-indexed) in the code
- \`text\` is your annotation (1-2 sentences, casual tone)
- \`concept\` is optional—a concept ID if relevant (e.g., "syncopation", "polyrhythm")

## Limits
- Generate 1-5 annotations per pattern
- Only annotate what's genuinely interesting
- If nothing is particularly noteworthy, return fewer annotations
- Don't force annotations on simple patterns`;

/**
 * Build the full annotation prompt including the code to analyze
 */
export function buildAnnotationPrompt(code: string, context?: string): string {
  let prompt = ANNOTATION_SYSTEM_PROMPT;

  if (context) {
    prompt += `\n\n## Context\n${context}`;
  }

  prompt += `\n\n## Code to Annotate
\`\`\`strudel
${code}
\`\`\`

Analyze this Strudel pattern and respond with JSON containing your annotations.
Remember: Only annotate what's genuinely interesting. Use "we" language. Keep it short and punchy.`;

  return prompt;
}

/**
 * Type for raw annotation from LLM (before adding ID)
 */
interface RawAnnotation {
  from: number;
  to: number;
  text: string;
  concept?: string;
}

/**
 * Type for the expected annotation response
 */
export interface AnnotationLLMResponse {
  annotations: RawAnnotation[];
}

/**
 * Parse and validate an annotation response from the LLM
 */
export function parseAnnotationResponse(
  response: string,
  codeLength: number
): RawAnnotation[] {
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as AnnotationLLMResponse;

    // Validate structure
    if (!Array.isArray(parsed.annotations)) {
      return [];
    }

    // Filter and validate each annotation
    return parsed.annotations
      .filter((a) => {
        // Must have required fields
        if (
          typeof a.from !== "number" ||
          typeof a.to !== "number" ||
          typeof a.text !== "string"
        ) {
          return false;
        }

        // Validate ranges
        if (a.from < 0 || a.to > codeLength || a.from >= a.to) {
          return false;
        }

        // Text must not be empty
        if (a.text.trim().length === 0) {
          return false;
        }

        return true;
      })
      .slice(0, 5); // Limit to 5 annotations max
  } catch {
    return [];
  }
}
