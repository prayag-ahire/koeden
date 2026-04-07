"use client";
import { useState } from "react";

type Tab = "note" | "youtube" | "url";

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function AddItemDialog({
  folderId,
  onClose,
  onAdded,
  initialTab,
}: {
  folderId?: string;
  onClose: () => void;
  onAdded: (itemId?: string) => void;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab ?? "note");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitHovered, setSubmitHovered] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const endpoint =
        tab === "note" ? "/api/ingest/note" : tab === "youtube" ? "/api/ingest/youtube" : "/api/ingest/url";
      const body = tab === "note" ? { content: value, folderId } : { url: value, folderId };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed");
      }
      const data = (await res.json()) as { itemId?: string };
      onAdded(data.itemId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save item";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "note", label: "Note" },
    { key: "youtube", label: "YouTube" },
    { key: "url", label: "URL" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e8e8e7",
          borderRadius: 12,
          width: "100%",
          maxWidth: 500,
          padding: "22px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>Add to knowledge base</h2>
            <p style={{ fontSize: 12, color: "#9b9a97", margin: "3px 0 0" }}>Save a note, video, or webpage</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              color: "#9b9a97",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f2"; (e.currentTarget as HTMLButtonElement).style.color = "#37352f"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9b9a97"; }}
          >
            <IconClose />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: 2,
          background: "#f4f4f2",
          borderRadius: 8,
          padding: 3,
        }}>
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setValue(""); }}
              style={{
                flex: 1,
                padding: "6px 0",
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                transition: "background 0.1s, color 0.1s",
                background: tab === key ? "#ffffff" : "transparent",
                color: tab === key ? "#1a1a1a" : "#787774",
                boxShadow: tab === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        {tab === "note" ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={6}
            placeholder="Write your note here..."
            style={{
              width: "100%",
              fontSize: 13,
              padding: "10px 12px",
              border: "1px solid #e8e8e7",
              borderRadius: 8,
              outline: "none",
              resize: "none",
              background: "#fafaf9",
              color: "#1a1a1a",
              lineHeight: 1.6,
              boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#2d6a4f"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e7"; }}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) submit(); }}
            placeholder={tab === "youtube" ? "https://youtube.com/watch?v=..." : "https://example.com/article"}
            style={{
              width: "100%",
              fontSize: 13,
              padding: "10px 12px",
              border: "1px solid #e8e8e7",
              borderRadius: 8,
              outline: "none",
              background: "#fafaf9",
              color: "#1a1a1a",
              boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#2d6a4f"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e7"; }}
          />
        )}

        {error && (
          <p style={{ fontSize: 12, color: "#e03e3e", margin: 0, padding: "6px 10px", background: "#fff5f5", borderRadius: 6, border: "1px solid #ffd4d4" }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading || !value.trim()}
          onMouseEnter={() => setSubmitHovered(true)}
          onMouseLeave={() => setSubmitHovered(false)}
          style={{
            width: "100%",
            padding: "10px 0",
            fontSize: 13,
            fontWeight: 600,
            background: loading || !value.trim() ? "#c8ddd5" : submitHovered ? "#1a3a2e" : "#2d6a4f",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            cursor: loading || !value.trim() ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Processing..." : "Save to knowledge base"}
        </button>
      </div>
    </div>
  );
}
