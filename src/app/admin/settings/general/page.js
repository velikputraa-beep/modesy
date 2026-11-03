import { AdminGeneralSettingsClient } from "@/components/admin/AdminGeneralSettingsClient";
import { getGeneralSettings } from "@/lib/queries/admin-settings";

export default async function AdminGeneralSettingsPage() {
  const { settings, secretStatus } = await getGeneralSettings();

  return <AdminGeneralSettingsClient initialSettings={settings} secretStatus={secretStatus} />;
}
