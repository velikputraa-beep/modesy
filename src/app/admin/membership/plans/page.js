import { AdminMembershipPlansClient } from "@/components/admin/AdminMembershipPlansClient";
import { getMembershipPlansAdmin } from "@/lib/queries/admin-cms";

export default async function AdminMembershipPlansPage() {
  const plans = await getMembershipPlansAdmin();

  return <AdminMembershipPlansClient initialPlans={plans} />;
}
