import { AdminPayoutSettingsClient } from "@/components/admin/AdminPayoutSettingsClient";
import { getPayoutSettings } from "@/lib/queries/admin-cms";

export default async function AdminPayoutSettingsPage() {
  const settings = await getPayoutSettings();

  return <AdminPayoutSettingsClient initialSettings={settings} />;
}
