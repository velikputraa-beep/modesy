import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerQuoteRequests } from "@/lib/queries/requests";
import { VendorQuoteRequestsClient } from "@/components/dashboard/VendorQuoteRequestsClient";

export default async function QuoteRequestsPage() {
  const user = await getCurrentUser();
  const quotes = user ? await getSellerQuoteRequests(user.id) : [];

  return <VendorQuoteRequestsClient quotes={quotes} />;
}
