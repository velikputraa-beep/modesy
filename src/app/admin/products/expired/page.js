import { AdminExpiredProductsClient } from "@/components/admin/AdminExpiredProductsClient";
import { getExpiredProductsAdmin } from "@/lib/queries/admin-products";

export default async function AdminExpiredProductsPage() {
  const products = await getExpiredProductsAdmin();

  return <AdminExpiredProductsClient initialProducts={products} />;
}
