import { AdminThemeClient } from "@/components/admin/AdminThemeClient";
import { getThemesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminThemePage() {
  const themes = await getThemesAdmin();

  return <AdminThemeClient initialThemes={themes} />;
}
