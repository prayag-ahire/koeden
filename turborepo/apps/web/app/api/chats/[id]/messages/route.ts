import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../../lib/db";
import { chats, chatMessages } from "@repo/db";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify chat ownership
  const chat = await db.select().from(chats).where(eq(chats.id, id)).limit(1);
  if (!chat.length || chat[0]!.userId !== userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { role, content } = body;

  const message = await db
    .insert(chatMessages)
    .values({ chatId: id, role, content })
    .returning();

  // Update chat updatedAt
  await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, id));

  return Response.json(message[0]);
}
