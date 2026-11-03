import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerProducts } from "@/lib/queries/dashboard";
import { ProductsTable } from "@/components/dashboard/ProductsTable";

export const metadata = {
  title: "Pending Products - Modesy",
};

export default async function PendingProductsPage() {
  const user = await getCurrentUser();
  const products = user ? await getSellerProducts(user.id, "pending") : [];
  return <ProductsTable title="Pending Products" products={products} />;
}
