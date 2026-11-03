import { OrdersListClient } from "@/components/orders/OrdersListClient";
import { getCurrentUser } from "@/lib/mock-auth";
import { getOrdersForUser } from "@/lib/queries/orders";

export const metadata = {
  title: "Orders - Modesy",
  description: "View and track your Modesy orders",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const all = user ? await getOrdersForUser(user.id) : [];
  const orders = all.filter((o) => o.buyerId === user?.id);

  return <OrdersListClient initialOrders={orders} />;
}
