import { AdminAdSpacesClient } from "@/components/admin/AdminAdSpacesClient";
import { getAdSpacesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminAdSpacesPage() {
  const adSpaces = await getAdSpacesAdmin();

  return <AdminAdSpacesClient initialAdSpaces={adSpaces} />;
}
