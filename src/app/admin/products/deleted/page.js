import { AdminDeletedProductsClient } from "@/components/admin/AdminDeletedProductsClient";
import { getDeletedProductsAdmin } from "@/lib/queries/admin-products";

export default async function AdminDeletedProductsPage() {
  const products = await getDeletedProductsAdmin();

  return <AdminDeletedProductsClient initialProducts={products} />;
}
