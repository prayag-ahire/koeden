import { ItemsView } from "../../components/ItemsView";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; openItem?: string }>;
}) {
  const params = await searchParams;
  const scope = params.view === "recents" ? "recents" : "workspace";
  return <ItemsView scope={scope} openItemId={params.openItem} />;
}
