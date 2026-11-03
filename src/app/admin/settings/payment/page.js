import { AdminPaymentSettingsClient } from "@/components/admin/AdminPaymentSettingsClient";
import { getPaymentSettings } from "@/lib/queries/admin-settings";

export default async function AdminPaymentSettingsPage() {
  const { settings, secretStatus } = await getPaymentSettings();

  return <AdminPaymentSettingsClient initialSettings={settings} secretStatus={secretStatus} />;
}
