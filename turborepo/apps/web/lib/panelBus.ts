export type PanelMeta =
  | { kind: "chat"; chatId?: string; folderId?: string }
  | { kind: "item"; itemId: string; folderName?: string }
  | { kind: "library" }
  | { kind: "search" }
  | { kind: "activity" }
  | { kind: "trash" }
  | { kind: "tasks" };

type OpenPanelFn = (title: string, content: React.ReactNode, meta?: PanelMeta) => void;

let _fn: OpenPanelFn | null = null;

export const panelBus = {
  register(fn: OpenPanelFn) { _fn = fn; },
  open(title: string, content: React.ReactNode, meta?: PanelMeta) { _fn?.(title, content, meta); },
};
