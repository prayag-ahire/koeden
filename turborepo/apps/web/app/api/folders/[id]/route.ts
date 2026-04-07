import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { folders } from "@repo/db";
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

async function ensureSoftDeleteColumns(): Promise<boolean> {
  if (await hasSoftDeleteColumn()) return true;
  try {
    await db.execute(sql`ALTER TABLE folders ADD COLUMN IF NOT EXISTS is_deleted integer NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE folders ADD COLUMN IF NOT EXISTS deleted_at timestamp`);
    return true;
  } catch {
    return false;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supportsSoftDelete = await ensureSoftDeleteColumns();

  if (supportsSoftDelete) {
    await db
      .update(folders)
      .set({ isDeleted: 1, deletedAt: new Date() })
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));
  } else {
    await db
      .delete(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));
  }

  return NextResponse.json({ ok: true });
}
