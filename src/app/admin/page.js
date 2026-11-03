import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { getAdminOverview } from "@/lib/queries/admin";
import { getCurrentUser } from "@/lib/mock-auth";

export default async function AdminHomePage() {
  const [overview, user] = await Promise.all([getAdminOverview(), getCurrentUser()]);

  return <AdminDashboardClient overview={overview} currentUser={user} />;
}
