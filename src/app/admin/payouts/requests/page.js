import { AdminPayoutRequestsClient } from "@/components/admin/AdminPayoutRequestsClient";
import { getWalletTransactionsForAdmin } from "@/lib/queries/admin";

export default async function AdminPayoutRequestsPage() {
  const requests = await getWalletTransactionsForAdmin({ type: "withdraw", limit: 200 });

  return <AdminPayoutRequestsClient initialRequests={requests} />;
}
