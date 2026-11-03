import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerSales } from "@/lib/queries/dashboard";
import { SalesTable } from "@/components/dashboard/SalesTable";

export const metadata = {
  title: "Cancelled Sales - Modesy",
};

export default async function CancelledSalesPage() {
  const user = await getCurrentUser();
  const sales = user ? await getSellerSales(user.id) : [];
  return <SalesTable title="Cancelled Sales" statusFilter="cancelled" sales={sales} />;
}
