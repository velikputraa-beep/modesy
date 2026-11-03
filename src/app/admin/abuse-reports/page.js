import { AdminAbuseReportsClient } from "@/components/admin/AdminAbuseReportsClient";
import { getAbuseReportsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminAbuseReportsPage() {
  const reports = await getAbuseReportsAdmin();

  return <AdminAbuseReportsClient initialReports={reports} />;
}
