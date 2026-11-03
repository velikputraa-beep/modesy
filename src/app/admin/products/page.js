import { AdminProductsClient } from "@/components/admin/AdminProductsClient";
import { getProducts } from "@/lib/queries/products";

export default async function AdminProductsPage() {
  const products = await getProducts({ status: null, limit: 100 });

  return <AdminProductsClient initialProducts={products} />;
}
