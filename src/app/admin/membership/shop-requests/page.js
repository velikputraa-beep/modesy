import { AdminShopRequestsClient } from "@/components/admin/AdminShopRequestsClient";
import { getShopRequestsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminShopRequestsPage() {
  const requests = await getShopRequestsAdmin();

  return <AdminShopRequestsClient initialRequests={requests} />;
}
