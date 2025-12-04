import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { patterns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPatterns = await db
      .select()
      .from(patterns)
      .where(eq(patterns.authorId, session.user.id))
      .orderBy(desc(patterns.updatedAt));

    return Response.json({ patterns: userPatterns });
  } catch (error) {
    console.error("Error fetching patterns:", error);
    return Response.json(
      {
        error: "Failed to fetch patterns",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, code, isPublic = false, forkedFromId } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    if (!code || typeof code !== "string") {
      return Response.json({ error: "Code is required" }, { status: 400 });
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

    const newPattern = {
      id: nanoid(),
      name: name.trim(),
      code,
      authorId: session.user.id,
      isPublic: Boolean(isPublic),
      forkedFromId: forkedFromId || null,
      originalAuthorId: resolvedOriginalAuthorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(patterns).values(newPattern);

    return Response.json({ pattern: newPattern }, { status: 201 });
  } catch (error) {
    console.error("Error creating pattern:", error);
    return Response.json(
      {
        error: "Failed to create pattern",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
