import { AdminDeletionRequestsClient } from "@/components/admin/AdminDeletionRequestsClient";
import { getDeletionRequestsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminDeletionRequestsPage() {
  const requests = await getDeletionRequestsAdmin();

  return <AdminDeletionRequestsClient initialRequests={requests} />;
}
