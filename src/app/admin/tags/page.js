import { AdminTagsClient } from "@/components/admin/AdminTagsClient";
import { getTagsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminTagsPage() {
  const tags = await getTagsAdmin();

  return <AdminTagsClient initialTags={tags} />;
}
