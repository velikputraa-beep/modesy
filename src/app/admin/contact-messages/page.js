import { AdminContactMessagesClient } from "@/components/admin/AdminContactMessagesClient";
import { getContactMessagesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminContactMessagesPage() {
  const messages = await getContactMessagesAdmin();

  return <AdminContactMessagesClient initialMessages={messages} />;
}
