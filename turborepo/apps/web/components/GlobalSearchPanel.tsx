"use client";
import { useState } from "react";

type SearchResult = { id: string; title: string; type: string; sourceUrl?: string; preview: string };
type ApiSearchResult = {
  id: string;
  title: string;
  type: string;
  sourceUrl?: string;
  preview?: string;
};

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function GlobalSearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/items?q=${encodeURIComponent(q)}`);
      const data: unknown = await res.json();
      setResults(
        Array.isArray(data)
          ? data.map((item) => {
              const result = item as ApiSearchResult;
              return {
                id: result.id,
                title: result.title,
                type: result.type,
                sourceUrl: result.sourceUrl,
                preview: result.preview ?? result.title.slice(0, 100),
              };
            })
          : []
      );
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#ffffff" }}>
      {/* Search bar */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e7", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: "#9b9a97", display: "flex", pointerEvents: "none",
          }}>
            <IconSearch />
          </span>
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search everything..."
            autoFocus
            style={{
              width: "100%",
              padding: "11px 14px 11px 40px",
              fontSize: 14,
              border: "1px solid #e8e8e7",
              borderRadius: 10,
              outline: "none",
              background: "#fafaf9",
              color: "#37352f",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {!query.trim() ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#9b9a97",
            textAlign: "center",
            gap: 8,
          }}>
            <div style={{ fontSize: 28 }}>🔍</div>
            <p style={{ fontSize: 13, margin: 0 }}>Type to search across your knowledge base</p>
          </div>
        ) : loading ? (
          <p style={{ fontSize: 13, color: "#9b9a97", textAlign: "center" }}>Searching...</p>
        ) : results.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#9b9a97",
            textAlign: "center",
            gap: 8,
          }}>
            <p style={{ fontSize: 13, margin: 0 }}>No results found</p>
            <p style={{ fontSize: 12, margin: 0 }}>Try different keywords</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((result) => (
              <div
                key={result.id}
                style={{
                  padding: "12px",
                  border: "1px solid #e8e8e7",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fafaf9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div style={{ fontSize: 12, fontWeight: 500, color: "#37352f" }}>{result.title}</div>
                <div style={{ fontSize: 11, color: "#9b9a97", marginTop: 4 }}>
                  {result.sourceUrl ? result.sourceUrl.replace(/^https?:\/\//, "").slice(0, 50) : result.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
