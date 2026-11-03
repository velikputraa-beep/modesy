import { getCurrentUser } from "@/lib/mock-auth";
import { getUserPromotionPayments } from "@/lib/queries/dashboard";
import { PaymentHistoryClient } from "@/components/dashboard/PaymentHistoryClient";

export default async function PromotionPaymentsPage() {
  const user = await getCurrentUser();
  const { rows, scopedToUser } = await getUserPromotionPayments(user);

  return (
    <PaymentHistoryClient
      title="Promotion Payments"
      sourceTable="promotion_payments"
      invoiceKind="Pembayaran Promosi"
      detailHeader="Purchased Plan"
      showBuyer={!scopedToUser}
      initialPayments={rows}
      emptyTitle="Belum ada pembayaran promosi"
      emptyNote={
        scopedToUser
          ? "Tabel promotion_payments hanya terbaca oleh admin (RLS) dan tidak punya kolom user_id, jadi akun vendor tidak melihat baris miliknya. Buku besar lengkap ada di Admin → Payments → Promotion Payments."
          : "Belum ada satu pun pembayaran promosi tercatat."
      }
    />
  );
}
