import { AdminFeaturedProductsClient } from "@/components/admin/AdminFeaturedProductsClient";
import { getProducts } from "@/lib/queries/products";

export default async function AdminFeaturedProductsPage() {
  const products = await getProducts({ featured: true, status: null, limit: 100 });

  return <AdminFeaturedProductsClient initialProducts={products} />;
}
