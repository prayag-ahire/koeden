import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { folders, users } from "@repo/db";
import { and, eq, sql } from "drizzle-orm";

async function hasSoftDeleteColumn(): Promise<boolean> {
  try {
    const rows = await db.execute(sql`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'folders'
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
  const supportsSoftDelete = await hasSoftDeleteColumn();
  const { searchParams } = new URL(req.url);
  const showTrash = searchParams.get("trash") === "true";

  if (showTrash && !supportsSoftDelete) {
    return NextResponse.json([]);
  }

  const conditions = [eq(folders.userId, userId)];
  if (supportsSoftDelete) {
    conditions.push(eq(folders.isDeleted, showTrash ? 1 : 0));
  }

  const result = await db
    .select({
      id: folders.id,
      userId: folders.userId,
      name: folders.name,
      deletedAt: folders.deletedAt,
      createdAt: folders.createdAt,
    })
    .from(folders)
    .where(and(...conditions))
    .orderBy(folders.createdAt);

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  await db.insert(users).values({ id: userId }).onConflictDoNothing();

  const [folder] = await db
    .insert(folders)
    .values({ userId, name })
    .returning({
      id: folders.id,
      userId: folders.userId,
      name: folders.name,
      createdAt: folders.createdAt,
    });

  return NextResponse.json(folder);
}
