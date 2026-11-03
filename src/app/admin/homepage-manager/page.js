import { AdminHomepageManagerClient } from "@/components/admin/AdminHomepageManagerClient";
import { getHomepageSectionsAdmin } from "@/lib/queries/admin-settings";

export default async function AdminHomepageManagerPage() {
  const sections = await getHomepageSectionsAdmin();

  return <AdminHomepageManagerClient initialSections={sections} />;
}
