import { AdminDigitalSalesClient } from "@/components/admin/AdminDigitalSalesClient";
import { getOrdersForAdmin } from "@/lib/queries/admin";

export default async function AdminDigitalSalesPage() {
  const orders = await getOrdersForAdmin({ limit: 200 });

  const sales = orders.flatMap((o) =>
    (o.items || []).map((it) => ({
      key: `${o.id}:${it.id}`,
      orderId: o.id,
      orderNumber: o.orderNumber,
      product: it.title,
      buyer: o.buyer,
      buyerUsername: o.buyerUsername,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      lineTotal: it.unitPrice * it.quantity,
      date: o.date,
    }))
  );

  return <AdminDigitalSalesClient initialSales={sales} />;
}
