import { AdminPaymentsClient } from "@/components/admin/AdminPaymentsClient";
import { getOrdersForAdmin, getWalletTransactionsForAdmin } from "@/lib/queries/admin";

export default async function AdminPaymentsOverviewPage() {
  const [orders, transactions] = await Promise.all([
    getOrdersForAdmin({ limit: 200 }),
    getWalletTransactionsForAdmin({ limit: 100 }),
  ]);

  return <AdminPaymentsClient initialOrders={orders} initialTransactions={transactions} />;
}
