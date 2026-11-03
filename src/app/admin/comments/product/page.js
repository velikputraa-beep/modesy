import { AdminProductCommentsClient } from "@/components/admin/AdminProductCommentsClient";
import { getAdminComments } from "@/lib/queries/admin";

export default async function AdminProductCommentsPage() {
  const comments = await getAdminComments({ limit: 100 });

  return <AdminProductCommentsClient initialComments={comments} />;
}
