import { AdminDraftProductsClient } from "@/components/admin/AdminDraftProductsClient";
import { getDraftProductsAdmin } from "@/lib/queries/admin-products";

export default async function AdminDraftProductsPage() {
  const products = await getDraftProductsAdmin();

  return <AdminDraftProductsClient initialProducts={products} />;
}
