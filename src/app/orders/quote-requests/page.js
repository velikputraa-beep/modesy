import { QuoteRequestsClient } from "@/components/orders/QuoteRequestsClient";
import { getCurrentUser } from "@/lib/mock-auth";
import { getQuoteRequests } from "@/lib/queries/requests";

export const metadata = {
  title: "Quote Requests - Modesy",
  description: "View and manage your product quote requests",
};

export default async function QuoteRequestsPage() {
  const user = await getCurrentUser();
  const quotes = user ? await getQuoteRequests(user.id) : [];

  return <QuoteRequestsClient initialQuotes={quotes} />;
}
