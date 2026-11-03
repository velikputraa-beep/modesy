import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerProducts } from "@/lib/queries/dashboard";
import { ProductsTable } from "@/components/dashboard/ProductsTable";

export const metadata = {
  title: "Products - Modesy",
};

export default async function ProductsPage() {
  const user = await getCurrentUser();
  const products = user ? await getSellerProducts(user.id, "all") : [];
  return <ProductsTable title="Products" products={products} />;
}
