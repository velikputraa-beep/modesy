import { AdminEarningsClient } from "@/components/admin/AdminEarningsClient";
import { getWalletTransactionsForAdmin } from "@/lib/queries/admin";

export default async function AdminEarningsPage() {
  const earnings = await getWalletTransactionsForAdmin({ type: "earning", limit: 200 });

  return <AdminEarningsClient initialEarnings={earnings} />;
}
