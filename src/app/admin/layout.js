import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/mock-auth";
import { canAccessAdminPanel } from "@/lib/auth-utils";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "Admin Panel - Modesy",
  description: "Modesy Marketplace & Classified Ads Script Admin Panel",
};

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  // Jika belum login, redirect ke login
  if (!user) {
    redirect("/login");
  }

  // Jika bukan Moderator atau Admin, redirect ke home
  if (!canAccessAdminPanel(user)) {
    redirect("/");
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
