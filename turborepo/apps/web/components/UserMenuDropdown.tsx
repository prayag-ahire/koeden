"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";

function IconBell() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 20 7 20 17 12 22 4 17 4 7 12 2" /><polyline points="12 12 20 7" /><polyline points="12 12 12 22" /><polyline points="12 12 4 7" />
    </svg>
  );
}

function IconLogOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function UserMenuDropdown() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWorkspaceInvites, setShowWorkspaceInvites] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const userName = user?.firstName || user?.username || "User";
  const avatarUrl = user?.imageUrl;

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* Avatar button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: "#e8e8e7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: 0,
        }}
        title="User menu"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={userName} style={{ width: "100%", height: "100%" }} />
        ) : (
          <span style={{ color: "#37352f", fontSize: 14 }}>
            {userName[0]?.toUpperCase()}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 0,
            background: "#ffffff",
            border: "1px solid #e8e8e7",
            borderRadius: 8,
            zIndex: 200,
            minWidth: 240,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {/* User info header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e8e8e7" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#37352f" }}>{userName}</div>
            <div style={{ fontSize: 11, color: "#9b9a97", marginTop: 2 }}>{userEmail}</div>
          </div>

          {/* Notifications submenu */}
          <div
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
            style={{ position: "relative" }}
          >
            <button
              style={{
                width: "100%",
                padding: "8px 16px",
                fontSize: 12,
                color: "#37352f",
                background: showNotifications ? "#f0faf5" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f0faf5"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = showNotifications ? "#f0faf5" : "transparent"; }}
            >
              <IconBell />
              <span style={{ flex: 1 }}>Notifications</span>
              <span style={{ color: "#c7c5bf", fontSize: 10 }}>›</span>
            </button>

            {/* Notifications submenu */}
            {showNotifications && (
              <div style={{
                position: "absolute",
                left: "100%",
                top: 0,
                marginLeft: 4,
                background: "#ffffff",
                border: "1px solid #e8e8e7",
                borderRadius: 6,
                minWidth: 160,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}>
                <div style={{ padding: "8px 12px", fontSize: 11, color: "#9b9a97", cursor: "default" }}>
                  No new notifications
                </div>
              </div>
            )}
          </div>

          {/* Workspace Invites submenu */}
          <div
            onMouseEnter={() => setShowWorkspaceInvites(true)}
            onMouseLeave={() => setShowWorkspaceInvites(false)}
            style={{ position: "relative" }}
          >
            <button
              style={{
                width: "100%",
                padding: "8px 16px",
                fontSize: 12,
                color: "#37352f",
                background: showWorkspaceInvites ? "#f0faf5" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f0faf5"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = showWorkspaceInvites ? "#f0faf5" : "transparent"; }}
            >
              <IconLayers />
              <span style={{ flex: 1 }}>Workspace Invites</span>
              <span style={{ color: "#c7c5bf", fontSize: 10 }}>›</span>
            </button>

            {/* Workspace Invites submenu */}
            {showWorkspaceInvites && (
              <div style={{
                position: "absolute",
                left: "100%",
                top: 0,
                marginLeft: 4,
                background: "#ffffff",
                border: "1px solid #e8e8e7",
                borderRadius: 6,
                minWidth: 160,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}>
                <div style={{ padding: "8px 12px", fontSize: 11, color: "#9b9a97", cursor: "default" }}>
                  No pending invites
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#e8e8e7", margin: "4px 0" }} />

          {/* Switch Workspace */}
          <button
            style={{
              width: "100%",
              padding: "8px 16px",
              fontSize: 12,
              color: "#37352f",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f0faf5"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <IconLayers />
            <span>Switch Workspace</span>
          </button>

          {/* Divider */}
          <div style={{ height: "1px", background: "#e8e8e7", margin: "4px 0" }} />

          {/* Sign Out */}
          <button
            onClick={() => {
              setShowDropdown(false);
              signOut();
            }}
            style={{
              width: "100%",
              padding: "8px 16px",
              fontSize: 12,
              color: "#e03e3e",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#ffe8e8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <IconLogOut />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
