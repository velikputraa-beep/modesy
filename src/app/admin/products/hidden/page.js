import { AdminHiddenProductsClient } from "@/components/admin/AdminHiddenProductsClient";
import { getHiddenProductsAdmin } from "@/lib/queries/admin-products";

export default async function AdminHiddenProductsPage() {
  const products = await getHiddenProductsAdmin();

  return <AdminHiddenProductsClient initialProducts={products} />;
}
