import { AdminPagesClient } from "@/components/admin/AdminPagesClient";
import { getPagesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminPagesPage() {
  const pages = await getPagesAdmin();

  return <AdminPagesClient initialPages={pages} />;
}
