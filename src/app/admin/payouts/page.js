import { AdminPayoutsClient } from "@/components/admin/AdminPayoutsClient";
import { getWalletTransactionsForAdmin } from "@/lib/queries/admin";

export default async function AdminPayoutsOverviewPage() {
  const payouts = await getWalletTransactionsForAdmin({ type: "withdraw", limit: 200 });

  return <AdminPayoutsClient initialPayouts={payouts} />;
}
