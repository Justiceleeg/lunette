import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  buildAnnotationPrompt,
  parseAnnotationResponse,
} from "@/lib/ai/annotation-prompt";
import type {
  Annotation,
  AnnotationRequest,
  AnnotationResponse,
} from "@/lib/annotations/types";

/**
 * Generate unique annotation ID
 */
function generateAnnotationId(): string {
  return `ann_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(req: Request) {
  try {
    const { code, context } = (await req.json()) as AnnotationRequest;

    // Validate request
    if (!code || typeof code !== "string") {
      return Response.json(
        { error: "Code is required and must be a string" },
        { status: 400 }
      );
    }

    // Don't analyze very short code
    if (code.trim().length < 10) {
      return Response.json({ annotations: [] } satisfies AnnotationResponse);
    }

    // Build the prompt
    const prompt = buildAnnotationPrompt(code, context);

    // Generate annotations using non-streaming call
    const result = await generateText({
      model: openai("gpt-4o-mini"), // Use mini for faster, cheaper annotations
      system: prompt,
      messages: [
        {
          role: "user",
          content: "Generate annotations for the code provided.",
        },
      ],
      maxOutputTokens: 1000,
    });

    // Parse the response
    const rawAnnotations = parseAnnotationResponse(result.text, code.length);

    // Add IDs to annotations
    const annotations: Annotation[] = rawAnnotations.map((raw) => ({
      id: generateAnnotationId(),
      from: raw.from,
      to: raw.to,
      text: raw.text,
      concept: raw.concept,
    }));

    return Response.json({ annotations } satisfies AnnotationResponse);
  } catch (error) {
    console.error("Annotations API error:", error);
    return Response.json(
      {
        error: "Failed to generate annotations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
