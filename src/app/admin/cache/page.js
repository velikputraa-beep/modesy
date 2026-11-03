import { AdminCacheClient } from "@/components/admin/AdminCacheClient";
import { getCacheLastCleared } from "@/lib/queries/admin-settings";

export default async function AdminCacheSystemPage() {
  const lastCleared = await getCacheLastCleared();

  return <AdminCacheClient lastCleared={lastCleared} />;
}
