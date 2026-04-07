"use client";
import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import type { UIMessage } from "ai";

function IconSend() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function ChatPanel({ folderId, chatId: initialChatId }: { folderId?: string; chatId?: string }) {
  const [chatId, setChatId] = useState(initialChatId || "");
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<string>>(new Set());
  const [pinnedMessages, setPinnedMessages] = useState<Set<string>>(new Set());
  const chatIdRef = useRef(chatId);

  const { messages, input, handleInputChange, handleSubmit: origHandleSubmit, setMessages } = useChat({
    api: "/api/chat",
    body: { folderId, chatId },
    onFinish: async (message) => {
      // Save assistant message to DB
      if (chatIdRef.current) {
        await fetch(`/api/chats/${chatIdRef.current}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "assistant", content: message.content }),
        });
      }
    },
  });

  const toggleLike = (messageId: string) => {
    if (likedMessages.has(messageId)) {
      setLikedMessages((s) => { const n = new Set(s); n.delete(messageId); return n; });
    } else {
      setLikedMessages((s) => new Set([...s, messageId]));
      setDislikedMessages((s) => { const n = new Set(s); n.delete(messageId); return n; });
    }
  };

  const toggleDislike = (messageId: string) => {
    if (dislikedMessages.has(messageId)) {
      setDislikedMessages((s) => { const n = new Set(s); n.delete(messageId); return n; });
    } else {
      setDislikedMessages((s) => new Set([...s, messageId]));
      setLikedMessages((s) => { const n = new Set(s); n.delete(messageId); return n; });
    }
  };

  const toggleBookmark = (messageId: string) => {
    if (bookmarkedMessages.has(messageId)) {
      setBookmarkedMessages((s) => { const n = new Set(s); n.delete(messageId); return n; });
    } else {
      setBookmarkedMessages((s) => new Set([...s, messageId]));
    }
  };

  const togglePin = (messageId: string) => {
    if (pinnedMessages.has(messageId)) {
      setPinnedMessages((s) => { const n = new Set(s); n.delete(messageId); return n; });
    } else {
      setPinnedMessages((s) => new Set([...s, messageId]));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Load initial messages if chatId provided
  useEffect(() => {
    if (initialChatId && messages.length === 0) {
      fetch(`/api/chats/${initialChatId}`)
        .then((r) => r.json())
        .then((data: { messages?: Array<{ id: string; role: "user" | "assistant"; content: string }> }) => {
          if (Array.isArray(data.messages)) {
            const hydratedMessages: UIMessage[] = data.messages.map((message) => ({
              id: message.id,
              role: message.role,
              content: message.content,
              parts: [{ type: "text", text: message.content }],
            }));
            setMessages(hydratedMessages);
          }
        });
    }
  }, [initialChatId, messages.length, setMessages]);

  // Create chat on first message if needed
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create chat if not exists
    if (!chatId) {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input.substring(0, 50), folderId }),
      });
      const newChat = await res.json();
      setChatId(newChat.id);
      chatIdRef.current = newChat.id;
    }

    // Save user message
    if (chatId || chatIdRef.current) {
      const cid = chatId || chatIdRef.current;
      await fetch(`/api/chats/${cid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: input }),
      });
    }

    // Call original handler
    await origHandleSubmit(e);
  };

  chatIdRef.current = chatId;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Welcome state */}
      {messages.length === 0 && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 8, padding: "40px 24px",
        }}>
          <div style={{ fontSize: 28, color: "#2d6a4f" }}>✦</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}>
            How can I help?
          </div>
          <div style={{ fontSize: 13, color: "#9b9a97", textAlign: "center" }}>
            Ask anything across your knowledge base
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: m.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 8,
              }}
              onMouseEnter={() => setHoveredMessageId(m.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  padding: "10px 14px",
                  borderRadius: 12,
                  maxWidth: "70%",
                  background: m.role === "user" ? "#1a1a1a" : "#f4f4f2",
                  color: m.role === "user" ? "#ffffff" : "#37352f",
                }}
              >
                {m.content}
              </div>

              {/* Action buttons - appear on hover */}
              {hoveredMessageId === m.id && (
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                    opacity: 0.7,
                  }}
                >
                  <button
                    title="Copy"
                    onClick={() => copyToClipboard(m.content)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#9b9a97",
                      padding: "4px 6px",
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#ebebea";
                      (e.currentTarget as HTMLButtonElement).style.color = "#37352f";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "none";
                      (e.currentTarget as HTMLButtonElement).style.color = "#9b9a97";
                    }}
                  >
                    📋
                  </button>

                  <button
                    title={bookmarkedMessages.has(m.id) ? "Unbookmark" : "Bookmark"}
                    onClick={() => toggleBookmark(m.id)}
                    style={{
                      background: bookmarkedMessages.has(m.id) ? "#2d6a4f" : "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: bookmarkedMessages.has(m.id) ? "#ffffff" : "#9b9a97",
                      padding: "4px 6px",
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => {
                      if (!bookmarkedMessages.has(m.id)) {
                        (e.currentTarget as HTMLButtonElement).style.background = "#ebebea";
                        (e.currentTarget as HTMLButtonElement).style.color = "#37352f";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!bookmarkedMessages.has(m.id)) {
                        (e.currentTarget as HTMLButtonElement).style.background = "none";
                        (e.currentTarget as HTMLButtonElement).style.color = "#9b9a97";
                      }
                    }}
                  >
                    🔖
                  </button>

                  <button
                    title={pinnedMessages.has(m.id) ? "Unpin" : "Pin"}
                    onClick={() => togglePin(m.id)}
                    style={{
                      background: pinnedMessages.has(m.id) ? "#2d6a4f" : "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: pinnedMessages.has(m.id) ? "#ffffff" : "#9b9a97",
                      padding: "4px 6px",
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => {
                      if (!pinnedMessages.has(m.id)) {
                        (e.currentTarget as HTMLButtonElement).style.background = "#ebebea";
                        (e.currentTarget as HTMLButtonElement).style.color = "#37352f";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!pinnedMessages.has(m.id)) {
                        (e.currentTarget as HTMLButtonElement).style.background = "none";
                        (e.currentTarget as HTMLButtonElement).style.color = "#9b9a97";
                      }
                    }}
                  >
                    📌
                  </button>

                  <button
                    title="Like"
                    onClick={() => toggleLike(m.id)}
                    style={{
                      background: likedMessages.has(m.id) ? "#2d6a4f" : "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: likedMessages.has(m.id) ? "#ffffff" : "#9b9a97",
                      padding: "4px 6px",
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => {
                      if (!likedMessages.has(m.id)) {
                        (e.currentTarget as HTMLButtonElement).style.background = "#ebebea";
                        (e.currentTarget as HTMLButtonElement).style.color = "#37352f";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!likedMessages.has(m.id)) {
                        (e.currentTarget as HTMLButtonElement).style.background = "none";
                        (e.currentTarget as HTMLButtonElement).style.color = "#9b9a97";
                      }
                    }}
                  >
                    👍
                  </button>

                  <button
                    title="Dislike"
                    onClick={() => toggleDislike(m.id)}
                    style={{
                      background: dislikedMessages.has(m.id) ? "#e03e3e" : "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: dislikedMessages.has(m.id) ? "#ffffff" : "#9b9a97",
                      padding: "4px 6px",
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => {
                      if (!dislikedMessages.has(m.id)) {
                        (e.currentTarget as HTMLButtonElement).style.background = "#ebebea";
                        (e.currentTarget as HTMLButtonElement).style.color = "#37352f";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!dislikedMessages.has(m.id)) {
                        (e.currentTarget as HTMLButtonElement).style.background = "none";
                        (e.currentTarget as HTMLButtonElement).style.color = "#9b9a97";
                      }
                    }}
                  >
                    👎
                  </button>

                  <button
                    title="Refresh"
                    onClick={() => {
                      // Placeholder: refresh response
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#9b9a97",
                      padding: "4px 6px",
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#ebebea";
                      (e.currentTarget as HTMLButtonElement).style.color = "#37352f";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "none";
                      (e.currentTarget as HTMLButtonElement).style.color = "#9b9a97";
                    }}
                  >
                    🔄
                  </button>

                  <button
                    title="More"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#9b9a97",
                      padding: "4px 6px",
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#ebebea";
                      (e.currentTarget as HTMLButtonElement).style.color = "#37352f";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "none";
                      (e.currentTarget as HTMLButtonElement).style.color = "#9b9a97";
                    }}
                  >
                    ⋯
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #e8e8e7",
          background: "#ffffff",
        }}
      >
        <div style={{
          border: "1px solid #e8e8e7",
          borderRadius: 12,
          background: "#fafaf9",
          padding: "10px 14px",
        }}>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Plan, @ for context, / for commands"
            style={{
              width: "100%", fontSize: 13,
              border: "none", outline: "none",
              background: "transparent", color: "#1a1a1a",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <div style={{ display: "flex", gap: 12 }}>
              {["📎", "@", "✦"].map((icon, i) => (
                <button
                  key={i}
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#9b9a97", padding: 0 }}
                >
                  {icon}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: input.trim() ? "#1a1a1a" : "#e8e8e7",
                color: input.trim() ? "#ffffff" : "#9b9a97",
                border: "none", borderRadius: "50%",
                cursor: input.trim() ? "pointer" : "default",
                transition: "background 0.15s",
              }}
            >
              <IconSend />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
