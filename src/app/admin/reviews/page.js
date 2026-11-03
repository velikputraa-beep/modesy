import { AdminReviewsClient } from "@/components/admin/AdminReviewsClient";
import { getAdminReviews } from "@/lib/queries/admin";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews({ limit: 100 });

  return <AdminReviewsClient initialReviews={reviews} />;
}
