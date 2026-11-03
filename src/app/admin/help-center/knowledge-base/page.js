import { AdminKnowledgeBaseClient } from "@/components/admin/AdminKnowledgeBaseClient";
import { getKnowledgeBaseAdmin } from "@/lib/queries/admin-cms";

export default async function AdminKnowledgeBasePage() {
  const articles = await getKnowledgeBaseAdmin();

  return <AdminKnowledgeBaseClient initialArticles={articles} />;
}
