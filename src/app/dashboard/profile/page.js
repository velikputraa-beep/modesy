import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/mock-auth";

export default async function DashboardProfileRedirect() {
  const user = await getCurrentUser();
  const username = user?.username || "admin";
  redirect(`/profile/${username}`);
}
