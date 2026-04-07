"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type ItemDetail = {
  id: string;
  title: string;
  type: string;
  rawContent: string;
  sourceUrl?: string;
  createdAt: string;
  folderId?: string;
  folderName?: string;
};

function IconDoc() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function timeAgo(str: string): string {
  try {
    const diff = Date.now() - new Date(str).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    const weeks = Math.floor(days / 7);
    if (weeks > 0) return `${weeks}w`;
    if (days > 0) return `${days}d`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  } catch {
    return "";
  }
}

function typeLabel(type: string) {
  if (type === "youtube") return "YouTube";
  if (type === "url") return "URL";
  return "Note";
}

export function ItemPanel({ itemId, folderName }: { itemId: string; folderName?: string }) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [titleDraft, setTitleDraft] = useState("");
  const [contentDraft, setContentDraft] = useState("");
  const [savedTitle, setSavedTitle] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHydratedRef = useRef(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await fetch(`/api/items/${itemId}/details`);
        if (!res.ok) throw new Error("Failed to fetch item");
        const data = (await res.json()) as ItemDetail;
        setItem(data);
        setTitleDraft(data.title);
        setContentDraft(data.rawContent ?? "");
        setSavedTitle(data.title);
        setSavedContent(data.rawContent ?? "");
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
        isHydratedRef.current = true;
      }
    }
    fetchItem();
  }, [itemId]);

  const isNote = item?.type === "note";
  const isDirty = titleDraft !== savedTitle || contentDraft !== savedContent;

  useEffect(() => {
    if (!isHydratedRef.current || !isNote || !item) return;
    if (!isDirty) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setSaveState("saving");
        const res = await fetch(`/api/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: titleDraft.trim().length > 0 ? titleDraft : "New Note",
            rawContent: contentDraft,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        const updated = (await res.json()) as { title: string; rawContent: string };
        setSavedTitle(updated.title);
        setSavedContent(updated.rawContent ?? "");
        setItem((prev) => (prev ? { ...prev, title: updated.title, rawContent: updated.rawContent ?? "" } : prev));
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [titleDraft, contentDraft, isDirty, isNote, item, itemId]);

  const statusText = useMemo(() => {
    if (!isNote) return `Created ${item ? timeAgo(item.createdAt) : ""}`;
    if (saveState === "saving") return "Edited now · Saving...";
    if (saveState === "saved") return "Edited now";
    if (saveState === "error") return "Save failed";
    return "Edited now";
  }, [isNote, saveState, item]);

  const displayFolder = folderName ?? item?.folderName ?? "Workspace";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#ffffff" }}>
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #efefed",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: "#9b9a97" }}>Workspace</span>
          <span style={{ color: "#c7c5bf", fontSize: 10 }}>
            <IconChevronRight />
          </span>
          <span style={{ fontSize: 12, color: "#9b9a97" }}>{displayFolder}</span>
          <span style={{ color: "#c7c5bf", fontSize: 10 }}>
            <IconChevronRight />
          </span>
          <span style={{ color: "#2d6a4f", display: "flex" }}>
            <IconDoc />
          </span>
          <span style={{ fontSize: 12, color: "#37352f", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {loading ? "Loading..." : titleDraft || item?.title || "New Note"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#787774", flexShrink: 0 }}>
          <span style={{ fontSize: 12 }}>{statusText}</span>
          <button style={{ border: "none", background: "transparent", color: "#5f5d57", cursor: "pointer", fontSize: 12 }}>Share</button>
          <button style={{ border: "none", background: "transparent", color: "#5f5d57", cursor: "pointer", display: "flex" }}><IconShare /></button>
          <button style={{ border: "none", background: "transparent", color: "#5f5d57", cursor: "pointer", display: "flex" }}><IconInfo /></button>
          <button style={{ border: "none", background: "transparent", color: "#5f5d57", cursor: "pointer", display: "flex" }}><IconMore /></button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9b9a97", fontSize: 13 }}>
          Loading item...
        </div>
      ) : !item ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#e03e3e", fontSize: 13 }}>
          Failed to load item
        </div>
      ) : isNote ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "34px 24px 46px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ fontSize: 14, color: "#b1afa9", marginBottom: 18 }}>+ Add property</div>
            <textarea
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              placeholder="New Note"
              rows={1}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                resize: "none",
                background: "transparent",
                fontSize: 56,
                lineHeight: 1.14,
                color: "#3b3934",
                fontFamily: "Georgia, Times New Roman, serif",
                marginBottom: 16,
              }}
            />
            <textarea
              value={contentDraft}
              onChange={(e) => setContentDraft(e.target.value)}
              placeholder="Start writing..."
              style={{
                width: "100%",
                minHeight: 520,
                border: "none",
                outline: "none",
                resize: "none",
                background: "transparent",
                fontSize: 18,
                lineHeight: 1.75,
                color: "#37352f",
              }}
            />
            <div style={{ fontSize: 12, color: "#b1afa9", textAlign: "right" }}>
              {contentDraft.trim().length === 0 ? "0 words" : `${contentDraft.trim().split(/\s+/).length} words`} · {contentDraft.length} chars
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "#9b9a97" }}>{typeLabel(item.type)}</span>
            <span style={{ fontSize: 12, color: "#9b9a97" }}>•</span>
            <span style={{ fontSize: 12, color: "#9b9a97" }}>{timeAgo(item.createdAt)}</span>
            {item.sourceUrl && (
              <>
                <span style={{ fontSize: 12, color: "#9b9a97" }}>•</span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    color: "#2383e2",
                    textDecoration: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 320,
                  }}
                  title={item.sourceUrl}
                >
                  {item.sourceUrl.replace(/^https?:\/\//, "").slice(0, 56)}
                </a>
              </>
            )}
          </div>

          <h1 style={{ fontSize: 34, fontWeight: 600, color: "#1a1a1a", margin: "0 0 20px 0", lineHeight: 1.2 }}>
            {item.title}
          </h1>

          <div style={{ fontSize: 15, color: "#37352f", lineHeight: 1.8 }}>
            {item.rawContent.split("\n").map((line, i) => (
              <p key={i} style={{ margin: "0 0 12px 0" }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
