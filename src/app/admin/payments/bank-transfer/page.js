import { AdminBankTransferClient } from "@/components/admin/AdminBankTransferClient";
import { getOrdersForAdmin } from "@/lib/queries/admin";

export default async function AdminBankTransferReportsPage() {
  const orders = await getOrdersForAdmin({ limit: 500 });
  const rows = orders.filter((o) => o.paymentMethod === "bank_transfer");

  return <AdminBankTransferClient initialOrders={rows} />;
}
