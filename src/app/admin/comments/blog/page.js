import { AdminBlogCommentsClient } from "@/components/admin/AdminBlogCommentsClient";
import { getBlogCommentsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminBlogCommentsPage() {
  const comments = await getBlogCommentsAdmin();

  return <AdminBlogCommentsClient initialComments={comments} />;
}
