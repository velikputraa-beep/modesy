import { AdminSeoClient } from "@/components/admin/AdminSeoClient";
import { getKvSettings } from "@/lib/queries/admin-settings";

export default async function AdminSeoToolsPage() {
  const seo = await getKvSettings("seo");

  return <AdminSeoClient initialSeo={seo} />;
}
