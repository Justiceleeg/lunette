import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { userDiscoveries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { errorResponse, apiErrorHandler } from "@/lib/errors";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED");
    }

    const discoveries = await db
      .select()
      .from(userDiscoveries)
      .where(eq(userDiscoveries.userId, session.user.id))
      .orderBy(desc(userDiscoveries.firstSeenAt));

    return Response.json({ discoveries });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
