import { AdminBlogOverviewClient } from "@/components/admin/AdminBlogOverviewClient";
import { getBlogPostsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminBlogOverviewPage() {
  const posts = await getBlogPostsAdmin();

  return <AdminBlogOverviewClient initialPosts={posts} />;
}
