import { SidebarServer } from "../../components/SidebarServer";
import { PanelShell } from "../../components/PanelShell";
import { AppShell } from "../../components/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sidebar={<SidebarServer />}>
      <PanelShell>{children}</PanelShell>
    </AppShell>
  );
}
