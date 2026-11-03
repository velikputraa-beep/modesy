import { AdminRolesClient } from "@/components/admin/AdminRolesClient";
import { getRolesWithPermissions } from "@/lib/queries/admin-settings";

export default async function AdminRolesPermissionsPage() {
  const roles = await getRolesWithPermissions();

  return <AdminRolesClient roles={roles} />;
}
