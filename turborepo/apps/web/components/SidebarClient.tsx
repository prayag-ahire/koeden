"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { panelBus } from "../lib/panelBus";
import { sidebarBus } from "../lib/sidebarBus";
import { TrashPanel } from "./TrashPanel";
import { TasksPanel } from "./TasksPanel";
import { ActivityPanel } from "./ActivityPanel";
import { SettingsModal } from "./SettingsModal";
import { ChatPanel } from "./ChatPanel";
import { AddItemDialog } from "./AddItemDialog";
import { UserMenuDropdown } from "./UserMenuDropdown";
import { GlobalSearchPanel } from "./GlobalSearchPanel";
import { ItemPanel } from "./ItemPanel";
import { NewCanvasDialog } from "./NewCanvasDialog";

function ChatPanelLazy({ chatId }: { chatId?: string } = {}) { return <ChatPanel chatId={chatId} />; }

// ─── Sorting dropdown ──────────────────────────────────────────────────────
type SortOption = "a-z" | "z-a" | "newest" | "oldest";

function SortingDropdown({ sort, onSort, onClose }: { sort: SortOption; onSort: (s: SortOption) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const [displayMode, setDisplayMode] = useState<"list" | "grid">("list");

  return (
    <div
      ref={ref}
      style={{
        position: "absolute", top: 28, right: 0, zIndex: 200,
        background: "#ffffff", border: "1px solid #e8e8e7",
        borderRadius: 10, padding: "6px 0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        minWidth: 200,
      }}
    >
      {/* Display files row */}
      <div style={{ padding: "6px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#9b9a97", fontWeight: 500 }}>Display files</span>
        <div style={{ display: "flex", gap: 2 }}>
          <button
            onClick={() => setDisplayMode("list")}
            style={{
              width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", borderRadius: 5, cursor: "pointer",
              background: displayMode === "list" ? "#ebebea" : "transparent",
              color: displayMode === "list" ? "#37352f" : "#9b9a97",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          <button
            onClick={() => setDisplayMode("grid")}
            style={{
              width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", borderRadius: 5, cursor: "pointer",
              background: displayMode === "grid" ? "#ebebea" : "transparent",
              color: displayMode === "grid" ? "#37352f" : "#9b9a97",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </div>
      {/* Expand all */}
      <button
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "7px 14px", border: "none", background: "transparent",
          fontSize: 13, color: "#37352f", cursor: "pointer", textAlign: "left",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f2"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        Expand all
      </button>
      <div style={{ height: 1, background: "#f0f0ef", margin: "4px 0" }} />
      <div style={{ padding: "6px 14px 4px", fontSize: 11, fontWeight: 600, color: "#9b9a97", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
        Sort by
      </div>
      {(["a-z", "z-a", "newest", "oldest"] as SortOption[]).map((opt) => {
        const labels: Record<SortOption, string> = { "a-z": "A–Z", "z-a": "Z–A", "newest": "Newest first", "oldest": "Oldest first" };
        return (
          <button
            key={opt}
            onClick={() => { onSort(opt); onClose(); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "7px 14px", border: "none", background: "transparent",
              fontSize: 13, color: "#37352f", cursor: "pointer", textAlign: "left",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f2"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            {labels[opt]}
            {sort === opt && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── New dropdown menu ─────────────────────────────────────────────────────
const NEW_ITEMS = [
  { icon: "📝", label: "New Note", color: "#2d6a4f" },
  { icon: "🟪", label: "New Canvas", color: "#7c3aed" },
  { icon: "✦", label: "New Chat", color: "#2d6a4f" },
  { icon: "🔗", label: "Paste Link", color: "#2383e2" },
  null, // divider
  { icon: "📁", label: "New Folder", color: "#787774" },
  { icon: "⬆", label: "Upload Files", color: "#787774" },
  { icon: "📂", label: "Upload Folder", color: "#787774" },
] as const;

type NewDropdownProps = {
  onClose: () => void;
  top?: number; left?: number; right?: number;
  onNewNote?: () => void;
  onNewCanvas?: () => void;
  onNewFolder?: () => void;
  onPasteLink?: () => void;
  onNewChat?: () => void;
};

function NewDropdown({ onClose, top = 44, left = 8, right, onNewNote, onNewCanvas, onNewFolder, onPasteLink, onNewChat }: NewDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  function handleClick(label: string) {
    onClose();
    if (label === "New Note") onNewNote?.();
    else if (label === "New Canvas") onNewCanvas?.();
    else if (label === "New Folder") onNewFolder?.();
    else if (label === "Paste Link") onPasteLink?.();
    else if (label === "New Chat") onNewChat?.();
  }

  return (
    <div
      ref={ref}
      style={{
        position: "absolute", top, ...(right !== undefined ? { right } : { left }), zIndex: 100,
        background: "#ffffff", border: "1px solid #e8e8e7",
        borderRadius: 10, padding: "6px 0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        minWidth: 200,
      }}
    >
      {NEW_ITEMS.map((item, i) =>
        item === null ? (
          <div key={i} style={{ height: 1, background: "#f0f0ef", margin: "4px 0" }} />
        ) : (
          <button
            key={item.label}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClick(item.label);
            }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "7px 14px", border: "none", background: "transparent",
              fontSize: 13, color: "#37352f", cursor: "pointer", textAlign: "left",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f2"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// ─── Sidebar icon ──────────────────────────────────────────────────────────
function SidebarToggleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" />
    </svg>
  );
}

type Folder = { id: string; name: string };
type ChatSummary = { id: string; title: string };
type SidebarItem = { id: string; title: string; type: "note" | "youtube" | "url"; folderId: string | null };
type FolderFileItem = { id: string; title: string; type: "note" | "youtube" | "url" };

const s = {
  sidebar: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
    background: "linear-gradient(180deg, #f9f9f8 0%, #f6f7f5 100%)",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 12px 10px 14px",
  },
  appName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1a1a1a",
    textDecoration: "none",
    letterSpacing: "-0.02em",
  },
  newBtn: {
    fontSize: 12,
    fontWeight: 500,
    color: "#787774",
    background: "transparent",
    border: "1px solid #e8e8e7",
    borderRadius: 6,
    padding: "3px 8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
  iconRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "6px 10px 10px",
  },
  iconBtn: {
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#9b9a97",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#8a8986",
    padding: "10px 14px 6px",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "7px 10px",
    margin: "0 4px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: "#37352f",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.12s ease",
  },
  navLinkHover: {
    background: "#ececea",
  },
  navLinkActive: {
    background: "#e5f2eb",
    color: "#1d5c40",
    boxShadow: "inset 0 0 0 1px #d2e8dc",
  },
  divider: {
    height: 1,
    background: "#e4e5e2",
    margin: "8px 0",
  },
  bottomBar: {
    borderTop: "1px solid #e8e8e7",
    padding: "10px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomIcons: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
};

function IconHome() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function IconLibrary() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
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

function IconFolder() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.12s ease" }}
    >
      <polyline points="9 18 15 12 9 6" />
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function FolderNavItem({
  href,
  name,
  expanded,
  onToggleExpand,
  active,
  deleting,
  onAddNote,
  onNewCanvas,
  onPasteLink,
  onNewFolder,
  onNewChat,
  onDelete,
}: {
  href: string;
  name: string;
  expanded: boolean;
  onToggleExpand: () => void;
  active?: boolean;
  deleting?: boolean;
  onAddNote: () => void;
  onNewCanvas: () => void;
  onPasteLink: () => void;
  onNewFolder: () => void;
  onNewChat: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  return (
    <div
      style={{ position: "relative", margin: "0 4px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={href}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        style={{
          ...s.navLink,
          margin: 0,
          paddingRight: 58,
          ...(active ? s.navLinkActive : {}),
          ...(hovered && !active ? s.navLinkHover : {}),
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleExpand();
          }}
          title={expanded ? "Collapse folder" : "Expand folder"}
          style={{
            width: 16,
            height: 16,
            border: "none",
            background: "transparent",
            color: "#9b9a97",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <IconChevron open={expanded} />
        </button>
        <IconFolder />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      </Link>

      {(hovered || deleting || showNewMenu) && (
        <>
          <button
            type="button"
            title="Add in folder"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowNewMenu((v) => !v);
            }}
            style={{
              position: "absolute",
              right: 31,
              top: "50%",
              transform: "translateY(-50%)",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              color: showNewMenu ? "#37352f" : "#9b9a97",
              background: showNewMenu ? "#ebebea" : "transparent",
              fontSize: 16,
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = "#ebebea";
              b.style.color = "#37352f";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = showNewMenu ? "#ebebea" : "transparent";
              b.style.color = showNewMenu ? "#37352f" : "#9b9a97";
            }}
          >
            +
          </button>
          <button
            type="button"
            title="Move folder to trash"
            disabled={deleting}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            style={{
              position: "absolute",
              right: 7,
              top: "50%",
              transform: "translateY(-50%)",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              borderRadius: 5,
              cursor: deleting ? "not-allowed" : "pointer",
              color: deleting ? "#c7c5bf" : "#9b9a97",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              if (!deleting) {
                b.style.background = "#fce8e8";
                b.style.color = "#d23b3b";
              }
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = "transparent";
              b.style.color = deleting ? "#c7c5bf" : "#9b9a97";
            }}
          >
            <IconTrash />
          </button>
          {showNewMenu && (
            <NewDropdown
              onClose={() => setShowNewMenu(false)}
              top={24}
              right={2}
              onNewNote={() => onAddNote()}
              onNewCanvas={() => onNewCanvas()}
              onNewFolder={() => onNewFolder()}
              onPasteLink={() => onPasteLink()}
              onNewChat={() => onNewChat()}
            />
          )}
        </>
      )}
    </div>
  );
}

function FileNavItem({
  item,
  folderName,
  onOpen,
}: {
  item: SidebarItem;
  folderName?: string;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData(
          "application/x-koeden-item",
          JSON.stringify({
            id: item.id,
            title: item.title,
            folderName: folderName ?? "Workspace",
          })
        );
      }}
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...s.navLink,
        margin: "0 4px",
        cursor: "grab",
        background: hovered ? "#ececea" : "transparent",
      }}
      title={item.title}
    >
      <IconDoc />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
        {item.title}
      </span>
    </div>
  );
}

function IconBtnHover({ children, title, onClick }: { children: React.ReactNode; title?: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      style={{ ...s.iconBtn, ...(hovered ? { background: "#ebebea", color: "#37352f" } : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

function WorkspaceSectionLabel({
  active,
  onOpenWorkspace,
  onClickPlus,
}: {
  active?: boolean;
  onOpenWorkspace: () => void;
  onClickPlus: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sort, setSort] = useState<SortOption>("a-z");
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      onClick={onOpenWorkspace}
      style={{
        ...s.sectionLabel,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        padding: "8px 10px 8px 14px",
        margin: "0 4px 6px",
        borderRadius: 8,
        background: active ? "#e7e9e7" : hovered ? "#ececea" : "transparent",
        color: active ? "#5d5b56" : "#8a8986",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span>Workspace</span>
      {hovered && (
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {/* Filter icon */}
          <button
            title="Filter"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", background: "transparent", cursor: "pointer", color: "#9b9a97", borderRadius: 4,
            }}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ebebea"; b.style.color = "#37352f"; }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.color = "#9b9a97"; }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
          {/* Dots (sorting) */}
          <div style={{ position: "relative" }}>
            <button
              title="Sorting options"
              onClick={(e) => { e.stopPropagation(); setShowSort((v) => !v); }}
              style={{
                width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", background: showSort ? "#ebebea" : "transparent", cursor: "pointer",
                color: showSort ? "#37352f" : "#9b9a97", borderRadius: 4,
              }}
              onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ebebea"; b.style.color = "#37352f"; }}
              onMouseLeave={(e) => { if (!showSort) { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.color = "#9b9a97"; } }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>
            </button>
            {showSort && (
              <SortingDropdown sort={sort} onSort={setSort} onClose={() => setShowSort(false)} />
            )}
          </div>
          {/* Plus */}
          <button
            title="New item"
            onClick={(e) => { e.stopPropagation(); onClickPlus(); }}
            style={{
              width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", background: "transparent", cursor: "pointer", color: "#9b9a97", borderRadius: 4,
            }}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ebebea"; b.style.color = "#37352f"; }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.color = "#9b9a97"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export function SidebarClient({ initialFolders }: { initialFolders: Folder[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const inRecentsView = pathname === "/" && viewParam === "recents";
  const inWorkspaceView = pathname === "/" && viewParam !== "recents";
  const [folders, setFolders] = useState(initialFolders);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<"home" | "ai" | "library">("home");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showWorkspaceNewMenu, setShowWorkspaceNewMenu] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCanvasDialog, setShowCanvasDialog] = useState(false);
  const [addDialogTab, setAddDialogTab] = useState<"note" | "url">("note");
  const [addDialogFolderId, setAddDialogFolderId] = useState<string | undefined>(undefined);
  const [canvasDialogFolderId, setCanvasDialogFolderId] = useState<string | undefined>(undefined);
  const [creatingNote, setCreatingNote] = useState(false);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [recentItems, setRecentItems] = useState<SidebarItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderItemsById, setFolderItemsById] = useState<Record<string, FolderFileItem[]>>({});
  const [loadingFolderItems, setLoadingFolderItems] = useState<Set<string>>(new Set());

  async function refreshRecentItems() {
    try {
      const res = await fetch("/api/items");
      const data = (await res.json()) as unknown;
      if (!Array.isArray(data)) return setRecentItems([]);
      setRecentItems(
        data
          .map((item) => {
            const parsed = item as { id?: unknown; title?: unknown; type?: unknown; folderId?: unknown };
            if (
              typeof parsed.id === "string" &&
              typeof parsed.title === "string" &&
              (parsed.type === "note" || parsed.type === "youtube" || parsed.type === "url")
            ) {
              return {
                id: parsed.id,
                title: parsed.title,
                type: parsed.type,
                folderId: typeof parsed.folderId === "string" ? parsed.folderId : null,
              };
            }
            return null;
          })
          .filter((item): item is SidebarItem => item !== null)
          .slice(0, 8)
      );
    } catch {
      setRecentItems([]);
    }
  }

  // Load chats when switching to AI mode
  useEffect(() => {
    if (mode === "ai") {
      fetch("/api/chats")
        .then((r) => r.json())
        .then((data: unknown) =>
          setChats(
            Array.isArray(data)
              ? data
                  .map((chat) => {
                    const parsed = chat as { id?: unknown; title?: unknown };
                    if (typeof parsed.id === "string" && typeof parsed.title === "string") {
                      return { id: parsed.id, title: parsed.title };
                    }
                    return null;
                  })
                  .filter((chat): chat is ChatSummary => chat !== null)
              : []
          )
        )
        .catch(() => setChats([]));
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "home") return;
    void refreshRecentItems();
  }, [mode]);

  function openAddDialog(tab: "note" | "url", folderId?: string) {
    setAddDialogTab(tab);
    setAddDialogFolderId(folderId);
    setShowAddDialog(true);
  }

  async function createAndOpenNote(folderId?: string) {
    if (creatingNote) return;
    setCreatingNote(true);
    try {
      const res = await fetch("/api/ingest/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Note",
          content: " ",
          folderId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      const data = (await res.json()) as { itemId?: string };
      if (!data.itemId) throw new Error("Missing note id");

      if (folderId && expandedFolders.has(folderId)) {
        setFolderItemsById((prev) => ({
          ...prev,
          [folderId]: [
            { id: data.itemId!, title: "New Note", type: "note" },
            ...(prev[folderId] ?? []),
          ],
        }));
      }
      await refreshRecentItems();

      setMode("home");
      if (folderId) {
        router.push(`/folder/${folderId}?openItem=${data.itemId}`);
      } else {
        router.push(`/?view=workspace&openItem=${data.itemId}`);
      }
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setCreatingNote(false);
    }
  }

  function openCanvasDialog(folderId?: string) {
    setCanvasDialogFolderId(folderId);
    setShowCanvasDialog(true);
  }

  async function createCanvas(name: string) {
    const canvasTitle = name.trim() || "New Canvas";
    const res = await fetch("/api/ingest/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: canvasTitle,
        content: "Canvas",
        folderId: canvasDialogFolderId,
      }),
    });
    if (!res.ok) {
      console.error("Failed to create canvas");
      return;
    }
    const data = (await res.json()) as { itemId?: string };
    const createdItemId = data.itemId;
    if (!createdItemId) {
      console.error("Canvas created without item id");
      return;
    }

    const targetFolderName = canvasDialogFolderId
      ? folders.find((folder) => folder.id === canvasDialogFolderId)?.name
      : "Workspace";

    if (canvasDialogFolderId && expandedFolders.has(canvasDialogFolderId)) {
      setFolderItemsById((prev) => ({
        ...prev,
        [canvasDialogFolderId]: [
          { id: createdItemId, title: canvasTitle, type: "note" },
          ...(prev[canvasDialogFolderId] ?? []),
        ],
      }));
    }
    await refreshRecentItems();

    panelBus.open(
      canvasTitle,
      <ItemPanel itemId={createdItemId} folderName={targetFolderName} />,
      { kind: "item", itemId: createdItemId, folderName: targetFolderName }
    );
    setShowCanvasDialog(false);
    setCanvasDialogFolderId(undefined);
    setMode("home");
    if (targetFolderName) {
      router.push(canvasDialogFolderId ? `/folder/${canvasDialogFolderId}` : "/");
    }
  }

  async function createFolder() {
    if (!newName.trim()) return;
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const folder = await res.json();
    setFolders((f) => [...f, folder]);
    setNewName("");
    setCreating(false);
  }

  async function deleteFolder(folderId: string) {
    setDeletingFolderId(folderId);
    try {
      const res = await fetch(`/api/folders/${folderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete folder");

      setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
      if (pathname === `/folder/${folderId}`) {
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
    } finally {
      setDeletingFolderId(null);
    }
  }

  async function loadFolderItems(folderId: string) {
    setLoadingFolderItems((prev) => new Set(prev).add(folderId));
    try {
      const res = await fetch(`/api/items?folderId=${folderId}`);
      if (!res.ok) throw new Error("Failed to fetch folder items");
      const data = (await res.json()) as unknown;
      const items = Array.isArray(data)
        ? data
            .map((item) => {
              const parsed = item as { id?: unknown; title?: unknown; type?: unknown };
              if (
                typeof parsed.id === "string" &&
                typeof parsed.title === "string" &&
                (parsed.type === "note" || parsed.type === "youtube" || parsed.type === "url")
              ) {
                return { id: parsed.id, title: parsed.title, type: parsed.type };
              }
              return null;
            })
            .filter((item): item is FolderFileItem => item !== null)
        : [];
      setFolderItemsById((prev) => ({ ...prev, [folderId]: items }));
    } catch {
      setFolderItemsById((prev) => ({ ...prev, [folderId]: [] }));
    } finally {
      setLoadingFolderItems((prev) => {
        const next = new Set(prev);
        next.delete(folderId);
        return next;
      });
    }
  }

  function toggleFolder(folderId: string) {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
        if (!folderItemsById[folderId] && !loadingFolderItems.has(folderId)) {
          void loadFolderItems(folderId);
        }
      }
      return next;
    });
  }

  return (
    <div style={s.sidebar}>
      {/* Top: app name + new + collapse */}
      <div style={{ ...s.topBar, position: "relative" }}>
        <Link href="/" style={s.appName}>Koeden</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => setShowNewMenu((v) => !v)}
            style={{
              ...s.newBtn,
              background: showNewMenu ? "#ebebea" : "transparent",
              color: showNewMenu ? "#37352f" : "#787774",
            }}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ebebea"; b.style.color = "#37352f"; }}
            onMouseLeave={(e) => { if (!showNewMenu) { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.color = "#787774"; } }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> New
          </button>
          <button
            onClick={() => sidebarBus.collapse()}
            title="Collapse sidebar"
            style={{ ...s.iconBtn }}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ebebea"; b.style.color = "#37352f"; }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.color = "#9b9a97"; }}
          >
            <SidebarToggleIcon />
          </button>
        </div>
        {showNewMenu && (
          <NewDropdown
            onClose={() => setShowNewMenu(false)}
            onNewNote={() => { void createAndOpenNote(); }}
            onNewCanvas={() => openCanvasDialog()}
            onNewFolder={() => { setCreating(true); }}
            onPasteLink={() => openAddDialog("url")}
            onNewChat={() => {
              setMode("ai");
              panelBus.open("AI Chat", <ChatPanelLazy />, { kind: "chat" });
            }}
          />
        )}
      </div>

      {/* Icon nav row */}
      <div style={s.iconRow}>
        <IconBtnHover title="Home" onClick={() => setMode("home")}>
          <IconHome />
        </IconBtnHover>
        {/* Eden AI tab */}
        <button
          title="Eden AI"
          onClick={() => { setMode("ai"); }}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 9px", borderRadius: 8, border: "none", cursor: "pointer",
            background: mode === "ai" ? "#e5f2eb" : "transparent",
            color: mode === "ai" ? "#1d5c40" : "#9b9a97",
            fontSize: 12, fontWeight: 500,
          }}
          onMouseEnter={(e) => { if (mode !== "ai") (e.currentTarget as HTMLButtonElement).style.background = "#ececea"; }}
          onMouseLeave={(e) => { if (mode !== "ai") (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          Eden AI
        </button>
        <button
          title="Library"
          onClick={() => setMode("library")}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 9px", borderRadius: 8, border: "none", cursor: "pointer",
            background: mode === "library" ? "#e5f2eb" : "transparent",
            color: mode === "library" ? "#1d5c40" : "#9b9a97",
            fontSize: 12, fontWeight: 500,
          }}
          onMouseEnter={(e) => { if (mode !== "library") (e.currentTarget as HTMLButtonElement).style.background = "#ececea"; }}
          onMouseLeave={(e) => { if (mode !== "library") (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <IconLibrary />
          Library
        </button>
        <IconBtnHover title="Search" onClick={() => panelBus.open("Search", <GlobalSearchPanel />, { kind: "search" })}><IconSearch /></IconBtnHover>
      </div>

      <div style={s.divider} />

      {mode === "home" ? (
        <>
          {/* Recents */}
          <Link
            href="/?view=recents"
            style={{
              ...s.sectionLabel,
              display: "block",
              margin: "0 4px 6px",
              padding: "8px 14px",
              borderRadius: 8,
              textDecoration: "none",
              background: inRecentsView ? "#e7e9e7" : "transparent",
              color: inRecentsView ? "#5d5b56" : "#8a8986",
            }}
          >
            Recents
          </Link>
          {recentItems.map((item) => (
            <FileNavItem
              key={item.id}
              item={item}
              folderName={item.folderId ? folders.find((f) => f.id === item.folderId)?.name : "Workspace"}
              onOpen={() => {
                const resolvedFolderName = item.folderId ? folders.find((f) => f.id === item.folderId)?.name : "Workspace";
                panelBus.open(
                  item.title,
                  <ItemPanel itemId={item.id} folderName={resolvedFolderName} />,
                  { kind: "item", itemId: item.id, folderName: resolvedFolderName }
                );
              }}
            />
          ))}
          <div style={{ ...s.divider, marginTop: 8 }} />
          {/* Workspace / Folders */}
          <div style={{ position: "relative" }}>
            <WorkspaceSectionLabel
              active={inWorkspaceView}
              onOpenWorkspace={() => router.push("/?view=workspace")}
              onClickPlus={() => setShowWorkspaceNewMenu((v) => !v)}
            />
            {showWorkspaceNewMenu && (
              <NewDropdown
                onClose={() => setShowWorkspaceNewMenu(false)}
                top={28} left={8}
                onNewNote={() => { void createAndOpenNote(); }}
                onNewCanvas={() => openCanvasDialog()}
                onNewFolder={() => { setCreating(true); }}
                onPasteLink={() => openAddDialog("url")}
                onNewChat={() => {
                  setMode("ai");
                  panelBus.open("AI Chat", <ChatPanelLazy />, { kind: "chat" });
                }}
              />
            )}
          </div>
          <div style={{ flex: 1, overflowY: "auto" as const }}>
            {folders.map((folder) => (
              <div key={folder.id}>
                <FolderNavItem
                  href={`/folder/${folder.id}`}
                  name={folder.name}
                  expanded={expandedFolders.has(folder.id)}
                  onToggleExpand={() => toggleFolder(folder.id)}
                  active={pathname === `/folder/${folder.id}`}
                  deleting={deletingFolderId === folder.id}
                  onAddNote={() => { void createAndOpenNote(folder.id); }}
                  onNewCanvas={() => openCanvasDialog(folder.id)}
                  onPasteLink={() => openAddDialog("url", folder.id)}
                  onNewFolder={() => setCreating(true)}
                  onNewChat={() => {
                    setMode("ai");
                    panelBus.open("AI Chat", <ChatPanelLazy />, { kind: "chat" });
                  }}
                  onDelete={() => void deleteFolder(folder.id)}
                />
                {expandedFolders.has(folder.id) && (
                  <div style={{ marginLeft: 26, marginRight: 4, marginTop: 2, marginBottom: 6 }}>
                    {loadingFolderItems.has(folder.id) ? (
                      <div style={{ fontSize: 12, color: "#9b9a97", padding: "4px 10px" }}>Loading...</div>
                    ) : (folderItemsById[folder.id] ?? []).length === 0 ? (
                      <div style={{ fontSize: 12, color: "#9b9a97", padding: "4px 10px" }}>No files</div>
                    ) : (
                      (folderItemsById[folder.id] ?? []).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            panelBus.open(
                              item.title,
                              <ItemPanel itemId={item.id} folderName={folder.name} />,
                              { kind: "item", itemId: item.id, folderName: folder.name }
                            );
                          }}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = "copy";
                            e.dataTransfer.setData(
                              "application/x-koeden-item",
                              JSON.stringify({ id: item.id, title: item.title, folderName: folder.name })
                            );
                          }}
                          style={{
                            ...s.navLink,
                            margin: 0,
                            padding: "5px 8px",
                            fontSize: 12,
                            color: "#5f5d57",
                            gap: 7,
                            cursor: "grab",
                          }}
                          title={item.title}
                        >
                          <IconDoc />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
            {creating ? (
              <div style={{ display: "flex", gap: 4, padding: "4px 8px", margin: "0 4px" }}>
                <input
                  autoFocus value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setCreating(false); }}
                  placeholder="Folder name"
                  style={{ flex: 1, fontSize: 13, padding: "4px 8px", border: "1px solid #e8e8e7", borderRadius: 6, outline: "none", background: "#ffffff", color: "#1a1a1a" }}
                />
                <button onClick={createFolder} style={{ fontSize: 12, padding: "4px 10px", background: "#2d6a4f", color: "#ffffff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}>
                  Add
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : mode === "ai" ? (
        /* AI mode sidebar */
        <div style={{ flex: 1, overflowY: "auto" as const }}>
          <div style={s.sectionLabel}>Agents</div>
          <div style={{ ...s.navLink, display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", margin: "0 4px", color: "#c7c5bf", fontSize: 13, userSelect: "none" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            New Agent
          </div>
          <div style={{ ...s.divider, margin: "8px 0" }} />
          <div style={s.sectionLabel}>Chats</div>
          <div
            style={{ ...s.navLink, display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", margin: "0 4px", cursor: "pointer" }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData(
                "application/x-koeden-chat",
                JSON.stringify({ title: "AI Chat" })
              );
            }}
            onClick={() => panelBus.open("AI Chat", <ChatPanelLazy />, { kind: "chat" })}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#ebebea"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            New Chat
          </div>
          {chats.length > 0 && (
            <div>
              <div style={{ ...s.divider, margin: "8px 0" }} />
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  style={{ ...s.navLink, display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", margin: "0 4px", cursor: "pointer" }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData(
                      "application/x-koeden-chat",
                      JSON.stringify({ chatId: chat.id, title: chat.title })
                    );
                  }}
                  onClick={() => panelBus.open(chat.title, <ChatPanel chatId={chat.id} />, { kind: "chat", chatId: chat.id })}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#ebebea"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  title={chat.title}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Library mode sidebar */
        <div style={{ flex: 1, overflowY: "auto" as const, padding: "10px 10px 14px" }}>
          <div
            style={{
              background: "#ececea",
              borderRadius: 12,
              padding: "14px 14px",
              fontSize: 14,
              lineHeight: 1.55,
              color: "#4d4b46",
              marginBottom: 18,
            }}
          >
            Library is where items created in a chat, agent, or canvas are saved by default.
            You can also treat it as a place to save items like links or quick notes without cluttering your workspace.
          </div>
          <div style={{ fontSize: 32, color: "#5b5954", lineHeight: 1.2 }}>
            No unsorted items
          </div>
        </div>
      )}

      {/* Bottom: user + icons */}
      <div style={{ borderTop: "1px solid #e8e8e7" }}>
        {/* User row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 12px", cursor: "pointer", borderRadius: 8, margin: "6px" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#ebebea"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          <UserMenuDropdown />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#37352f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              My workspace
            </div>
            <div style={{ fontSize: 11, color: "#9b9a97" }}>Free plan</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9b9a97" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
          </svg>
        </div>
        {/* Icon row */}
        <div style={{ ...s.bottomBar, borderTop: "1px solid #f0f0ef" }}>
          <div style={s.bottomIcons}>
            <IconBtnHover title="Activity" onClick={() => panelBus.open("Activity", <ActivityPanel />, { kind: "activity" })}><IconActivity /></IconBtnHover>
            <IconBtnHover title="Trash" onClick={() => panelBus.open("Trash", <TrashPanel />, { kind: "trash" })}><IconTrash /></IconBtnHover>
            <IconBtnHover title="Tasks" onClick={() => panelBus.open("Tasks", <TasksPanel />, { kind: "tasks" })}><IconBolt /></IconBtnHover>
            <IconBtnHover title="Settings" onClick={() => setShowSettings(true)}><IconSettings /></IconBtnHover>
          </div>
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showAddDialog && (
        <AddItemDialog
          folderId={addDialogFolderId}
          initialTab={addDialogTab}
          onClose={() => {
            setShowAddDialog(false);
            setAddDialogFolderId(undefined);
          }}
          onAdded={(itemId) => {
            setShowAddDialog(false);
            setAddDialogFolderId(undefined);
            setMode("home");
            if (itemId) {
              const targetFolderName = addDialogFolderId
                ? folders.find((folder) => folder.id === addDialogFolderId)?.name
                : "Workspace";
              panelBus.open("New Note", <ItemPanel itemId={itemId} folderName={targetFolderName} />, {
                kind: "item",
                itemId,
                folderName: targetFolderName,
              });
            }
          }}
        />
      )}
      {showCanvasDialog && (
        <NewCanvasDialog
          saveToLabel={canvasDialogFolderId ? (folders.find((folder) => folder.id === canvasDialogFolderId)?.name ?? "Home") : "Home"}
          onClose={() => {
            setShowCanvasDialog(false);
            setCanvasDialogFolderId(undefined);
          }}
          onCreate={createCanvas}
        />
      )}
    </div>
  );
}
