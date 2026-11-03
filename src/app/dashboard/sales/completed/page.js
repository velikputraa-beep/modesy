import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerSales } from "@/lib/queries/dashboard";
import { SalesTable } from "@/components/dashboard/SalesTable";

export const metadata = {
  title: "Completed Sales - Modesy",
};

export default async function CompletedSalesPage() {
  const user = await getCurrentUser();
  const sales = user ? await getSellerSales(user.id) : [];
  return <SalesTable title="Completed Sales" statusFilter="completed" sales={sales} />;
}
