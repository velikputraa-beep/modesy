import { RefundRequestsClient } from "@/components/orders/RefundRequestsClient";
import { getCurrentUser } from "@/lib/mock-auth";
import { getRefundRequests } from "@/lib/queries/requests";

export const metadata = {
  title: "Refund Requests - Modesy",
  description: "View and submit your order refund requests",
};

export default async function RefundRequestsPage() {
  const user = await getCurrentUser();
  const refunds = user ? await getRefundRequests(user.id) : [];

  return <RefundRequestsClient initialRefunds={refunds} />;
}
