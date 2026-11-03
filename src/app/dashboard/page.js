import { getCurrentUser } from "@/lib/mock-auth";
import { getDashboardOverview } from "@/lib/queries/dashboard";
import { DashboardHomeClient } from "@/components/dashboard/DashboardHomeClient";

export const metadata = {
  title: "Dashboard - Modesy",
  description: "Modesy Marketplace & Classified Ads Script Dashboard",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const overview = user ? await getDashboardOverview(user) : null;
  return <DashboardHomeClient user={user} overview={overview} />;
}
