import { ItemsView } from "../../../../components/ItemsView";

export default async function FolderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ openItem?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <ItemsView folderId={id} openItemId={query.openItem} />;
}
