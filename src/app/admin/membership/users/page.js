import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
import { getUsersForAdmin } from "@/lib/queries/admin";

export default async function AdminUsersPage() {
  const users = await getUsersForAdmin({ limit: 200 });

  return <AdminUsersClient initialUsers={users} />;
}
