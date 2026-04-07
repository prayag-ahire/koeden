import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { items, folders } from "@repo/db";
import { and, eq, sql } from "drizzle-orm";

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supportsSoftDelete = await hasSoftDeleteColumn();
  const whereClause = supportsSoftDelete
    ? and(eq(items.id, id), eq(items.userId, userId), eq(items.isDeleted, 0))
    : and(eq(items.id, id), eq(items.userId, userId));

  const result = await db
    .select({
      id: items.id,
      title: items.title,
      type: items.type,
      rawContent: items.rawContent,
      sourceUrl: items.sourceUrl,
      createdAt: items.createdAt,
      folderId: items.folderId,
      folderName: folders.name,
    })
    .from(items)
    .leftJoin(folders, eq(items.folderId, folders.id))
    .where(whereClause)
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const item = result[0]!;
  return NextResponse.json({
    id: item.id,
    title: item.title,
    type: item.type,
    rawContent: item.rawContent,
    sourceUrl: item.sourceUrl,
    createdAt: item.createdAt,
    folderId: item.folderId,
    folderName: item.folderName,
  });
}
