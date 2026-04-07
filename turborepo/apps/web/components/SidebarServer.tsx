import { auth } from "@clerk/nextjs/server";
import { db } from "../lib/db";
import { folders } from "@repo/db";
import { and, eq, sql } from "drizzle-orm";
import { SidebarClient } from "./SidebarClient";

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

export async function SidebarServer() {
  const { userId } = await auth();
  if (!userId) return null;
  const supportsSoftDelete = await hasSoftDeleteColumn();

  const conditions = [eq(folders.userId, userId)];
  if (supportsSoftDelete) {
    conditions.push(eq(folders.isDeleted, 0));
  }

  const userFolders = await db
    .select({
      id: folders.id,
      name: folders.name,
    })
    .from(folders)
    .where(and(...conditions))
    .orderBy(folders.createdAt);

  return <SidebarClient initialFolders={userFolders} />;
}
