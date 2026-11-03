import Link from "next/link";
import { getCurrentUser } from "@/lib/mock-auth";
import { getUserMembershipPayments } from "@/lib/queries/dashboard";
import { getBalance } from "@/lib/queries/wallet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentHistoryClient } from "@/components/dashboard/PaymentHistoryClient";

export default async function MembershipPaymentsPage() {
  const user = await getCurrentUser();
  const [{ rows, scopedToUser }, balance] = await Promise.all([
    getUserMembershipPayments(user),
    getBalance(user?.id),
  ]);

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 bg-white rounded-lg p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Saldo Wallet untuk langganan
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(balance)}
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="text-xs h-9 cursor-pointer">
          <Link href="/wallet">Kelola Wallet &amp; Deposit</Link>
        </Button>
      </Card>

      <PaymentHistoryClient
        title="Membership Payments"
        sourceTable="membership_payments"
        invoiceKind="Pembayaran Membership"
        detailHeader="Membership Plan"
        showBuyer={!scopedToUser}
        initialPayments={rows}
        emptyTitle="Belum ada pembayaran membership"
        emptyNote={
          scopedToUser
            ? "Tabel membership_payments hanya terbaca oleh admin (RLS) dan tidak punya kolom user_id, jadi akun vendor tidak melihat baris miliknya. Buku besar lengkap ada di Admin → Payments → Membership Payments."
            : "Belum ada satu pun pembayaran membership tercatat."
        }
      />
    </div>
  );
}
