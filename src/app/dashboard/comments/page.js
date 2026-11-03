import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerComments } from "@/lib/queries/dashboard";
import { DashboardCommentsClient } from "@/components/dashboard/DashboardCommentsClient";

export const metadata = {
  title: "Comments - Modesy",
};

export default async function CommentsPage() {
  const user = await getCurrentUser();
  const comments = user ? await getSellerComments(user.id) : [];
  return <DashboardCommentsClient comments={comments} />;
}
