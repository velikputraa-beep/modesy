import { AdminChatMessagesClient } from "@/components/admin/AdminChatMessagesClient";
import {
  getAdminConversations,
  getMessagesForAdmin,
} from "@/lib/queries/admin";

export default async function AdminChatMessagesPage() {
  const [conversations, messages] = await Promise.all([
    getAdminConversations({ limit: 50 }),
    getMessagesForAdmin({ limit: 200 }),
  ]);

  return (
    <AdminChatMessagesClient
      initialConversations={conversations}
      initialMessages={messages}
    />
  );
}
