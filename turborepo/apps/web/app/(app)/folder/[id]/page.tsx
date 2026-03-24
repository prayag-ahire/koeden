import { ItemsView } from "../../../../components/ItemsView";

export default async function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ItemsView folderId={id} />;
}
