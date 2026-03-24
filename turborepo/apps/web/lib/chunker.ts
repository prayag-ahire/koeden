const CHUNK_SIZE = 500; // characters (approx 125 tokens)
const OVERLAP = 50;

export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start += CHUNK_SIZE - OVERLAP;
  }

  return chunks.filter((c) => c.length > 0);
}
