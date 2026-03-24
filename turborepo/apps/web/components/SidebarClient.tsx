"use client";
import Link from "next/link";
import { useState } from "react";

type Folder = { id: string; name: string };

export function SidebarClient({ initialFolders }: { initialFolders: Folder[] }) {
  const [folders, setFolders] = useState(initialFolders);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  async function createFolder() {
    if (!newName.trim()) return;
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const folder = await res.json();
    setFolders((f) => [...f, folder]);
    setNewName("");
    setCreating(false);
  }

  return (
    <nav className="flex-1 overflow-auto p-3 space-y-1">
      <Link
        href="/"
        className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
      >
        All items
      </Link>

      <div className="pt-4 pb-1 px-3 text-xs font-semibold text-gray-500 uppercase">
        Folders
      </div>

      {folders.map((folder) => (
        <Link
          key={folder.id}
          href={`/folder/${folder.id}`}
          className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          {folder.name}
        </Link>
      ))}

      {creating ? (
        <div className="flex gap-1 px-3 py-1">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setCreating(false); }}
            className="flex-1 text-sm bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white outline-none"
            placeholder="Folder name"
          />
          <button onClick={createFolder} className="text-xs px-2 py-1 bg-indigo-600 rounded text-white">Add</button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-300"
        >
          + New folder
        </button>
      )}
    </nav>
  );
}
