import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import {
  buildAnalysisPrompt,
  parseAnalysisResponse,
  type AnalysisResponse,
} from "@/lib/ai/analysis-prompt";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { conceptTags, userDiscoveries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { errorResponse, apiErrorHandler } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, patternId, saveDiscoveries } = body as {
      code: string;
      patternId?: string;
      saveDiscoveries?: boolean;
    };

    console.log("Analyze request:", { codeLength: code?.length, patternId, saveDiscoveries });

    if (!code || typeof code !== "string") {
      return errorResponse("VALIDATION_ERROR", "Code is required for analysis");
    }

    // Get current session (optional - analysis works for non-authenticated users too)
    let userId: string | undefined;
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      userId = session?.user?.id;
    } catch (authError) {
      console.log("Auth check failed (continuing without user):", authError);
    }

    // Build the analysis prompt
    const systemPrompt = buildSystemPrompt();
    const analysisPrompt = buildAnalysisPrompt(code);

    console.log("Calling OpenAI...");

    // Use generateText for a single response (not streaming)
    const result = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: analysisPrompt,
    });

    console.log("OpenAI response received, length:", result.text.length);

    // Parse the response
    const analysis = parseAnalysisResponse(result.text);

    if (!analysis) {
      // If parsing failed, return error with raw response for debugging
      return errorResponse("AI_ERROR", "Failed to parse analysis response");
    }

    // Optionally save concept tags for the pattern
    if (patternId && analysis.concepts.length > 0) {
      await saveConceptTags(patternId, analysis.concepts);
    }

    // Optionally record user discoveries
    if (saveDiscoveries && userId && analysis.concepts.length > 0) {
      await recordDiscoveries(userId, analysis.concepts, patternId);
    }

    return Response.json(analysis);
  } catch (error) {
    return apiErrorHandler(error);
  }
}

/**
 * Save concept tags for a pattern
 */
async function saveConceptTags(patternId: string, concepts: string[]) {
  try {
    // Delete existing tags for this pattern
    await db.delete(conceptTags).where(eq(conceptTags.patternId, patternId));

    // Insert new tags
    if (concepts.length > 0) {
      await db.insert(conceptTags).values(
        concepts.map((concept) => ({
          id: crypto.randomUUID(),
          patternId,
          concept,
          confidence: 1.0,
        }))
      );
    }
  } catch (error) {
    console.error("Failed to save concept tags:", error);
  }
}

/**
 * Record new concept discoveries for a user
 */
async function recordDiscoveries(
  userId: string,
  concepts: string[],
  patternId?: string
) {
  try {
    for (const concept of concepts) {
      // Check if user already discovered this concept
      const existing = await db
        .select()
        .from(userDiscoveries)
        .where(
          and(
            eq(userDiscoveries.userId, userId),
            eq(userDiscoveries.concept, concept)
          )
        )
        .limit(1);

      // Only record if this is a new discovery
      if (existing.length === 0) {
        await db.insert(userDiscoveries).values({
          id: crypto.randomUUID(),
          userId,
          concept,
          patternId: patternId || null,
        });
      }
    }
  } catch (error) {
    console.error("Failed to record discoveries:", error);
  }
}
