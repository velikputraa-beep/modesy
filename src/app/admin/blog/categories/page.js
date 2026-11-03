import { AdminBlogCategoriesClient } from "@/components/admin/AdminBlogCategoriesClient";
import { getBlogCategoriesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminBlogCategoriesPage() {
  const categories = await getBlogCategoriesAdmin();

  return <AdminBlogCategoriesClient initialCategories={categories} />;
}
