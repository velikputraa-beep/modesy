import { AdminRefundRequestsClient } from "@/components/admin/AdminRefundRequestsClient";
import { getOrdersForAdmin } from "@/lib/queries/admin";

export default async function AdminRefundRequestsPage() {
  const orders = await getOrdersForAdmin({ limit: 500 });
  const rows = orders.filter(
    (o) => o.paymentStatus === "refunded" || o.paymentStatus === "pending"
  );

  return <AdminRefundRequestsClient initialOrders={rows} />;
}
