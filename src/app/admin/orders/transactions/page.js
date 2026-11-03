import { AdminTransactionsClient } from "@/components/admin/AdminTransactionsClient";
import { getWalletTransactionsForAdmin } from "@/lib/queries/admin";

export default async function AdminTransactionsPage() {
  const transactions = await getWalletTransactionsForAdmin({ limit: 100 });

  return <AdminTransactionsClient initialTransactions={transactions} />;
}
