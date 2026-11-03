import { AdminSellerBalancesClient } from "@/components/admin/AdminSellerBalancesClient";
import { getWalletBalances } from "@/lib/queries/admin";

export default async function AdminSellerBalancesPage() {
  const balances = await getWalletBalances({ limit: 200 });

  return <AdminSellerBalancesClient initialBalances={balances} />;
}
