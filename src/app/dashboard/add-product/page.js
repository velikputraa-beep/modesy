import { getCurrentUser } from "@/lib/mock-auth";
import { getCategories } from "@/lib/queries/categories";
import { getSellerProductById } from "@/lib/queries/dashboard";
import { AddProductClient } from "@/components/dashboard/AddProductClient";

export const metadata = {
  title: "Add Product - Modesy",
};

export default async function AddProductPage({ searchParams }) {
  const { edit } = await searchParams;
  const user = await getCurrentUser();
  const categories = await getCategories();
  const product = edit && user ? await getSellerProductById(edit, user.id) : null;

  return <AddProductClient categories={categories} product={product} />;
}
