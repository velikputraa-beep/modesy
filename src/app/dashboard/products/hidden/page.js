import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerProducts } from "@/lib/queries/dashboard";
import { ProductsTable } from "@/components/dashboard/ProductsTable";

export const metadata = {
  title: "Hidden Products - Modesy",
};

export default async function HiddenProductsPage() {
  const user = await getCurrentUser();
  const products = user ? await getSellerProducts(user.id, "hidden") : [];
  return <ProductsTable title="Hidden Products" products={products} />;
}
