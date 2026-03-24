import { db } from "./db";
import { embedTexts } from "./embedder";
import { sql } from "drizzle-orm";

export type SearchResult = {
  chunkContent: string;
  itemTitle: string;
  itemId: string;
  similarity: number;
};

export async function semanticSearch(
  query: string,
  userId: string,
  folderId?: string,
  topK = 5
): Promise<SearchResult[]> {
  const [queryVec] = await embedTexts([query]);
  if (!queryVec) return [];

  const vecStr = `[${queryVec.join(",")}]`;

  const rows = await db.execute(sql`
    SELECT
      c.content AS chunk_content,
      i.title   AS item_title,
      i.id      AS item_id,
      1 - (e.embedding <=> ${vecStr}::vector) AS similarity
    FROM embeddings e
    JOIN chunks c ON c.id = e.chunk_id
    JOIN items  i ON i.id = c.item_id
    WHERE i.user_id = ${userId}
      AND (${folderId ?? null} IS NULL OR i.folder_id = ${folderId ?? null}::uuid)
    ORDER BY e.embedding <=> ${vecStr}::vector
    LIMIT ${topK}
  `);

  return (rows as any[]).map((r) => ({
    chunkContent: r.chunk_content as string,
    itemTitle: r.item_title as string,
    itemId: r.item_id as string,
    similarity: Number(r.similarity),
  }));
}
