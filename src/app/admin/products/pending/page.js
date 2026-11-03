import { AdminPendingProductsClient } from "@/components/admin/AdminPendingProductsClient";
import { getPendingProductsAdmin } from "@/lib/queries/admin-products";

export default async function AdminPendingProductsPage() {
  const products = await getPendingProductsAdmin();

  return <AdminPendingProductsClient initialProducts={products} />;
}
