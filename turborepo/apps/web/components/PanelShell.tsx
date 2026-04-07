"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PanelContext } from "./PanelContext";
import { panelBus } from "../lib/panelBus";
import type { PanelMeta } from "../lib/panelBus";
import { ChatPanel } from "./ChatPanel";
import { ItemPanel } from "./ItemPanel";
import { LibraryView } from "./LibraryView";
import { GlobalSearchPanel } from "./GlobalSearchPanel";
import { ActivityPanel } from "./ActivityPanel";
import { TrashPanel } from "./TrashPanel";
import { TasksPanel } from "./TasksPanel";

// ─── Layout tree ────────────────────────────────────────────────────────────

type PanelNode = { type: "panel"; id: string };
type SplitNode = {
  type: "split";
  sid: string; // unique split id for ratio tracking
  dir: "h" | "v"; // h = left|right, v = top|bottom
  ratio: number;
  a: LayoutNode;
  b: LayoutNode;
};
type LayoutNode = PanelNode | SplitNode;
type DropZone = "left" | "right" | "top" | "bottom" | "center";
type ParentDir = "h" | "v" | null;
type LeafInfo = { id: string; area: number; parentDir: ParentDir };

let _sid = 0;
const newSid = () => `s${_sid++}`;

function removePanel(node: LayoutNode, id: string): LayoutNode | null {
  if (node.type === "panel") return node.id === id ? null : node;
  const a = removePanel(node.a, id);
  const b = removePanel(node.b, id);
  if (a === null) return b;
  if (b === null) return a;
  return { ...node, a, b };
}

function insertAdjacent(
  root: LayoutNode,
  targetId: string,
  newNode: PanelNode,
  zone: DropZone
): LayoutNode {
  if (root.type === "panel") {
    if (root.id !== targetId) return root;
    if (zone === "center") return root; // swap handled separately
    const dir = zone === "left" || zone === "right" ? "h" : "v";
    const first = zone === "left" || zone === "top";
    return { type: "split", sid: newSid(), dir, ratio: 0.5, a: first ? newNode : root, b: first ? root : newNode };
  }
  return { ...root, a: insertAdjacent(root.a, targetId, newNode, zone), b: insertAdjacent(root.b, targetId, newNode, zone) };
}

function swapPanels(root: LayoutNode, idA: string, idB: string): LayoutNode {
  if (root.type === "panel") {
    if (root.id === idA) return { type: "panel", id: idB };
    if (root.id === idB) return { type: "panel", id: idA };
    return root;
  }
  return { ...root, a: swapPanels(root.a, idA, idB), b: swapPanels(root.b, idA, idB) };
}

function updateRatio(root: LayoutNode, sid: string, ratio: number): LayoutNode {
  if (root.type === "panel") return root;
  if (root.sid === sid) return { ...root, ratio };
  return { ...root, a: updateRatio(root.a, sid, ratio), b: updateRatio(root.b, sid, ratio) };
}

function getDropZone(e: React.DragEvent, el: HTMLElement): DropZone {
  const r = el.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  const w = r.width, h = r.height;
  if (x < w * 0.25) return "left";
  if (x > w * 0.75) return "right";
  if (y < h * 0.25) return "top";
  if (y > h * 0.75) return "bottom";
  return "center";
}

function collectLeafInfo(
  node: LayoutNode,
  area = 1,
  parentDir: ParentDir = null
): LeafInfo[] {
  if (node.type === "panel") {
    return [{ id: node.id, area, parentDir }];
  }

  return [
    ...collectLeafInfo(node.a, area * node.ratio, node.dir),
    ...collectLeafInfo(node.b, area * (1 - node.ratio), node.dir),
  ];
}

// ─── Panel registry ──────────────────────────────────────────────────────────

type PanelData = { id: string; title: string; content: React.ReactNode; meta?: PanelMeta };
type PersistedPanel = { id: string; title: string; meta?: PanelMeta };
type PersistedPanelState = {
  layout: LayoutNode;
  activePanelId: string;
  panels: PersistedPanel[];
};

const PANEL_STATE_KEY = "koeden_panel_state_v1";
let _pid = 2;

