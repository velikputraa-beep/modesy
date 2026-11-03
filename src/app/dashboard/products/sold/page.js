import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerProducts } from "@/lib/queries/dashboard";
import { ProductsTable } from "@/components/dashboard/ProductsTable";

export const metadata = {
  title: "Sold Products - Modesy",
};

export default async function SoldProductsPage() {
  const user = await getCurrentUser();
  const products = user ? await getSellerProducts(user.id, "sold") : [];
  return <ProductsTable title="Sold Products" products={products} />;
}
