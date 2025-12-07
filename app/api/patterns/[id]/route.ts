import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { patterns, users, conceptTags } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { generateInsights } from "@/lib/ai/generate-insights";
import { errorResponse, apiErrorHandler } from "@/lib/errors";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    // Get pattern with author info
    const result = await db
      .select({
        pattern: patterns,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(patterns)
      .leftJoin(users, eq(patterns.authorId, users.id))
      .where(eq(patterns.id, id))
      .limit(1);

    if (result.length === 0 || !result[0].pattern) {
      return errorResponse("NOT_FOUND", "Pattern not found");
    }

    const { pattern, author } = result[0];

    // If pattern is private, check if user is the author
    if (!pattern.isPublic) {
      if (!session?.user || session.user.id !== pattern.authorId) {
        return errorResponse("NOT_FOUND", "Pattern not found");
      }
    }

    // Get original author info if this is a fork
    let originalAuthor = null;
    if (pattern.originalAuthorId) {
      const [origAuthor] = await db
        .select({
          id: users.id,
          name: users.name,
          image: users.image,
        })
        .from(users)
        .where(eq(users.id, pattern.originalAuthorId))
        .limit(1);
      originalAuthor = origAuthor || null;
    }

    // Get forked from pattern info if this is a fork
    let forkedFrom = null;
    if (pattern.forkedFromId) {
      const forkedResult = await db
        .select({
          pattern: {
            id: patterns.id,
            name: patterns.name,
          },
          author: {
            id: users.id,
            name: users.name,
          },
        })
        .from(patterns)
        .leftJoin(users, eq(patterns.authorId, users.id))
        .where(eq(patterns.id, pattern.forkedFromId))
        .limit(1);

      if (forkedResult.length > 0) {
        forkedFrom = {
          id: forkedResult[0].pattern.id,
          name: forkedResult[0].pattern.name,
          author: forkedResult[0].author,
        };
      }
    }

    return Response.json({
      pattern: {
        ...pattern,
        author,
        originalAuthor,
        forkedFrom,
      }
    });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return errorResponse("UNAUTHORIZED");
    }

    // Check if pattern exists and user owns it
    const [existingPattern] = await db
      .select()
      .from(patterns)
      .where(and(eq(patterns.id, id), eq(patterns.authorId, session.user.id)))
      .limit(1);

    if (!existingPattern) {
      return errorResponse("NOT_FOUND", "Pattern not found or you don't have permission to edit it");
    }

    const body = await req.json();
    const { name, code, isPublic } = body;

    const updates: Partial<typeof patterns.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return errorResponse("VALIDATION_ERROR", "Pattern name cannot be empty");
      }
      updates.name = name.trim();
    }

    // Track if code is being updated
    let codeChanged = false;

    if (code !== undefined) {
      if (typeof code !== "string") {
        return errorResponse("VALIDATION_ERROR", "Invalid code format");
      }
      updates.code = code;
      codeChanged = code !== existingPattern.code;
    }

    if (isPublic !== undefined) {
      updates.isPublic = Boolean(isPublic);
    }

    // Regenerate insights if code changed
    if (codeChanged && code) {
      const insightsResult = await generateInsights(code);
      if (insightsResult) {
        updates.insights = insightsResult.insightsJson;
        updates.insightsCodeHash = insightsResult.codeHash;

        // Update concept tags
        await db.delete(conceptTags).where(eq(conceptTags.patternId, id));
        if (insightsResult.insights.concepts.length > 0) {
          await db.insert(conceptTags).values(
            insightsResult.insights.concepts.map((concept) => ({
              id: crypto.randomUUID(),
              patternId: id,
              concept,
              confidence: 1.0,
            }))
          );
        }
      }
    }

    await db.update(patterns).set(updates).where(eq(patterns.id, id));

    // Fetch updated pattern
    const [updatedPattern] = await db
      .select()
      .from(patterns)
      .where(eq(patterns.id, id))
      .limit(1);

    return Response.json({ pattern: updatedPattern });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

// PATCH - partial update (for insights, etc.)
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return errorResponse("UNAUTHORIZED");
    }

    // Check if pattern exists and user owns it
    const [existingPattern] = await db
      .select()
      .from(patterns)
      .where(and(eq(patterns.id, id), eq(patterns.authorId, session.user.id)))
      .limit(1);

    if (!existingPattern) {
      return errorResponse("NOT_FOUND", "Pattern not found or you don't have permission to edit it");
    }

    const body = await req.json();
    const { insights, insightsCodeHash, name, code, isPublic } = body;

    const updates: Partial<typeof patterns.$inferInsert> = {
      updatedAt: new Date(),
    };

    // Handle insights update
    if (insights !== undefined) {
      updates.insights = insights;
    }
    if (insightsCodeHash !== undefined) {
      updates.insightsCodeHash = insightsCodeHash;
    }

    // Also support other fields for flexibility
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return errorResponse("VALIDATION_ERROR", "Pattern name cannot be empty");
      }
      updates.name = name.trim();
    }

    if (code !== undefined) {
      if (typeof code !== "string") {
        return errorResponse("VALIDATION_ERROR", "Invalid code format");
      }
      updates.code = code;
    }

    if (isPublic !== undefined) {
      updates.isPublic = Boolean(isPublic);
    }

    await db.update(patterns).set(updates).where(eq(patterns.id, id));

    // Fetch updated pattern
    const [updatedPattern] = await db
      .select()
      .from(patterns)
      .where(eq(patterns.id, id))
      .limit(1);

    return Response.json({ pattern: updatedPattern });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return errorResponse("UNAUTHORIZED");
    }

    // Check if pattern exists and user owns it
    const [existingPattern] = await db
      .select()
      .from(patterns)
      .where(and(eq(patterns.id, id), eq(patterns.authorId, session.user.id)))
      .limit(1);

    if (!existingPattern) {
      return errorResponse("NOT_FOUND", "Pattern not found or you don't have permission to delete it");
    }

    await db.delete(patterns).where(eq(patterns.id, id));

    return Response.json({ success: true });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
