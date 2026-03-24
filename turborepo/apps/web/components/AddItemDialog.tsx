"use client";
import { useState } from "react";

type Tab = "note" | "youtube" | "url";

export function AddItemDialog({
  folderId,
  onClose,
  onAdded,
}: {
  folderId?: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [tab, setTab] = useState<Tab>("note");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const endpoint =
        tab === "note"
          ? "/api/ingest/note"
          : tab === "youtube"
          ? "/api/ingest/youtube"
          : "/api/ingest/url";

      const body =
        tab === "note"
          ? { content: value, folderId }
          : { url: value, folderId };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed");
      }

      onAdded();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Add to knowledge base</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">x</button>
        </div>

        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {(["note", "youtube", "url"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setValue(""); }}
              className={`flex-1 py-1.5 text-sm rounded-md capitalize font-medium transition-colors ${
                tab === t ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {t === "youtube" ? "YouTube" : t}
            </button>
          ))}
        </div>

        {tab === "note" ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={6}
            placeholder="Write your note..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 resize-none"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={tab === "youtube" ? "https://youtube.com/watch?v=..." : "https://..."}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={submit}
          disabled={loading || !value.trim()}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg"
        >
          {loading ? "Processing..." : "Add"}
        </button>
      </div>
    </div>
  );
}
