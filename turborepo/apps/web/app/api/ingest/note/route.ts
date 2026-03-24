import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ingestItem } from "../../../../lib/ingest";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, title, folderId } = await req.json();
  if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

  const itemId = await ingestItem({
    userId,
    folderId,
    type: "note",
    title: title ?? content.slice(0, 60),
    rawContent: content,
  });

  return NextResponse.json({ itemId });
}
