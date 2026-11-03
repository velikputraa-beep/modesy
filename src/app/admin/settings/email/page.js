import { AdminEmailSettingsClient } from "@/components/admin/AdminEmailSettingsClient";
import { getEmailSettings } from "@/lib/queries/admin-settings";

export default async function AdminEmailSettingsPage() {
  const { settings, secretStatus } = await getEmailSettings();

  return <AdminEmailSettingsClient initialSettings={settings} secretStatus={secretStatus} />;
}
