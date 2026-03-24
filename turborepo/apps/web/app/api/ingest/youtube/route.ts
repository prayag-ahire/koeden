import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { ingestItem } from "../../../../lib/ingest";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, folderId } = await req.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
  if (!videoIdMatch) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

  const videoId = videoIdMatch[1];

  const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
  const transcript = transcriptItems.map((t: { text: string }) => t.text).join(" ");

  if (!transcript) return NextResponse.json({ error: "No transcript available" }, { status: 400 });

  const itemId = await ingestItem({
    userId,
    folderId,
    type: "youtube",
    title: `YouTube: ${videoId}`,
    rawContent: transcript,
    sourceUrl: url,
  });

  return NextResponse.json({ itemId });
}
