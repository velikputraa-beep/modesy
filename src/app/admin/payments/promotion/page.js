import { AdminPromotionPaymentsClient } from "@/components/admin/AdminPromotionPaymentsClient";
import { getPromotionPaymentsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminPromotionPaymentsPage() {
  const payments = await getPromotionPaymentsAdmin();

  return <AdminPromotionPaymentsClient initialPayments={payments} />;
}
