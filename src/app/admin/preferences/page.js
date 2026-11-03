import { AdminPreferencesClient } from "@/components/admin/AdminPreferencesClient";
import { getKvSettings } from "@/lib/queries/admin-settings";

export default async function PreferencesPage() {
  const preferences = await getKvSettings("preferences");

  return <AdminPreferencesClient initialPreferences={preferences} />;
}
