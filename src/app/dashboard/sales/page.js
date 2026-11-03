import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerSales } from "@/lib/queries/dashboard";
import { SalesTable } from "@/components/dashboard/SalesTable";

export const metadata = {
  title: "Sales - Modesy",
};

export default async function SalesPage() {
  const user = await getCurrentUser();
  const sales = user ? await getSellerSales(user.id) : [];
  return <SalesTable title="Sales" statusFilter="all" showStats={true} sales={sales} />;
}
