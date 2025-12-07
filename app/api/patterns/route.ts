import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { patterns, conceptTags } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { generateInsights } from "@/lib/ai/generate-insights";
import { errorResponse, apiErrorHandler } from "@/lib/errors";

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return errorResponse("UNAUTHORIZED");
    }

    const userPatterns = await db
      .select()
      .from(patterns)
      .where(eq(patterns.authorId, session.user.id))
      .orderBy(desc(patterns.updatedAt));

    return Response.json({ patterns: userPatterns });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return errorResponse("UNAUTHORIZED");
    }

    const body = await req.json();
    const { name, code, isPublic = false, forkedFromId } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return errorResponse("VALIDATION_ERROR", "Pattern name is required");
    }

    if (!code || typeof code !== "string") {
      return errorResponse("VALIDATION_ERROR", "Pattern code is required");
    }

    // Determine originalAuthorId when forking
    let resolvedOriginalAuthorId: string | null = null;
    if (forkedFromId) {
      const [parentPattern] = await db
        .select()
        .from(patterns)
        .where(eq(patterns.id, forkedFromId))
        .limit(1);

      if (parentPattern) {
        // If parent has an originalAuthorId, use that (preserves chain)
        // Otherwise, use the parent's authorId as the original author
        resolvedOriginalAuthorId = parentPattern.originalAuthorId || parentPattern.authorId;
      }
    }

    const patternId = nanoid();

    // Generate insights for the pattern
    const insightsResult = await generateInsights(code);

    const newPattern = {
      id: patternId,
      name: name.trim(),
      code,
      authorId: session.user.id,
      isPublic: Boolean(isPublic),
      forkedFromId: forkedFromId || null,
      originalAuthorId: resolvedOriginalAuthorId,
      insights: insightsResult?.insightsJson || null,
      insightsCodeHash: insightsResult?.codeHash || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(patterns).values(newPattern);

    // Save concept tags if insights were generated
    if (insightsResult && insightsResult.insights.concepts.length > 0) {
      await db.insert(conceptTags).values(
        insightsResult.insights.concepts.map((concept) => ({
          id: crypto.randomUUID(),
          patternId,
          concept,
          confidence: 1.0,
        }))
      );
    }

    return Response.json({ pattern: newPattern }, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
