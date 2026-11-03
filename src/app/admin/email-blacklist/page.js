import { AdminEmailBlacklistClient } from "@/components/admin/AdminEmailBlacklistClient";
import { getEmailBlacklistAdmin } from "@/lib/queries/admin-cms";

export default async function AdminEmailBlacklistPage() {
  const blacklist = await getEmailBlacklistAdmin();

  return <AdminEmailBlacklistClient initialBlacklist={blacklist} />;
}
