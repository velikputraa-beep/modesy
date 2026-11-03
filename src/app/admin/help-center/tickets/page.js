import { AdminSupportTicketsClient } from "@/components/admin/AdminSupportTicketsClient";
import { getSupportTicketsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminSupportTicketsPage() {
  const tickets = await getSupportTicketsAdmin();

  return <AdminSupportTicketsClient initialTickets={tickets} />;
}
