import { AdminSoldProductsClient } from "@/components/admin/AdminSoldProductsClient";
import { getSoldProductsAdmin } from "@/lib/queries/admin-products";

export default async function AdminSoldProductsPage() {
  const products = await getSoldProductsAdmin();

  return <AdminSoldProductsClient initialProducts={products} />;
}
