"use client";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { AddItemDialog } from "./AddItemDialog";

type Item = {
  id: string;
  title: string;
  type: string;
  sourceUrl?: string;
  createdAt: string;
};

export function ItemsView({ folderId }: { folderId?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: { folderId },
  });

  async function search(q: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (folderId) params.set("folderId", folderId);
    const res = await fetch(`/api/items?${params}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  async function deleteItem(id: string) {
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="flex h-full">
      {/* Left: items */}
      <div className="flex-1 flex flex-col p-6 gap-4">
        <div className="flex gap-2">
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") search(searchQ); }}
            placeholder="Semantic search..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => search(searchQ)}
            className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm hover:bg-indigo-500"
          >
            Search
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="px-4 py-2 bg-emerald-600 rounded-lg text-white text-sm hover:bg-emerald-500"
          >
            + Add
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Searching...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm">No items yet. Add a note, YouTube video, or URL.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-xs text-gray-600 hover:text-red-400"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: RAG chat */}
      <div className="w-96 border-l border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300">AI Chat</h2>
          <p className="text-xs text-gray-500">Asks across your knowledge base</p>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`text-sm rounded-lg p-3 ${
                m.role === "user"
                  ? "bg-indigo-900 text-indigo-100 ml-4"
                  : "bg-gray-800 text-gray-200 mr-4"
              }`}
            >
              {m.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
          <button type="submit" className="px-3 py-2 bg-indigo-600 rounded-lg text-white text-sm hover:bg-indigo-500">
            Send
          </button>
        </form>
      </div>

      {showAddDialog && (
        <AddItemDialog
          folderId={folderId}
          onClose={() => setShowAddDialog(false)}
          onAdded={() => { setShowAddDialog(false); search(searchQ); }}
        />
      )}
    </div>
  );
}
