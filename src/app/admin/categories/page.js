import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";
import { getCategoriesWithCounts } from "@/lib/queries/admin";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return <AdminCategoriesClient initialCategories={categories} />;
}
