import { getCurrentUser } from "@/lib/mock-auth";
import { getDashboardReviews } from "@/lib/queries/dashboard";
import { DashboardReviewsClient } from "@/components/dashboard/DashboardReviewsClient";

export const metadata = {
  title: "Reviews - Modesy",
};

export default async function ReviewsPage() {
  const user = await getCurrentUser();
  const reviews = user ? await getDashboardReviews(user.id, { asSeller: true }) : [];
  return <DashboardReviewsClient reviews={reviews} />;
}
