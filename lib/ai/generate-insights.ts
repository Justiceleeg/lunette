import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import {
  buildAnalysisPrompt,
  parseAnalysisResponse,
  type AnalysisResponse,
} from "@/lib/ai/analysis-prompt";

// Simple hash function for comparing code changes
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export interface InsightsResult {
  insights: AnalysisResponse;
  codeHash: string;
  insightsJson: string;
}

/**
 * Generate insights for a piece of code
 * Returns the analysis response, code hash, and JSON string for storage
 */
export async function generateInsights(
  code: string
): Promise<InsightsResult | null> {
  if (!code || typeof code !== "string" || !code.trim()) {
    return null;
  }

  try {
    const systemPrompt = buildSystemPrompt();
    const analysisPrompt = buildAnalysisPrompt(code);

    const result = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: analysisPrompt,
    });

    const analysis = parseAnalysisResponse(result.text);

    if (!analysis) {
      console.error("Failed to parse insights response:", result.text);
      return null;
    }

    const codeHash = hashCode(code.trim());

    return {
      insights: analysis,
      codeHash,
      insightsJson: JSON.stringify(analysis),
    };
  } catch (error) {
    console.error("Failed to generate insights:", error);
    return null;
  }
}
