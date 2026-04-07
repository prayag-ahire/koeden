"use client";
import { useState } from "react";

type Section = "account" | "import" | "integrations" | "preferences" | "workspace" | "snippets" | "billing";

function IconPerson() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconSliders() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

function IconCreditCard() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: "none",
        background: on ? "#2d6a4f" : "#e0e0de",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#ffffff",
          transition: "left 0.2s",
          display: "block",
        }}
      />
    </button>
  );
}

function AccountContent() {
  const [supportAccess, setSupportAccess] = useState(false);

  return (
    <div style={{ padding: "24px 28px" }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "#37352f", margin: "0 0 20px" }}>Account</h2>

      {/* Avatar + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "#2d6a4f", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 600, color: "#ffffff", flexShrink: 0,
        }}>
          A
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#37352f", margin: "0 0 2px" }}>Account</p>
          <p style={{ fontSize: 12, color: "#787774", margin: 0 }}>user@example.com</p>
        </div>
      </div>

      {/* Name field */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "#787774", display: "block", marginBottom: 5 }}>Name</label>
        <input
          defaultValue="user@example.com"
          style={{
            width: "100%", fontSize: 13, padding: "8px 10px",
            border: "1px solid #e8e8e7", borderRadius: 6,
            background: "#fafaf9", color: "#37352f", outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Email field */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "#787774", display: "block", marginBottom: 5 }}>Email</label>
        <input
          defaultValue="user@example.com"
          style={{
            width: "100%", fontSize: 13, padding: "8px 10px",
            border: "1px solid #e8e8e7", borderRadius: 6,
            background: "#fafaf9", color: "#37352f", outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ height: 1, background: "#e8e8e7", margin: "0 0 16px" }} />

      {/* Support access toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#37352f", margin: "0 0 2px" }}>Support access</p>
          <p style={{ fontSize: 12, color: "#787774", margin: 0 }}>Allow support team to access your account</p>
        </div>
        <Toggle on={supportAccess} onToggle={() => setSupportAccess((v) => !v)} />
      </div>

      <div style={{ height: 1, background: "#e8e8e7", margin: "0 0 16px" }} />

      {/* Help center row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#37352f", margin: "0 0 2px" }}>Visit help center</p>
          <p style={{ fontSize: 12, color: "#787774", margin: 0 }}>Browse guides and documentation</p>
        </div>
        <button style={{
          fontSize: 12, fontWeight: 500, padding: "6px 12px",
          border: "1px solid #e8e8e7", borderRadius: 6,
          background: "#ffffff", color: "#37352f", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          Open help center <IconExternalLink />
        </button>
      </div>
    </div>
  );
}

function ImportContent() {
  const integrations = [
    { name: "Kortex", desc: "Import your Kortex highlights and notes", status: "connect" as const, icon: "K" },
    { name: "Google Drive", desc: "Import documents from Google Drive", status: "soon" as const, icon: "G" },
    { name: "Notion", desc: "Import pages and databases from Notion", status: "soon" as const, icon: "N" },
    { name: "Dropbox", desc: "Import files from Dropbox", status: "soon" as const, icon: "D" },
  ];

  return (
    <div style={{ padding: "24px 28px" }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "#37352f", margin: "0 0 6px" }}>Import</h2>
      <p style={{ fontSize: 13, color: "#787774", margin: "0 0 20px" }}>Connect services to import your existing content.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {integrations.map((item) => (
          <div key={item.name} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", border: "1px solid #e8e8e7",
            borderRadius: 8, background: "#fafaf9",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: "#ebebea", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#37352f", flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#37352f", margin: "0 0 2px" }}>{item.name}</p>
              <p style={{ fontSize: 12, color: "#787774", margin: 0 }}>{item.desc}</p>
            </div>
            {item.status === "connect" ? (
              <button style={{
                fontSize: 12, fontWeight: 500, padding: "5px 12px",
                border: "1px solid #2d6a4f", borderRadius: 6,
                background: "#ffffff", color: "#2d6a4f", cursor: "pointer",
              }}>
                Connect
              </button>
            ) : (
              <span style={{
                fontSize: 11, fontWeight: 500, padding: "4px 10px",
                borderRadius: 6, background: "#f4f4f2", color: "#9b9a97",
              }}>
                Coming Soon
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComingSoonContent({ title }: { title: string }) {
  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <p style={{ fontSize: 15, fontWeight: 500, color: "#37352f", margin: "0 0 6px" }}>{title}</p>
      <p style={{ fontSize: 13, color: "#9b9a97", margin: 0 }}>Coming soon</p>
    </div>
  );
}

function IntegrationsContent() {
  const integrations = [
    { name: "Slack", desc: "Send AI summaries to Slack channels", status: "connect" as const, icon: "S" },
    { name: "Make", desc: "Connect to Make (Integromat) automation", status: "soon" as const, icon: "M" },
    { name: "Zapier", desc: "Integrate with Zapier workflows", status: "soon" as const, icon: "Z" },
    { name: "Email", desc: "Forward content via email digest", status: "soon" as const, icon: "✉" },
  ];

  return (
    <div style={{ padding: "24px 28px" }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "#37352f", margin: "0 0 6px" }}>Integrations</h2>
      <p style={{ fontSize: 13, color: "#787774", margin: "0 0 20px" }}>Connect external services and automate your workflow.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {integrations.map((item) => (
          <div key={item.name} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", border: "1px solid #e8e8e7",
            borderRadius: 8, background: "#fafaf9",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#ffffff", flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#37352f", margin: "0 0 2px" }}>{item.name}</p>
              <p style={{ fontSize: 12, color: "#787774", margin: 0 }}>{item.desc}</p>
            </div>
            {item.status === "connect" ? (
              <button style={{
                fontSize: 12, fontWeight: 500, padding: "5px 12px",
                border: "1px solid #7c3aed", borderRadius: 6,
                background: "#ffffff", color: "#7c3aed", cursor: "pointer",
              }}>
                Connect
              </button>
            ) : (
              <span style={{
                fontSize: 11, fontWeight: 500, padding: "4px 10px",
                borderRadius: 6, background: "#f4f4f2", color: "#9b9a97",
              }}>
                Coming Soon
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<Section>("account");

  const accountItems: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "account", label: "Account", icon: <IconPerson /> },
    { key: "import", label: "Import", icon: <IconDownload /> },
    { key: "integrations", label: "Integrations", icon: <IconLink /> },
    { key: "preferences", label: "Preferences", icon: <IconSliders /> },
  ];

  const workspaceItems: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "workspace", label: "Workspace", icon: <IconCloud /> },
    { key: "snippets", label: "Snippets", icon: <IconBookmark /> },
    { key: "billing", label: "Billing", icon: <IconCreditCard /> },
  ];

  function renderContent() {
    switch (active) {
      case "account": return <AccountContent />;
      case "import": return <ImportContent />;
      case "integrations": return <IntegrationsContent />;
      case "preferences": return <ComingSoonContent title="Preferences" />;
      case "workspace": return <ComingSoonContent title="Workspace" />;
      case "snippets": return <ComingSoonContent title="Snippets" />;
      case "billing": return <ComingSoonContent title="Billing" />;
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 860, height: 580, maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 32px)",
          background: "#ffffff", borderRadius: 12,
          display: "flex", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            width: 26, height: 26, borderRadius: 6,
            border: "none", background: "transparent",
            cursor: "pointer", color: "#9b9a97",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 400,
          }}
        >
          ×
        </button>

        {/* Left sidebar */}
        <div style={{
          width: 220, flexShrink: 0,
          background: "#f9f9f8", borderRight: "1px solid #e8e8e7",
          display: "flex", flexDirection: "column",
          padding: "16px 0",
          overflowY: "auto",
        }}>
          {/* Sidebar header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px 12px" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#37352f" }}>Settings</span>
            <button style={{
              width: 24, height: 24, borderRadius: 5,
              border: "none", background: "transparent",
              cursor: "pointer", color: "#9b9a97",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IconGrid />
            </button>
          </div>

          {/* Account section */}
          <div style={{ padding: "0 8px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9b9a97", margin: "0 0 2px", padding: "0 6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Account</p>
            {accountItems.map((item) => (
              <SidebarItem
                key={item.key}
                active={active === item.key}
                icon={item.icon}
                label={item.label}
                onClick={() => setActive(item.key)}
              />
            ))}
          </div>

          <div style={{ height: 1, background: "#e8e8e7", margin: "10px 0" }} />

          {/* Workspace section */}
          <div style={{ padding: "0 8px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9b9a97", margin: "0 0 2px", padding: "0 6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Workspace</p>
            {workspaceItems.map((item) => (
              <SidebarItem
                key={item.key}
                active={active === item.key}
                icon={item.icon}
                label={item.label}
                onClick={() => setActive(item.key)}
              />
            ))}
          </div>
        </div>

        {/* Right content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", padding: "5px 8px", marginBottom: 1,
        borderRadius: 6, border: "none", cursor: "pointer",
        background: active ? "#ebebea" : hovered ? "#f4f4f2" : "transparent",
        color: active ? "#37352f" : "#37352f",
        fontSize: 13, fontWeight: active ? 500 : 400,
        textAlign: "left",
        transition: "background 0.1s",
      }}
    >
      <span style={{ color: "#787774", display: "flex", flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );
}
