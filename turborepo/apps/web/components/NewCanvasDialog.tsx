"use client";
import { useState } from "react";

export function NewCanvasDialog({
  saveToLabel,
  onClose,
  onCreate,
}: {
  saveToLabel?: string;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [hovered, setHovered] = useState(false);

  const disabled = name.trim().length === 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(24, 27, 30, 0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 70,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(92vw, 580px)",
          background: "#ffffff",
          border: "1px solid #d8d8d6",
          borderRadius: 14,
          boxShadow: "0 14px 48px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #ececea", fontSize: 34, lineHeight: 1.1, color: "#32302b", fontFamily: "Georgia, Times New Roman, serif" }}>
          New Canvas
        </div>

        <div style={{ padding: "14px 22px 12px" }}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !disabled) onCreate(name.trim());
              if (e.key === "Escape") onClose();
            }}
            placeholder="Canvas name..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: 50,
              borderRadius: 10,
              border: "1.5px solid #7ea793",
              outline: "none",
              background: "#f6f7f6",
              padding: "0 14px",
              fontSize: 31,
              color: "#37352f",
              fontFamily: "Georgia, Times New Roman, serif",
            }}
          />
        </div>

        <div style={{ padding: "0 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 23, color: "#8a8986", fontFamily: "Georgia, Times New Roman, serif" }}>Save to</span>
            <button
              type="button"
              style={{
                height: 32,
                borderRadius: 10,
                border: "1px solid #e2e2df",
                background: "#f6f7f6",
                color: "#45433f",
                padding: "0 12px",
                fontSize: 24,
                fontFamily: "Georgia, Times New Roman, serif",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {saveToLabel ?? "Home"}
              <span style={{ fontSize: 15, color: "#787774" }}>▾</span>
            </button>
          </div>

          <button
            type="button"
            disabled={disabled}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => {
              if (!disabled) onCreate(name.trim());
            }}
            style={{
              height: 32,
              minWidth: 96,
              borderRadius: 10,
              border: "none",
              background: disabled ? "#bfd4cb" : hovered ? "#1b4e39" : "#245b44",
              color: "#ffffff",
              fontSize: 24,
              fontFamily: "Georgia, Times New Roman, serif",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
