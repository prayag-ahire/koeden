"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { sidebarBus } from "../lib/sidebarBus";

const MIN_W = 160;
const MAX_W = 480;
const DEFAULT_W = 268;
const SIDEBAR_WIDTH_KEY = "koeden_sidebar_w";
const SIDEBAR_COLLAPSED_KEY = "koeden_sidebar_collapsed";

function SidebarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}

export function AppShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const [width, setWidth] = useState(DEFAULT_W);
  const [collapsed, setCollapsed] = useState(false);
  const dragging = useRef(false);

  const collapse = useCallback(() => setCollapsed(true), []);
  const expand = useCallback(() => setCollapsed(false), []);

  useEffect(() => { sidebarBus.registerCollapse(collapse); }, [collapse]);

  useEffect(() => {
    const savedWidth = window.localStorage.getItem(SIDEBAR_WIDTH_KEY);
    const savedCollapsed = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (savedWidth) {
      const parsed = Number(savedWidth);
      if (!Number.isNaN(parsed)) {
        setWidth(Math.min(MAX_W, Math.max(MIN_W, parsed)));
      }
    }
    if (savedCollapsed === "1") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width));
  }, [width]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      setWidth(Math.min(MAX_W, Math.max(MIN_W, ev.clientX)));
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", background: "#f3f4f2", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? 0 : width,
          flexShrink: 0,
          background: "linear-gradient(180deg, #f9f9f8 0%, #f6f7f5 100%)",
          borderRight: collapsed ? "none" : "1px solid #e8e8e7",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.18s ease",
          position: "relative",
        }}
      >
        {sidebar}
        {/* Resize handle on right edge */}
        {!collapsed && (
          <div
            onMouseDown={handleResizeMouseDown}
            style={{
              position: "absolute", top: 0, right: 0,
              width: 4, height: "100%",
              cursor: "col-resize", zIndex: 10,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#2d6a4f"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          />
        )}
      </aside>

      {/* Main area */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", padding: "10px 12px 12px 0" }}>
        {/* Floating expand button when collapsed */}
        {collapsed && (
          <button
            onClick={expand}
            title="Expand sidebar"
            style={{
              position: "absolute", top: 10, left: 10, zIndex: 20,
              width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#ffffff", border: "1px solid #e2e3e0",
              borderRadius: 8, cursor: "pointer", color: "#787774",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ebebea"; b.style.color = "#37352f"; }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ffffff"; b.style.color = "#787774"; }}
          >
            <SidebarIcon />
          </button>
        )}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            userSelect: "text",
            borderTop: "1px solid #e1e3e0",
            borderRight: "1px solid #e1e3e0",
            borderBottom: "1px solid #e1e3e0",
            borderLeft: collapsed ? "1px solid #e1e3e0" : "none",
            borderRadius: collapsed ? 12 : "0 12px 12px 0",
            background: "#ffffff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
