import { AdminNewsletterClient } from "@/components/admin/AdminNewsletterClient";
import { getNewsletterAdmin } from "@/lib/queries/admin-cms";

export default async function AdminNewsletterPage() {
  const subscribers = await getNewsletterAdmin();

  return <AdminNewsletterClient initialSubscribers={subscribers} />;
}
