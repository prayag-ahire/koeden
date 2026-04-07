import { db } from "./db";
import { items, chunks, embeddings, users } from "@repo/db";
import { chunkText } from "./chunker";
import { embedTexts } from "./embedder";

type IngestInput = {
  userId: string;
  folderId?: string;
  type: "note" | "youtube" | "url";
  title: string;
  rawContent: string;
  sourceUrl?: string;
};

export async function ingestItem(input: IngestInput): Promise<string> {
  // ensure user row exists
  await db
    .insert(users)
    .values({ id: input.userId })
    .onConflictDoNothing();

  // insert item
  const [item] = await db
    .insert(items)
    .values({
      userId: input.userId,
      folderId: input.folderId ?? null,
      type: input.type,
      title: input.title,
      rawContent: input.rawContent,
      sourceUrl: input.sourceUrl ?? null,
    })
    .returning({ id: items.id });

  if (!item) throw new Error("Failed to insert item");

  // chunk
  const textChunks = chunkText(input.rawContent);

  // Allow empty drafts: create item first, embed only when there is content.
  if (textChunks.length === 0) {
    return item.id;
  }

  // embed all chunks in one API call
  const vectors = await embedTexts(textChunks);

  // insert chunks + embeddings
  for (let i = 0; i < textChunks.length; i++) {
    const [chunk] = await db
      .insert(chunks)
      .values({
        itemId: item.id,
        chunkIndex: i,
        content: textChunks[i]!,
      })
      .returning({ id: chunks.id });

    if (!chunk) continue;

    await db.insert(embeddings).values({
      chunkId: chunk.id,
      embedding: vectors[i]!,
    });
  }

  return item.id;
}