function makeTwoPaneLayout(secondaryId: string): LayoutNode {
  return {
    type: "split",
    sid: newSid(),
    dir: "h",
    ratio: 0.52,
    a: { type: "panel", id: "1" },
    b: { type: "panel", id: secondaryId },
  };
}

function buildPanelContent(meta?: PanelMeta): React.ReactNode | null {
  if (!meta) return null;

  switch (meta.kind) {
    case "chat":
      return <ChatPanel chatId={meta.chatId} folderId={meta.folderId} />;
    case "item":
      return <ItemPanel itemId={meta.itemId} folderName={meta.folderName} />;
    case "library":
      return <LibraryView />;
    case "search":
      return <GlobalSearchPanel />;
    case "activity":
      return <ActivityPanel />;
    case "trash":
      return <TrashPanel />;
    case "tasks":
      return <TasksPanel />;
    default:
      return null;
  }
}

function collectPanelIds(node: LayoutNode): string[] {
  if (node.type === "panel") return [node.id];
  return [...collectPanelIds(node.a), ...collectPanelIds(node.b)];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DropOverlay({ zone }: { zone: DropZone | null }) {
  if (!zone) return null;
  const styles: Record<DropZone, React.CSSProperties> = {
    left:   { top: 0, left: 0, width: "25%", height: "100%" },
    right:  { top: 0, right: 0, width: "25%", height: "100%" },
    top:    { top: 0, left: 0, width: "100%", height: "25%" },
    bottom: { bottom: 0, left: 0, width: "100%", height: "25%" },
    center: { top: 0, left: 0, width: "100%", height: "100%" },
  };
  return (
    <div style={{
      position: "absolute", ...styles[zone],
      background: "rgba(45,106,79,0.12)",
      border: "2px solid #2d6a4f",
      borderRadius: 6,
      pointerEvents: "none",
      zIndex: 20,
      transition: "all 0.1s",
    }} />
  );
}

function PanelHeader({
  title, canClose, onClose, onDragStart, onDragEnd, onTitleClick,
}: {
  title: string; canClose: boolean; onClose: () => void;
  onDragStart: (e: React.DragEvent) => void; onDragEnd: () => void;
  onTitleClick?: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        height: 44, borderBottom: "1px solid #e8e8e7",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 14px", flexShrink: 0, background: "#fcfcfb",
        cursor: "grab", userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {["←", "→"].map((a, i) => (
          <button key={i} draggable={false} onClick={(e) => e.stopPropagation()}
            style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: "#c7c5bf", cursor: "default", borderRadius: 4, fontSize: 13 }}
          >{a}</button>
        ))}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTitleClick?.();
          }}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#37352f",
            marginLeft: 6,
            border: "none",
            background: "transparent",
            cursor: onTitleClick ? "pointer" : "default",
            padding: 0,
          }}
          title={onTitleClick ? `Open ${title}` : title}
        >
          {title}
        </button>
      </div>
      {canClose && (
        <button draggable={false} onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: "#c7c5bf", cursor: "pointer", borderRadius: 4, fontSize: 18, lineHeight: 1 }}
          onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ebebea"; b.style.color = "#37352f"; }}
          onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.color = "#c7c5bf"; }}
        >×</button>
      )}
    </div>
  );
}

