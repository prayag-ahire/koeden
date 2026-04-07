"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AddItemDialog } from "./AddItemDialog";
import { usePanels } from "./PanelContext";
import { ChatPanel } from "./ChatPanel";
import { ItemPanel } from "./ItemPanel";

type Item = { id: string; title: string; type: string; sourceUrl?: string; createdAt: string };
type FilterTab = "all" | "notes" | "ai" | "trash";

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function typeIcon(type: string) {
  if (type === "youtube") return <IconYoutube />;
  if (type === "url") return <IconLink />;
  return <IconDoc />;
}

function typeColor(type: string) {
  if (type === "youtube") return "#e03e3e";
  if (type === "url") return "#2383e2";
  return "#2d6a4f";
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
  } catch { return ""; }
}

function getDateGroup(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "TODAY";
    if (diffDays === 1) return "YESTERDAY";
    if (diffDays <= 7) return "PAST WEEK";
    if (diffDays <= 30) return "PAST MONTH";
    if (diffDays <= 365) return "PAST YEAR";
    return "OLDER";
  } catch {
    return "OLDER";
  }
}

function ItemCard({ item, onDelete, onClick }: { item: Item; onDelete: (id: string) => void; onClick: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  // Generate fake preview lines from title
  const previewLines = [
    item.title,
    item.sourceUrl ? item.sourceUrl.replace(/^https?:\/\//, "").slice(0, 40) : "No preview available",
    "Click to open...",
  ];

  return (
    <div
      onClick={() => onClick(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e7",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.12s ease",
        position: "relative",
      }}
    >
      {/* Card preview area */}
      <div style={{
        height: 90,
        padding: "10px 12px",
        background: "#fafaf9",
        borderBottom: "1px solid #f0f0ef",
        overflow: "hidden",
      }}>
        {previewLines.map((line, i) => (
          <div key={i} style={{
            fontSize: 9,
            color: i === 0 ? "#9b9a97" : "#c7c5bf",
            lineHeight: 1.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 1,
          }}>
            {line}
          </div>
        ))}
      </div>
      {/* Card footer */}
      <div style={{
        padding: "7px 10px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
          <span style={{ color: typeColor(item.type), flexShrink: 0 }}>{typeIcon(item.type)}</span>
          <span style={{
            fontSize: 11, fontWeight: 500, color: "#37352f",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {item.title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: "#9b9a97" }}>{timeAgo(item.createdAt)}</span>
          {hovered && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              style={{
                fontSize: 13, color: "#c7c5bf", background: "none", border: "none",
                cursor: "pointer", padding: "0 2px", borderRadius: 3, lineHeight: 1,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#e03e3e"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c7c5bf"; }}
            >×</button>
          )}
        </div>
      </div>
    </div>
  );
}

const FILTER_TABS: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All results", icon: null },
  { id: "notes", label: "Notes", icon: <span style={{ color: "#2d6a4f" }}><IconDoc /></span> },
  { id: "ai", label: "Eden AI", icon: <span style={{ color: "#7c3aed" }}><IconSparkle /></span> },
  { id: "trash", label: "Trash", icon: <span style={{ color: "#9b9a97" }}><IconTrash /></span> },
];

export function ItemsView({
  folderId,
  scope = "workspace",
  openItemId,
}: {
  folderId?: string;
  scope?: "workspace" | "recents";
  openItemId?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortType, setSortType] = useState<"newest" | "oldest" | "a-z" | "z-a">("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const { openPanel } = usePanels();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = useCallback(async (q: string, tab: FilterTab = activeTab) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (folderId) params.set("folderId", folderId);
      
      if (tab === "trash") {
        params.set("trash", "true");
      } else if (tab === "notes") {
        params.set("type", "note");
      } else if (tab === "ai") {
        // For AI tab, fetch both youtube and url types (need two requests or handle frontend filtering)
        // For now, we'll handle this with frontend filtering
      }
      
      const res = await fetch(`/api/items?${params}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch items: HTTP ${res.status}`);
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Error fetching items:", message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, folderId]);

  useEffect(() => { void search(""); }, [search]);

  useEffect(() => {
    if (!openItemId) return;
    const folderName = folderId ? undefined : "Workspace";
    openPanel("New Note", <ItemPanel itemId={openItemId} folderName={folderName} />, {
      kind: "item",
      itemId: openItemId,
      folderName,
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("openItem");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
  }, [openItemId, folderId, openPanel, pathname, router, searchParams]);

  async function deleteItem(id: string) {
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function openChat() {
    openPanel("AI Chat", <ChatPanel folderId={folderId} />, { kind: "chat", folderId });
  }

  function openItem(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      const folderName = folderId ? undefined : "Workspace";
      openPanel(item.title, <ItemPanel itemId={itemId} folderName={folderName} />, {
        kind: "item",
        itemId,
        folderName,
      });
    }
  }

  // First, filter by type based on active tab
  const typeFilteredItems = (() => {
    if (activeTab === "notes") {
      return items.filter((i) => i.type === "note");
    }
    if (activeTab === "ai") {
      return items.filter((i) => i.type === "youtube" || i.type === "url");
    }
    if (activeTab === "trash") {
      return items; // Already filtered by API
    }
    return items;
  })();

  // Apply sorting
  const sortedItems = (() => {
    const sorted = [...typeFilteredItems];
    if (sortType === "a-z") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortType === "z-a") {
      sorted.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortType === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortType === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return sorted;
  })();

  // Then group by date
  const groupedItems = (() => {
    const groups: Record<string, typeof sortedItems> = {};
    sortedItems.forEach((item) => {
      const group = getDateGroup(item.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });
    return groups;
  })();

  const dateGroupOrder = ["TODAY", "YESTERDAY", "PAST WEEK", "PAST MONTH", "PAST YEAR", "OLDER"];
  const sortedGroups = dateGroupOrder.filter((g) => groupedItems[g]);

  const sectionHeading = activeTab === "notes" ? "Notes" : scope === "recents" ? "Recents" : "Workspace";
  const hideDuplicateSectionTitle =
    activeTab === "all" && !folderId && (scope === "workspace" || scope === "recents");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#ffffff", overflow: "hidden" }}>
      {/* Cover image */}
      <div style={{
        height: 180,
        background: "linear-gradient(135deg, #1a3a2e 0%, #2d6a4f 100%)",
        flexShrink: 0,
      }} />

      {/* Main content below cover */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 32px" }}>
        {/* Search bar row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9b9a97", display: "flex", pointerEvents: "none" }}>
              <IconSearch />
            </span>
            {scope === "recents" && (
              <span
                style={{
                  position: "absolute",
                  left: 42,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "1px solid #e8e8e7",
                  borderRadius: 999,
                  padding: "3px 10px",
                  fontSize: 12,
                  color: "#787774",
                  background: "#ffffff",
                  pointerEvents: "none",
                }}
              >
                Recents
              </span>
            )}
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") search(searchQ); }}
              placeholder="Search anything..."
              style={{
                width: "100%",
                padding: scope === "recents" ? "11px 14px 11px 126px" : "11px 14px 11px 40px",
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
          {/* View toggle buttons */}
          <button
            onClick={() => setViewMode("list")}
            title="List view"
            style={{
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid #e8e8e7", borderRadius: 8, cursor: "pointer",
              background: viewMode === "list" ? "#ebebea" : "transparent",
              color: viewMode === "list" ? "#37352f" : "#9b9a97",
            }}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ebebea"; }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = viewMode === "list" ? "#ebebea" : "transparent"; }}
          >
            <IconList />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            title="Grid view"
            style={{
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid #e8e8e7", borderRadius: 8, cursor: "pointer",
              background: viewMode === "grid" ? "#ebebea" : "transparent",
              color: viewMode === "grid" ? "#37352f" : "#9b9a97",
            }}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ebebea"; }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = viewMode === "grid" ? "#ebebea" : "transparent"; }}
          >
            <IconGrid />
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #e8e8e7", paddingBottom: 0 }}>
          {FILTER_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  search(searchQ, tab.id);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px",
                  border: "none",
                  borderBottom: active ? "2px solid #2d6a4f" : "2px solid transparent",
                  background: active ? "#f0faf5" : "transparent",
                  color: active ? "#2d6a4f" : "#9b9a97",
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  cursor: "pointer",
                  borderRadius: "6px 6px 0 0",
                  marginBottom: -1,
                  transition: "all 0.1s ease",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#37352f"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#9b9a97"; }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content by tab */}
        {activeTab === "ai" ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "60px 20px", gap: 12,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f4f0ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#7c3aed", fontSize: 20 }}><IconSparkle /></span>
            </div>
            <p style={{ fontSize: 14, color: "#9b9a97", margin: 0, textAlign: "center" }}>No AI chats yet</p>
            <button
              onClick={openChat}
              style={{
                padding: "8px 18px", fontSize: 13, fontWeight: 500,
                background: "#7c3aed", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#6d28d9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#7c3aed"; }}
            >
              Start a chat
            </button>
          </div>
        ) : activeTab === "trash" ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "60px 20px", gap: 12,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f4f4f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#9b9a97", fontSize: 20 }}><IconTrash /></span>
            </div>
            <p style={{ fontSize: 14, color: "#9b9a97", margin: 0, textAlign: "center" }}>Trash is empty</p>
          </div>
        ) : (
          <>
            {/* Section heading */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: hideDuplicateSectionTitle ? "flex-end" : "space-between",
                marginBottom: 14,
              }}
            >
              {!hideDuplicateSectionTitle && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "#37352f" }}>{sectionHeading}</span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setShowAddDialog(true)}
                  style={{
                    width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid #e8e8e7", borderRadius: 6, cursor: "pointer",
                    background: "transparent", color: "#9b9a97", fontSize: 16, lineHeight: 1,
                  }}
                  onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ebebea"; b.style.color = "#37352f"; }}
                  onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.color = "#9b9a97"; }}
                  title="Add item"
                >
                  +
                </button>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "4px 10px", fontSize: 12, fontWeight: 400,
                      border: "1px solid #e8e8e7", borderRadius: 6, cursor: "pointer",
                      background: showSortDropdown ? "#ebebea" : "transparent", color: "#9b9a97",
                    }}
                    onMouseEnter={(e) => { if (!showSortDropdown) (e.currentTarget as HTMLButtonElement).style.background = "#ebebea"; }}
                    onMouseLeave={(e) => { if (!showSortDropdown) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="10" y2="18" />
                    </svg>
                    {sortType === "newest" && "Newest"}
                    {sortType === "oldest" && "Oldest"}
                    {sortType === "a-z" && "A-Z"}
                    {sortType === "z-a" && "Z-A"}
                  </button>
                  {showSortDropdown && (
                    <div style={{
                      position: "absolute", top: "100%", right: 0, marginTop: 4,
                      background: "#ffffff", border: "1px solid #e8e8e7", borderRadius: 8,
                      zIndex: 100, minWidth: 140, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}>
                      {[
                        { label: "Newest", value: "newest" as const },
                        { label: "Oldest", value: "oldest" as const },
                        { label: "A-Z", value: "a-z" as const },
                        { label: "Z-A", value: "z-a" as const },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortType(option.value);
                            setShowSortDropdown(false);
                          }}
                          style={{
                            display: "block", width: "100%", textAlign: "left",
                            padding: "8px 12px", fontSize: 12, color: sortType === option.value ? "#2d6a4f" : "#37352f",
                            background: sortType === option.value ? "#f0faf5" : "transparent", border: "none", cursor: "pointer",
                            fontWeight: sortType === option.value ? 500 : 400,
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f0faf5"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = sortType === option.value ? "#f0faf5" : "transparent"; }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "40px 20px",
                border: "1px solid #ffcccc", borderRadius: 12, gap: 10,
                background: "#fff5f5",
              }}>
                <p style={{ fontSize: 13, color: "#e03e3e", margin: "0 0 8px", fontWeight: 500 }}>
                  Error loading items
                </p>
                <p style={{ fontSize: 12, color: "#9b9a97", margin: 0, textAlign: "center", maxWidth: 300 }}>
                  {error}
                </p>
                <button
                  onClick={() => search(searchQ, activeTab)}
                  style={{
                    marginTop: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500,
                    background: "#2d6a4f", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1a3a2e"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2d6a4f"; }}
                >
                  Retry
                </button>
              </div>
            )}

            {!error && loading ? (
              <p style={{ fontSize: 13, color: "#9b9a97" }}>Loading...</p>
            ) : !error && typeFilteredItems.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "60px 20px",
                border: "1px dashed #e8e8e7", borderRadius: 12, gap: 10,
              }}>
                <p style={{ fontSize: 13, color: "#9b9a97", margin: 0, textAlign: "center" }}>
                  No items yet. Add a note, YouTube video, or URL to get started.
                </p>
                <button
                  onClick={() => setShowAddDialog(true)}
                  style={{
                    marginTop: 4, padding: "6px 14px", fontSize: 12, fontWeight: 500,
                    background: "#2d6a4f", color: "#fff", border: "none", borderRadius: 16, cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1a3a2e"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2d6a4f"; }}
                >
                  + Add first item
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {sortedGroups.map((groupName) => (
                  <div key={groupName}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#9b9a97", letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 12 }}>
                      {groupName}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                      {groupedItems[groupName]?.map((item) => (
                        <ItemCard key={item.id} item={item} onDelete={deleteItem} onClick={openItem} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {sortedGroups.map((groupName) => (
                  <div key={groupName}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#9b9a97", letterSpacing: "0.04em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                      {groupName}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {groupedItems[groupName]?.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => openItem(item.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 12px", borderRadius: 8,
                            border: "1px solid transparent",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fafaf9"; (e.currentTarget as HTMLDivElement).style.borderColor = "#e8e8e7"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.borderColor = "transparent"; }}
                        >
                          <span style={{ color: typeColor(item.type), flexShrink: 0 }}>{typeIcon(item.type)}</span>
                          <span style={{ flex: 1, fontSize: 13, color: "#37352f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                          <span style={{ fontSize: 11, color: "#9b9a97", flexShrink: 0 }}>{timeAgo(item.createdAt)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                            style={{ fontSize: 14, color: "#d3d1cb", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 4, flexShrink: 0 }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#e03e3e"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#d3d1cb"; }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showAddDialog && (
        <AddItemDialog
          folderId={folderId}
          onClose={() => setShowAddDialog(false)}
          onAdded={(itemId) => {
            setShowAddDialog(false);
            void search(searchQ);
            if (itemId) {
              const folderName = folderId ? undefined : "Workspace";
              openPanel("New Note", <ItemPanel itemId={itemId} folderName={folderName} />, {
                kind: "item",
                itemId,
                folderName,
              });
            }
          }}
        />
      )}
    </div>
  );
}
