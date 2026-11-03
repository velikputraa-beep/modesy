import { AdminPayoutAddClient } from "@/components/admin/AdminPayoutAddClient";
import { getPayoutSettings, getPayoutTargets } from "@/lib/queries/admin-cms";

export default async function AdminAddPayoutPage() {
  const [targets, settings] = await Promise.all([getPayoutTargets(), getPayoutSettings()]);

  return <AdminPayoutAddClient initialTargets={targets} initialSettings={settings} />;
}
