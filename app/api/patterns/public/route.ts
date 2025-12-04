import { db } from "@/lib/db";
import { patterns, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    // Fetch public patterns with author info
    const publicPatterns = await db
      .select({
        id: patterns.id,
        name: patterns.name,
        code: patterns.code,
        authorId: patterns.authorId,
        isPublic: patterns.isPublic,
        forkedFromId: patterns.forkedFromId,
        originalAuthorId: patterns.originalAuthorId,
        createdAt: patterns.createdAt,
        updatedAt: patterns.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(patterns)
      .leftJoin(users, eq(patterns.authorId, users.id))
      .where(eq(patterns.isPublic, true))
      .orderBy(desc(patterns.updatedAt))
      .limit(limit)
      .offset(offset);

    return Response.json({ patterns: publicPatterns });
  } catch (error) {
    console.error("Error fetching public patterns:", error);
    return Response.json(
      {
        error: "Failed to fetch patterns",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
