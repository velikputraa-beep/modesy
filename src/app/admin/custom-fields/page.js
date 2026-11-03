import { AdminCustomFieldsClient } from "@/components/admin/AdminCustomFieldsClient";
import { getCustomFieldsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminCustomFieldsPage() {
  const fields = await getCustomFieldsAdmin();

  return <AdminCustomFieldsClient initialFields={fields} />;
}
