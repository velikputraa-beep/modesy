import { AdminSocialSettingsClient } from "@/components/admin/AdminSocialSettingsClient";
import { getSocialSettings } from "@/lib/queries/admin-settings";

export default async function AdminSocialSettingsPage() {
  const { settings, secretStatus } = await getSocialSettings();

  return <AdminSocialSettingsClient initialSettings={settings} secretStatus={secretStatus} />;
}
