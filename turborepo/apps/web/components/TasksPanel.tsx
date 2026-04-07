"use client";
import { useState } from "react";

function IconClock() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c4c3be" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function TasksPanel() {
  const [search, setSearch] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#ffffff" }}>
      {/* Search bar */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f0f0ef" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#fafaf9", border: "1px solid #e8e8e7",
          borderRadius: 8, padding: "8px 12px",
        }}>
          <span style={{ color: "#9b9a97", display: "flex" }}><IconSearch /></span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            style={{
              flex: 1, border: "none", outline: "none",
              background: "transparent", fontSize: 13, color: "#1a1a1a",
            }}
          />
        </div>
      </div>

      {/* Empty state */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "40px 24px",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "#f4f4f2",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <IconClock />
        </div>
        <p style={{ fontSize: 15, fontWeight: 500, color: "#37352f", margin: "0 0 6px", textAlign: "center" }}>
          No tasks yet
        </p>
        <p style={{ fontSize: 13, color: "#9b9a97", margin: "0 0 20px", textAlign: "center" }}>
          Create one to run prompts automatically.
        </p>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", fontSize: 13, fontWeight: 500,
          background: "#1a3c2d", color: "#ffffff",
          border: "none", borderRadius: 8, cursor: "pointer",
        }}>
          New Task <IconArrowRight />
        </button>
      </div>
    </div>
  );
}
