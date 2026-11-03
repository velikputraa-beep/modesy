import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { getOrdersForAdmin } from "@/lib/queries/admin";

export default async function AdminOrdersPage() {
  const orders = await getOrdersForAdmin({ limit: 100 });

  return <AdminOrdersClient initialOrders={orders} />;
}
