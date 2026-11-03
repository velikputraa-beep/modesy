import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/mock-auth";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export const metadata = {
  title: "Dashboard - Modesy",
  description: "Modesy Marketplace & Classified Ads Script Dashboard",
};

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();

  // Guest → redirect /login
  if (!user) {
    redirect("/login");
  }

  // Moderator → redirect /admin
  if (user.role === "moderator") {
    redirect("/admin");
  }

  // Member/Vendor/Admin → boleh masuk
  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
