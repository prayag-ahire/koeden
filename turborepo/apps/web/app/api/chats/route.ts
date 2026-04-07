import { auth } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { chats } from "@repo/db";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userChats = await db
    .select({
      id: chats.id,
      title: chats.title,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
    })
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt))
    .limit(50);

  return Response.json(userChats);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, folderId } = body;

  const newChat = await db
    .insert(chats)
    .values({ userId, title: title || "New Chat", folderId: folderId || null })
    .returning();

  return Response.json(newChat[0]);
}
