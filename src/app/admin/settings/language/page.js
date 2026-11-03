import { AdminLanguageSettingsClient } from "@/components/admin/AdminLanguageSettingsClient";
import { getLanguagesAdmin } from "@/lib/queries/admin-settings";

export default async function AdminLanguageSettingsPage() {
  const languages = await getLanguagesAdmin();

  return <AdminLanguageSettingsClient initialLanguages={languages} />;
}
