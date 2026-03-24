import { auth } from "@clerk/nextjs/server";
import { db } from "../lib/db";
import { folders } from "@repo/db";
import { eq } from "drizzle-orm";
import { SidebarClient } from "./SidebarClient";

export async function SidebarServer() {
  const { userId } = await auth();
  if (!userId) return null;

  const userFolders = await db
    .select()
    .from(folders)
    .where(eq(folders.userId, userId))
    .orderBy(folders.createdAt);

  return <SidebarClient initialFolders={userFolders} />;
}
