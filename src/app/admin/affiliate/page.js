import { AdminAffiliateClient } from "@/components/admin/AdminAffiliateClient";
import { getAffiliatesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminAffiliatePage() {
  const affiliates = await getAffiliatesAdmin();

  return <AdminAffiliateClient initialAffiliates={affiliates} />;
}
