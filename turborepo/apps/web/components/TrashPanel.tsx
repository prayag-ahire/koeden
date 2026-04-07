"use client";
import { useMemo, useState, useEffect } from "react";

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
    </svg>
  );
}

type Filter = "all" | "trash" | "notes" | "ai";
type ViewMode = "grid" | "list";
type TrashedItem = {
  id: string;
  title: string;
  type: "note" | "youtube" | "url";
  createdAt: string;
};
type TrashedFolder = {
  id: string;
  name: string;
  createdAt: string;
  deletedAt: string | null;
};
type TrashEntity =
  | { id: string; kind: "item"; title: string; type: "note" | "youtube" | "url"; createdAt: string }
  | { id: string; kind: "folder"; title: string; type: "folder"; createdAt: string };

function timeAgo(str: string): string {
  const diff = Date.now() - new Date(str).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d`;
  if (hrs > 0) return `${hrs}h`;
  if (mins > 0) return `${mins}m`;
  return "Now";
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  if (diffDays <= 7) return "PAST WEEK";
  if (diffDays <= 30) return "PAST MONTH";
  return "OLDER";
}

function entityIcon(entity: TrashEntity) {
  if (entity.kind === "folder") return <IconTrash />;
  if (entity.type === "note") return <IconDoc />;
  return <IconSparkle />;
}

function entityColor(entity: TrashEntity) {
  if (entity.kind === "folder") return "#9b9a97";
  if (entity.type === "note") return "#2d6a4f";
  return "#7c3aed";
}

function TrashCard({ entity }: { entity: TrashEntity }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          border: "1px solid #e6e5e2",
          borderRadius: 16,
          background: "#f1f1ef",
          height: 170,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 10, borderRadius: 12, background: "#fafaf9", opacity: 0.65 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: entityColor(entity), display: "flex", flexShrink: 0 }}>{entityIcon(entity)}</span>
        <span style={{ fontSize: 28, color: "#2d2b27", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {entity.title}
        </span>
        <span style={{ fontSize: 25, color: "#8a8986", flexShrink: 0 }}>{timeAgo(entity.createdAt)}</span>
      </div>
    </div>
  );
}

function TrashListRow({ entity }: { entity: TrashEntity }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "11px 12px",
        borderRadius: 10,
        border: "1px solid #ececea",
        background: "#ffffff",
      }}
    >
      <span style={{ color: entityColor(entity), display: "flex", flexShrink: 0 }}>{entityIcon(entity)}</span>
      <span style={{ fontSize: 27, color: "#2d2b27", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
        {entity.title}
      </span>
      <span style={{ fontSize: 24, color: "#8a8986", flexShrink: 0 }}>{timeAgo(entity.createdAt)}</span>
    </div>
  );
}

export function TrashPanel() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("trash");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(false);
  const [trashedItems, setTrashedItems] = useState<TrashedItem[]>([]);
  const [trashedFolders, setTrashedFolders] = useState<TrashedFolder[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/items?trash=true").then((res) => (res.ok ? res.json() : [])),
      fetch("/api/folders?trash=true").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([itemsData, foldersData]: [unknown, unknown]) => {
        const nextItems = Array.isArray(itemsData)
          ? itemsData
              .map((item) => {
                const parsed = item as { id?: unknown; title?: unknown; type?: unknown; createdAt?: unknown };
                if (
                  typeof parsed.id !== "string" ||
                  typeof parsed.title !== "string" ||
                  typeof parsed.createdAt !== "string" ||
                  (parsed.type !== "note" && parsed.type !== "youtube" && parsed.type !== "url")
                ) {
                  return null;
                }
                return {
                  id: parsed.id,
                  title: parsed.title,
                  type: parsed.type,
                  createdAt: parsed.createdAt,
                };
              })
              .filter((item): item is TrashedItem => item !== null)
          : [];

        const nextFolders = Array.isArray(foldersData)
          ? foldersData
              .map((folder) => {
                const parsed = folder as { id?: unknown; name?: unknown; createdAt?: unknown; deletedAt?: unknown };
                if (
                  typeof parsed.id !== "string" ||
                  typeof parsed.name !== "string" ||
                  typeof parsed.createdAt !== "string"
                ) {
                  return null;
                }
                return {
                  id: parsed.id,
                  name: parsed.name,
                  createdAt: parsed.createdAt,
                  deletedAt: typeof parsed.deletedAt === "string" ? parsed.deletedAt : null,
                };
              })
              .filter((folder): folder is TrashedFolder => folder !== null)
          : [];

        setTrashedItems(nextItems);
        setTrashedFolders(nextFolders);
      })
      .catch(() => {
        setTrashedItems([]);
        setTrashedFolders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const entities = useMemo(() => {
    const base: TrashEntity[] = [
      ...trashedItems.map((item) => ({
        id: item.id,
        kind: "item" as const,
        title: item.title,
        type: item.type,
        createdAt: item.createdAt,
      })),
      ...trashedFolders.map((folder) => ({
        id: folder.id,
        kind: "folder" as const,
        title: folder.name,
        type: "folder" as const,
        createdAt: folder.deletedAt ?? folder.createdAt,
      })),
    ];

    const byFilter = base.filter((entity) => {
      if (filter === "notes") return entity.kind === "item" && entity.type === "note";
      if (filter === "ai") return entity.kind === "item" && (entity.type === "youtube" || entity.type === "url");
      return true;
    });

    const q = search.trim().toLowerCase();
    const bySearch = q ? byFilter.filter((entity) => entity.title.toLowerCase().includes(q)) : byFilter;
    return bySearch.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [trashedItems, trashedFolders, filter, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, TrashEntity[]> = {};
    for (const entity of entities) {
      const group = getDateGroup(entity.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(entity);
    }
    return groups;
  }, [entities]);

  const groupOrder = ["TODAY", "YESTERDAY", "PAST WEEK", "PAST MONTH", "OLDER"];
  const sortedGroups = groupOrder.filter((group) => grouped[group]?.length);

  const filters: { key: Filter; label: string; color?: string; icon?: React.ReactNode }[] = [
    { key: "all", label: "All results" },
    { key: "notes", label: "Notes", color: "#2d6a4f", icon: <IconDoc /> },
    { key: "ai", label: "Eden AI", color: "#7c3aed", icon: <IconSparkle /> },
    { key: "trash", label: "Trash", color: "#c35b6a", icon: <IconTrash /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#ffffff" }}>
      <div style={{ padding: "16px 18px", borderBottom: "1px solid #efefed", background: "#faf5f7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9f5965" }}>
          <span style={{ width: 28, height: 28, borderRadius: 14, background: "#f3e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconTrash />
          </span>
          <span style={{ fontSize: 15 }}>Items in trash will be permanently deleted after 30 days.</span>
        </div>
        <button
          type="button"
          style={{
            border: "none",
            borderRadius: 12,
            background: "#f3e7eb",
            color: "#a34c5b",
            padding: "8px 14px",
            fontSize: 14,
            cursor: "not-allowed",
          }}
          title="Coming soon"
        >
          Empty Trash
        </button>
      </div>

      <div style={{ padding: "16px 18px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f6f6f5", border: "1px solid #ececea", borderRadius: 24, padding: "10px 14px", marginBottom: 12 }}>
          <span style={{ color: "#8a8986", display: "flex" }}><IconSearch /></span>
          <span style={{ border: "1px solid #e8c3cc", background: "#f9eef1", color: "#a24f5f", borderRadius: 999, padding: "3px 10px", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <IconTrash /> Trash
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anything..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 30, color: "#3a3833" }}
          />
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            style={{
              width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
              background: viewMode === "grid" ? "#e3eee8" : "transparent", color: "#8a8986", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <IconGrid />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            style={{
              width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
              background: viewMode === "list" ? "#e3eee8" : "transparent", color: "#8a8986", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <IconList />
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          {filters.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1px solid ${active ? (tab.color ?? "#37352f") : "#dddcd8"}`,
                  background: active ? `${(tab.color ?? "#37352f")}15` : "#ffffff",
                  color: active ? (tab.color ?? "#37352f") : "#67655f",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 44, color: "#23211d", fontFamily: "Georgia, Times New Roman, serif" }}>Trash</h2>
          <span style={{ color: "#8f8d86", fontSize: 27 }}>Date created</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 18px" }}>
        {loading ? (
          <div style={{ padding: "18px 6px", fontSize: 25, color: "#8a8986" }}>Loading trash...</div>
        ) : entities.length === 0 ? (
          <div style={{ padding: "18px 6px", fontSize: 25, color: "#8a8986" }}>No items in trash</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {sortedGroups.map((groupName) => (
              <section key={groupName}>
                <div style={{ fontSize: 22, letterSpacing: "0.03em", color: "#7f7d77", marginBottom: 10 }}>{groupName}</div>
                {(() => {
                  const groupEntities = grouped[groupName] ?? [];
                  if (viewMode === "grid") {
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
                        {groupEntities.map((entity) => (
                          <TrashCard key={`${entity.kind}-${entity.id}`} entity={entity} />
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {groupEntities.map((entity) => (
                        <TrashListRow key={`${entity.kind}-${entity.id}`} entity={entity} />
                      ))}
                    </div>
                  );
                })()}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
