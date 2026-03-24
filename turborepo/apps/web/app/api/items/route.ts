import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { items } from "@repo/db";
import { and, eq, desc } from "drizzle-orm";
import { semanticSearch } from "../../../lib/search";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const folderId = searchParams.get("folderId") ?? undefined;

  if (q) {
    const results = await semanticSearch(q, userId, folderId);
    return NextResponse.json(results);
  }

  const conditions = [eq(items.userId, userId)];
  if (folderId) conditions.push(eq(items.folderId, folderId));

  const result = await db
    .select({
      id: items.id,
      title: items.title,
      type: items.type,
      sourceUrl: items.sourceUrl,
      createdAt: items.createdAt,
      folderId: items.folderId,
    })
    .from(items)
    .where(and(...conditions))
    .orderBy(desc(items.createdAt))
    .limit(50);

  return NextResponse.json(result);
}
