import { AdminBlogPostsClient } from "@/components/admin/AdminBlogPostsClient";
import { getBlogPostsAdmin, getBlogCategoriesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminBlogPostsPage() {
  const [posts, categories] = await Promise.all([getBlogPostsAdmin(), getBlogCategoriesAdmin()]);

  return <AdminBlogPostsClient initialPosts={posts} initialCategories={categories} />;
}
