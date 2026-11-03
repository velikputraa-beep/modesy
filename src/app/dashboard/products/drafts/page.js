import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerProducts } from "@/lib/queries/dashboard";
import { ProductsTable } from "@/components/dashboard/ProductsTable";

export const metadata = {
  title: "Drafts - Modesy",
};

export default async function DraftsPage() {
  const user = await getCurrentUser();
  const products = user ? await getSellerProducts(user.id, "draft") : [];
  return <ProductsTable title="Drafts" products={products} />;
}
