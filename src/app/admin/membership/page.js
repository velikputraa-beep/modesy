import { AdminMembershipOverviewClient } from "@/components/admin/AdminMembershipOverviewClient";
import { getUsersForAdmin } from "@/lib/queries/admin";

export default async function AdminMembershipOverviewPage() {
  const users = await getUsersForAdmin({ limit: 1000 });

  return <AdminMembershipOverviewClient initialUsers={users} />;
}
