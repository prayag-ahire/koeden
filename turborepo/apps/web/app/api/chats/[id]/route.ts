import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../lib/db";
import { chats, chatMessages } from "@repo/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const chat = await db
    .select()
    .from(chats)
    .where(eq(chats.id, id))
    .limit(1);

  if (!chat.length || chat[0]!.userId !== userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.chatId, id))
    .orderBy(chatMessages.createdAt);

  return Response.json({ ...chat[0], messages });
}
