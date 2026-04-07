"use client";
import { useState, useEffect } from "react";

type Activity = {
  id: string;
  type: "upload" | "download" | "processing";
  title: string;
  progress: number; // 0-100
  status: "pending" | "in-progress" | "completed" | "error";
};

function IconUpload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
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

function IconSparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function getActivityIcon(type: Activity["type"]) {
  if (type === "upload") return <IconUpload />;
  if (type === "download") return <IconDownload />;
  return <IconSparkle />;
}

function getStatusColor(status: Activity["status"]) {
  if (status === "completed") return "#2d6a4f";
  if (status === "error") return "#e03e3e";
  if (status === "in-progress") return "#7c3aed";
  return "#9b9a97";
}

export function ActivityPanel() {
  const [activities] = useState<Activity[]>([]);

  // Demo: simulate some activity
  useEffect(() => {
    // In a real app, this would fetch from an API
    // setActivities([...]);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#ffffff" }}>
      {/* Header */}
      <div style={{
        padding: "16px 18px",
        borderBottom: "1px solid #e8e8e7",
        flexShrink: 0,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#37352f", margin: 0 }}>Activity</h3>
      </div>

      {/* Content */}
      {activities.length === 0 ? (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "32px 16px",
          textAlign: "center",
        }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f4f4f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconSparkle />
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#37352f", margin: "0 0 4px" }}>No activity</p>
          <p style={{ fontSize: 12, color: "#9b9a97", margin: 0, maxWidth: 200 }}>
            Uploads, downloads, processing tasks will appear here
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                padding: "12px",
                borderRadius: 8,
                border: "1px solid #e8e8e7",
                marginBottom: 8,
                background: "#fafaf9",
              }}
            >
              {/* Activity header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{ color: getStatusColor(activity.status), flexShrink: 0, marginTop: 2 }}>
                  {getActivityIcon(activity.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "#37352f", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {activity.title}
                  </p>
                  <p style={{ fontSize: 11, color: "#9b9a97", margin: "2px 0 0" }}>
                    {activity.status === "completed" && "Completed"}
                    {activity.status === "error" && "Error"}
                    {activity.status === "in-progress" && `${activity.progress}%`}
                    {activity.status === "pending" && "Waiting..."}
                  </p>
                </div>
                {activity.status === "completed" && (
                  <div style={{ color: "#2d6a4f", flexShrink: 0 }}><IconCheck /></div>
                )}
                {activity.status === "error" && (
                  <div style={{ color: "#e03e3e", flexShrink: 0 }}><IconX /></div>
                )}
              </div>

              {/* Progress bar */}
              {activity.status === "in-progress" && (
                <div style={{
                  width: "100%",
                  height: 3,
                  background: "#e8e8e7",
                  borderRadius: 2,
                  overflow: "hidden",
                }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${activity.progress}%`,
                      background: "#7c3aed",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
