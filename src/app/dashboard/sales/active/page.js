import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerSales } from "@/lib/queries/dashboard";
import { SalesTable } from "@/components/dashboard/SalesTable";

export const metadata = {
  title: "Active Sales - Modesy",
};

export default async function ActiveSalesPage() {
  const user = await getCurrentUser();
  const sales = user ? await getSellerSales(user.id) : [];
  return <SalesTable title="Active Sales" statusFilter="active" sales={sales} />;
}
