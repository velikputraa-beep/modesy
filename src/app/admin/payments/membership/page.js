import { AdminMembershipPaymentsClient } from "@/components/admin/AdminMembershipPaymentsClient";
import { getMembershipPaymentsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminMembershipPaymentsPage() {
  const payments = await getMembershipPaymentsAdmin();

  return <AdminMembershipPaymentsClient initialPayments={payments} />;
}
