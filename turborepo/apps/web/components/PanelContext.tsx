"use client";
import { createContext, useContext } from "react";
import type { PanelMeta } from "../lib/panelBus";

export type PanelContextType = {
  openPanel: (title: string, content: React.ReactNode, meta?: PanelMeta) => void;
};

export const PanelContext = createContext<PanelContextType>({
  openPanel: () => {},
});

export function usePanels() {
  return useContext(PanelContext);
}
