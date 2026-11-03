import { AdminLoginActivitiesClient } from "@/components/admin/AdminLoginActivitiesClient";
import { getLoginActivitiesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminLoginActivitiesPage() {
  const activities = await getLoginActivitiesAdmin();

  return <AdminLoginActivitiesClient initialActivities={activities} />;
}
