import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { items } from "@repo/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { semanticSearch } from "../../../lib/search";

async function hasSoftDeleteColumn(): Promise<boolean> {
  try {
    const rows = await db.execute(sql`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'items'
        AND column_name = 'is_deleted'
      LIMIT 1
    `);
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const folderId = searchParams.get("folderId") ?? undefined;
  const types = searchParams
    .getAll("type")
    .filter((t): t is "note" | "youtube" | "url" =>
      t === "note" || t === "youtube" || t === "url"
    );
  const showTrash = searchParams.get("trash") === "true";
  const supportsSoftDelete = await hasSoftDeleteColumn();

  if (q) {
    const semanticResults = await semanticSearch(q, userId, folderId);

    const bestByItem = new Map<
      string,
      { preview: string; similarity: number }
    >();
    for (const result of semanticResults) {
      const current = bestByItem.get(result.itemId);
      if (!current || result.similarity > current.similarity) {
        bestByItem.set(result.itemId, {
          preview: result.chunkContent,
          similarity: result.similarity,
        });
      }
    }

    const orderedItemIds = Array.from(bestByItem.entries())
      .sort((a, b) => b[1].similarity - a[1].similarity)
      .map(([itemId]) => itemId);

    if (orderedItemIds.length === 0) {
      return NextResponse.json([]);
    }

    const conditions = [eq(items.userId, userId), inArray(items.id, orderedItemIds)];
    if (folderId) conditions.push(eq(items.folderId, folderId));
    if (supportsSoftDelete) {
      conditions.push(showTrash ? eq(items.isDeleted, 1) : eq(items.isDeleted, 0));
    }
    if (types.length > 0) {
      conditions.push(inArray(items.type, types));
    }

    const metadata = await db
      .select({
        id: items.id,
        title: items.title,
        type: items.type,
        sourceUrl: items.sourceUrl,
        createdAt: items.createdAt,
        folderId: items.folderId,
      })
      .from(items)
      .where(and(...conditions));

    const metadataById = new Map(metadata.map((item) => [item.id, item]));
    const ranked = orderedItemIds
      .map((id) => {
        const item = metadataById.get(id);
        const score = bestByItem.get(id);
        if (!item || !score) return null;
        return {
          ...item,
          preview: score.preview,
          similarity: score.similarity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json(ranked);
  }

  const conditions = [eq(items.userId, userId)];
  if (folderId) conditions.push(eq(items.folderId, folderId));
  if (supportsSoftDelete) {
    if (showTrash) {
      conditions.push(eq(items.isDeleted, 1));
    } else {
      conditions.push(eq(items.isDeleted, 0));
    }
  } else if (showTrash) {
    return NextResponse.json([]);
  }
  if (types.length > 0) {
    conditions.push(inArray(items.type, types));
  }

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
