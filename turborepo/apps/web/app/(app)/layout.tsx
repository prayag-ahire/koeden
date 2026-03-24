import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { SidebarServer } from "../../components/SidebarServer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <aside className="w-64 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-white">Koeden</Link>
          <UserButton />
        </div>
        <SidebarServer />
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
