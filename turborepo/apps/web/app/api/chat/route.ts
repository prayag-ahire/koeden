import { auth } from "@clerk/nextjs/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { semanticSearch } from "../../../lib/search";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { messages, folderId } = await req.json();
  const lastMessage = messages[messages.length - 1]?.content ?? "";

  const results = await semanticSearch(lastMessage, userId, folderId);

  const context = results
    .map((r, i) => `[${i + 1}] ${r.itemTitle}\n${r.chunkContent}`)
    .join("\n\n");

  const systemPrompt = context
    ? `You are a helpful assistant with access to the user's personal knowledge base. Use the following context to answer the user's question. If the context doesn't contain relevant information, say so.\n\nContext:\n${context}`
    : "You are a helpful assistant. The user's knowledge base has no relevant content for this query.";

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
