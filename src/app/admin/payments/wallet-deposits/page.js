import { AdminWalletDepositsClient } from "@/components/admin/AdminWalletDepositsClient";
import { getWalletTransactionsForAdmin } from "@/lib/queries/admin";

export default async function AdminWalletDepositsPage() {
  const deposits = await getWalletTransactionsForAdmin({ type: "deposit", limit: 200 });

  return <AdminWalletDepositsClient initialDeposits={deposits} />;
}
