import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { items } from "@repo/db";
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supportsSoftDelete = await hasSoftDeleteColumn();

  if (supportsSoftDelete) {
    await db
      .update(items)
      .set({ isDeleted: 1, deletedAt: new Date() })
      .where(and(eq(items.id, id), eq(items.userId, userId)));
  } else {
    await db
      .delete(items)
      .where(and(eq(items.id, id), eq(items.userId, userId)));
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { title?: unknown; rawContent?: unknown };

  const title = typeof body.title === "string" ? body.title : undefined;
  const rawContent = typeof body.rawContent === "string" ? body.rawContent : undefined;

  if (title === undefined && rawContent === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(items)
    .set({
      ...(title !== undefined ? { title } : {}),
      ...(rawContent !== undefined ? { rawContent } : {}),
    })
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .returning({
      id: items.id,
      title: items.title,
      rawContent: items.rawContent,
    });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
