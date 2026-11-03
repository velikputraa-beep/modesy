import { AdminSpecialOffersClient } from "@/components/admin/AdminSpecialOffersClient";
import { getProducts } from "@/lib/queries/products";

export default async function AdminSpecialOffersProductsPage() {
  const products = await getProducts({ status: null, limit: 200 });
  const discounted = products.filter((p) => p.originalPrice && p.discountPercentage);

  return <AdminSpecialOffersClient initialProducts={discounted} />;
}
