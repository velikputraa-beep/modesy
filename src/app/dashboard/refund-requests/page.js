import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerRefundRequests } from "@/lib/queries/requests";
import { VendorRefundRequestsClient } from "@/components/dashboard/VendorRefundRequestsClient";

export default async function RefundRequestsPage() {
  const user = await getCurrentUser();
  const refunds = user ? await getSellerRefundRequests(user.id) : [];

  return <VendorRefundRequestsClient refunds={refunds} />;
}
