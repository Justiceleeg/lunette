import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { patterns } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    const [pattern] = await db
      .select()
      .from(patterns)
      .where(eq(patterns.id, id))
      .limit(1);

    if (!pattern) {
      return Response.json({ error: "Pattern not found" }, { status: 404 });
    }

    // If pattern is private, check if user is the author
    if (!pattern.isPublic) {
      if (!session?.user || session.user.id !== pattern.authorId) {
        return Response.json({ error: "Pattern not found" }, { status: 404 });
      }
    }

    return Response.json({ pattern });
  } catch (error) {
    console.error("Error fetching pattern:", error);
    return Response.json(
      {
        error: "Failed to fetch pattern",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
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
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if pattern exists and user owns it
    const [existingPattern] = await db
      .select()
      .from(patterns)
      .where(and(eq(patterns.id, id), eq(patterns.authorId, session.user.id)))
      .limit(1);

    if (!existingPattern) {
      return Response.json({ error: "Pattern not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, code, isPublic } = body;

    const updates: Partial<typeof patterns.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return Response.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (code !== undefined) {
      if (typeof code !== "string") {
        return Response.json({ error: "Invalid code" }, { status: 400 });
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
    console.error("Error updating pattern:", error);
    return Response.json(
      {
        error: "Failed to update pattern",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
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
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if pattern exists and user owns it
    const [existingPattern] = await db
      .select()
      .from(patterns)
      .where(and(eq(patterns.id, id), eq(patterns.authorId, session.user.id)))
      .limit(1);

    if (!existingPattern) {
      return Response.json({ error: "Pattern not found" }, { status: 404 });
    }

    await db.delete(patterns).where(eq(patterns.id, id));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting pattern:", error);
    return Response.json(
      {
        error: "Failed to delete pattern",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
