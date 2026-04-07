"use client";

export function CanvasPanel({ title }: { title: string }) {
  return (
    <div
      style={{
        height: "100%",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 26, color: "#2f2c27", fontFamily: "Georgia, Times New Roman, serif" }}>
        {title}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#9b9a97" }}>
        Canvas created. Start organizing your ideas here.
      </p>
    </div>
  );
}
