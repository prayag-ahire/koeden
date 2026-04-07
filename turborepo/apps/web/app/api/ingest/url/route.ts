import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { ingestItem } from "../../../../lib/ingest";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { url, folderId } = await req.json();
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const html = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    });

    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();

    if (!article?.textContent) {
      return NextResponse.json({ error: "Could not extract content from URL" }, { status: 400 });
    }

    const itemId = await ingestItem({
      userId,
      folderId,
      type: "url",
      title: article.title ?? url,
      rawContent: article.textContent,
      sourceUrl: url,
    });

    return NextResponse.json({ itemId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[ingest/url]", message);
    return NextResponse.json({ error: `Failed to ingest URL: ${message}` }, { status: 500 });
  }
}