function Divider({
  dir, sid, onDragStart,
}: {
  dir: "h" | "v"; sid: string; onDragStart: (e: React.MouseEvent, sid: string, dir: "h" | "v", splitContainer: HTMLElement) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isH = dir === "h";
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => {
        const splitContainer = e.currentTarget.parentElement;
        if (!splitContainer) return;
        onDragStart(e, sid, dir, splitContainer);
      }}
      style={{
        [isH ? "width" : "height"]: hovered ? 4 : 1,
        [isH ? "height" : "width"]: "100%",
        flexShrink: 0,
        cursor: isH ? "col-resize" : "row-resize",
        background: hovered ? "rgba(45,106,79,0.45)" : "#dde0dc",
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 5, transition: "background 0.1s",
      }}
    >
      {hovered && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#ffffff", border: "1px solid #e8e8e7",
          borderRadius: 6, padding: "4px 10px",
          fontSize: 11, fontWeight: 500, color: "#787774",
          whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          pointerEvents: "none", userSelect: "none",
        }}>Split</div>
      )}
    </div>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export function PanelShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<LayoutNode>({ type: "panel", id: "1" });
  const [panels, setPanels] = useState<Map<string, PanelData>>(
    new Map([["1", { id: "1", title: "All items", content: null }]])
  );
  const [activePanelId, setActivePanelId] = useState("1");
  const panelsRef = useRef(panels);
  const activePanelIdRef = useRef(activePanelId);
  const draggedId = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PANEL_STATE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as PersistedPanelState;
      if (!saved || !saved.layout || !Array.isArray(saved.panels)) return;

      const restoredPanels = new Map<string, PanelData>([
        ["1", { id: "1", title: "All items", content: null }],
      ]);

      for (const panel of saved.panels) {
        if (panel.id === "1") continue;
        const content = buildPanelContent(panel.meta);
        if (!content) continue;
        restoredPanels.set(panel.id, {
          id: panel.id,
          title: panel.title,
          meta: panel.meta,
          content,
        });
      }

      const validPanelIds = new Set(restoredPanels.keys());
      const layoutPanelIds = collectPanelIds(saved.layout);
      const layoutIsValid = layoutPanelIds.every((id) => validPanelIds.has(id));

      if (!layoutIsValid) return;

      setPanels(restoredPanels);
      panelsRef.current = restoredPanels;
      setLayout(saved.layout);

      const activeId = validPanelIds.has(saved.activePanelId) ? saved.activePanelId : "1";
      setActivePanelId(activeId);

      const maxId = Array.from(validPanelIds)
        .map((id) => Number(id))
        .filter((n) => !Number.isNaN(n))
        .reduce((max, n) => Math.max(max, n), 1);
      _pid = Math.max(_pid, maxId + 1);
    } catch {
      // ignore corrupted cache
    }
  }, []);

  useEffect(() => {
    panelsRef.current = panels;
  }, [panels]);

  useEffect(() => {
    const routeView = searchParams.get("view");
    let mainTitle = "Workspace";
    if (pathname.startsWith("/folder/")) {
      mainTitle = "Workspace";
    } else if (pathname === "/" && routeView === "recents") {
      mainTitle = "Recents";
    } else if (pathname === "/" && routeView === "workspace") {
      mainTitle = "Workspace";
    } else if (pathname === "/") {
      mainTitle = "Workspace";
    }

    setPanels((prev) => {
      const current = prev.get("1");
      if (!current || current.title === mainTitle) return prev;
      const next = new Map(prev);
      next.set("1", { ...current, title: mainTitle });
      panelsRef.current = next;
      return next;
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    activePanelIdRef.current = activePanelId;
  }, [activePanelId]);

  useEffect(() => {
    try {
      const state: PersistedPanelState = {
        layout,
        activePanelId,
        panels: Array.from(panels.values()).map((panel) => ({
          id: panel.id,
          title: panel.title,
          meta: panel.meta,
        })),
      };
      window.localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(state));
    } catch {
      // ignore persistence errors
    }
  }, [layout, activePanelId, panels]);

  const openPanel = useCallback((title: string, content: React.ReactNode, meta?: PanelMeta) => {
    const prev = panelsRef.current;
    const isChatTitle = title === "AI Chat";
    const chatCount = Array.from(prev.values()).filter((p) => p.title.startsWith("AI Chat")).length;
    const resolvedTitle = isChatTitle && chatCount > 0 ? `AI Chat ${chatCount + 1}` : title;

    const id = String(_pid++);
    const next = new Map(prev);
    next.set(id, { id, title: resolvedTitle, content, meta });

    panelsRef.current = next;
    setPanels(next);
    setActivePanelId(id);

    setLayout((l) => {
      if (l.type === "panel" && l.id === "1") {
        return makeTwoPaneLayout(id);
      }

      const leaves = collectLeafInfo(l);
      const activeLeaf = leaves.find((leaf) => leaf.id === activePanelIdRef.current);
      const largestLeaf = leaves.reduce((max, leaf) => (leaf.area > max.area ? leaf : max), leaves[0]!);

      // If active panel is already very small, expand from the largest area panel instead.
      const targetLeaf = activeLeaf && activeLeaf.area >= 0.18 ? activeLeaf : largestLeaf;
      const targetId = targetLeaf.id;

      // Alternate split direction by parent orientation to keep layout grid-like.
      const zone: DropZone = targetLeaf.parentDir === "h" ? "bottom" : "right";
      return insertAdjacent(l, targetId, { type: "panel", id }, zone);
    });
  }, []);

  const closePanel = useCallback((id: string) => {
    setLayout((l) => removePanel(l, id) ?? l);
    setPanels((prev) => {
      const next = new Map(prev);
      next.delete(id);
      panelsRef.current = next;
      if (activePanelIdRef.current === id) {
        const fallbackId = Array.from(next.keys())[0] ?? "1";
        setActivePanelId(fallbackId);
      }
      return next;
    });
  }, []);

  useEffect(() => { panelBus.register(openPanel); }, [openPanel]);

  const handleDividerDrag = useCallback((
    e: React.MouseEvent,
    sid: string,
    dir: "h" | "v",
    splitContainer: HTMLElement
  ) => {
    e.preventDefault();
    const isH = dir === "h";
    const MIN_PANEL_PX = 220;

    const onMove = (ev: MouseEvent) => {
      const rect = splitContainer.getBoundingClientRect();
      const total = isH ? rect.width : rect.height;
      if (total <= 0) return;

      const rawRatio = isH
        ? (ev.clientX - rect.left) / total
        : (ev.clientY - rect.top) / total;

      const minRatio = Math.min(0.45, MIN_PANEL_PX / total);
      const clampedRatio = Math.min(1 - minRatio, Math.max(minRatio, rawRatio));

      setLayout((l) => updateRatio(l, sid, clampedRatio));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const mainContent = (
    <PanelContext.Provider value={{ openPanel }}>{children}</PanelContext.Provider>
  );

  function renderNode(node: LayoutNode): React.ReactNode {
    if (node.type === "split") {
      const isH = node.dir === "h";
      const aPct = `${node.ratio * 100}%`;
      const bPct = `${(1 - node.ratio) * 100}%`;
      return (
        <div style={{ display: "flex", flexDirection: isH ? "row" : "column", width: "100%", height: "100%", overflow: "hidden", background: "#f6f7f4" }}>
          <div style={{ [isH ? "width" : "height"]: aPct, [isH ? "height" : "width"]: "100%", overflow: "hidden", flexShrink: 0 }}>
            {renderNode(node.a)}
          </div>
          <Divider dir={node.dir} sid={node.sid} onDragStart={handleDividerDrag} />
          <div style={{ [isH ? "width" : "height"]: bPct, [isH ? "height" : "width"]: "100%", overflow: "hidden", flexShrink: 0 }}>
            {renderNode(node.b)}
          </div>
        </div>
      );
    }

    // panel leaf
    const panel = panels.get(node.id);
    if (!panel) return null;
    const isMain = node.id === "1";
    const totalPanels = panels.size;

    return (
      <PanelLeaf
        key={node.id}
        panel={panel}
        active={activePanelId === node.id}
        canClose={totalPanels > 1}
        isMain={isMain}
        onMainTitleClick={
          isMain
            ? () => {
                if (panel.title === "Recents") {
                  router.push("/?view=recents");
                } else {
                  router.push("/?view=workspace");
                }
              }
            : undefined
        }
        content={isMain ? mainContent : panel.content}
        onActivate={() => setActivePanelId(node.id)}
        onClose={() => closePanel(node.id)}
        onDragStart={() => { draggedId.current = node.id; }}
        onDragEnd={() => { draggedId.current = null; }}
        onDrop={(zone, e) => {
          const draggedChatRaw = e.dataTransfer.getData("application/x-koeden-chat");
          if (draggedChatRaw) {
            try {
              const draggedChat = JSON.parse(draggedChatRaw) as { chatId?: string; title?: string };
              const newId = String(_pid++);
              const title = typeof draggedChat.title === "string" && draggedChat.title.trim().length > 0
                ? draggedChat.title
                : "AI Chat";
              const chatId = typeof draggedChat.chatId === "string" ? draggedChat.chatId : undefined;

              const nextPanels = new Map(panelsRef.current);
              nextPanels.set(newId, {
                id: newId,
                title,
                meta: { kind: "chat", chatId },
                content: <ChatPanel chatId={chatId} />,
              });
              panelsRef.current = nextPanels;
              setPanels(nextPanels);
              setActivePanelId(newId);
              setLayout((l) => {
                if (l.type === "panel" && l.id === "1") return makeTwoPaneLayout(newId);
                return insertAdjacent(l, node.id, { type: "panel", id: newId }, zone === "center" ? "right" : zone);
              });
            } catch {
              // ignore invalid dragged payloads
            }
            return;
          }

          const draggedItemRaw = e.dataTransfer.getData("application/x-koeden-item");
          if (draggedItemRaw) {
            try {
              const draggedItem = JSON.parse(draggedItemRaw) as { id?: string; title?: string; folderName?: string };
              if (typeof draggedItem.id === "string" && typeof draggedItem.title === "string") {
                const newId = String(_pid++);
                const title = draggedItem.title;
                const folderName = typeof draggedItem.folderName === "string" ? draggedItem.folderName : "Workspace";
                const nextPanels = new Map(panelsRef.current);
                nextPanels.set(newId, {
                  id: newId,
                  title,
                  meta: { kind: "item", itemId: draggedItem.id, folderName },
                  content: <ItemPanel itemId={draggedItem.id} folderName={folderName} />,
                });
                panelsRef.current = nextPanels;
                setPanels(nextPanels);
                setActivePanelId(newId);
                setLayout((l) => {
                  if (l.type === "panel" && l.id === "1") return makeTwoPaneLayout(newId);
                  return insertAdjacent(l, node.id, { type: "panel", id: newId }, zone === "center" ? "right" : zone);
                });
              }
            } catch {
              // ignore invalid dragged payloads
            }
            return;
          }

          const from = draggedId.current;
          if (!from || from === node.id) return;
          if (zone === "center") {
            setLayout((l) => swapPanels(l, from, node.id));
          } else {
            setLayout((l) => {
              const stripped = removePanel(l, from) ?? l;
              return insertAdjacent(stripped, node.id, { type: "panel", id: from }, zone);
            });
          }
        }}
      />
    );
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden", background: "#f6f7f4" }}>
      {renderNode(layout)}
    </div>
  );
}

// ─── Panel leaf ───────────────────────────────────────────────────────────────

function PanelLeaf({
  panel, active, canClose, isMain, onMainTitleClick, content, onActivate, onClose, onDragStart, onDragEnd, onDrop,
}: {
  panel: PanelData; active: boolean; canClose: boolean;
  isMain: boolean;
  onMainTitleClick?: () => void;
  content: React.ReactNode;
  onActivate: () => void;
  onClose: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: (zone: DropZone, e: React.DragEvent<HTMLDivElement>) => void;
}) {
  const [dropZone, setDropZone] = useState<DropZone | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#ffffff",
        position: "relative",
        border: active ? "1px solid #9ec9b4" : "1px solid transparent",
        borderRadius: 0,
        overflow: "hidden",
        boxShadow: "none",
      }}
      onMouseDown={onActivate}
      onDragOver={(e) => {
        e.preventDefault();
        if (ref.current) setDropZone(getDropZone(e, ref.current));
      }}
      onDragLeave={() => setDropZone(null)}
      onDrop={(e) => {
        e.preventDefault();
        const zone = dropZone;
        setDropZone(null);
        if (zone) onDrop(zone, e);
      }}
    >
      <PanelHeader
        title={panel.title}
        canClose={canClose}
        onClose={onClose}
        onTitleClick={isMain ? onMainTitleClick : undefined}
        onDragStart={(e) => {
          onDragStart();
          const ghost = document.createElement("div");
          ghost.textContent = panel.title;
          Object.assign(ghost.style, {
            position: "fixed", top: "-100px", padding: "6px 14px",
            background: "#1a1a1a", color: "#fff", fontSize: "12px",
            fontWeight: "500", borderRadius: "8px", fontFamily: "system-ui",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          });
          document.body.appendChild(ghost);
          e.dataTransfer.setDragImage(ghost, 0, 0);
          setTimeout(() => document.body.removeChild(ghost), 0);
        }}
        onDragEnd={onDragEnd}
      />
      <div style={{ flex: 1, overflow: "auto", userSelect: "text" }}>{content}</div>
      <DropOverlay zone={dropZone} />
    </div>
  );
}
