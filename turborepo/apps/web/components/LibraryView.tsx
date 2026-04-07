"use client";
import { useState, useEffect } from "react";

type Item = { id: string; title: string; type: string; sourceUrl?: string; createdAt: string };

function IconSparkle() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
    </svg>
  );
}

export function LibraryView() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLibraryItems() {
      try {
        const res = await fetch("/api/items");
        const data = await res.json();
        setItems(
          Array.isArray(data)
            ? data.filter((item): item is Item => item?.type === "youtube" || item?.type === "url")
            : []
        );
      } catch (err) {
        console.error("Error fetching library items:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLibraryItems();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#ffffff", padding: "24px 32px", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ color: "#7c3aed" }}>
            <IconSparkle />
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>Library</h2>
        </div>
        <p style={{ fontSize: 13, color: "#9b9a97", margin: 0, lineHeight: 1.6 }}>
          Library is where items created in Eden AI chats are collected. Everything you save from a conversation appears here.
        </p>
      </div>

      {/* Items list */}
      {loading ? (
        <p style={{ fontSize: 13, color: "#9b9a97" }}>Loading library...</p>
      ) : items.length === 0 ? (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 12,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f4f0ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#7c3aed", fontSize: 20 }}>
              <IconSparkle />
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#9b9a97", margin: 0 }}>No library items yet</p>
          <p style={{ fontSize: 12, color: "#c7c5bf", margin: 0 }}>Start a chat and save items to build your library</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "12px",
                border: "1px solid #e8e8e7",
                borderRadius: 8,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fafaf9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <div style={{ fontSize: 12, fontWeight: 500, color: "#37352f" }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "#9b9a97", marginTop: 4 }}>
                {item.sourceUrl ? item.sourceUrl.replace(/^https?:\/\//, "").slice(0, 50) : "No source"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
