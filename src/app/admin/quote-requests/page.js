import { AdminQuoteRequestsClient } from "@/components/admin/AdminQuoteRequestsClient";
import { getQuoteRequestsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminQuoteRequestsPage() {
  const quotes = await getQuoteRequestsAdmin();

  return <AdminQuoteRequestsClient initialQuotes={quotes} />;
}
