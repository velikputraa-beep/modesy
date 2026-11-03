import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/mock-auth";
import { getMyCoupons } from "@/lib/queries/coupons";

import { MyCouponsClient } from "@/components/coupons/MyCouponsClient";

export const metadata = {
  title: "My Coupons - Modesy",
  description: "Daftar kupon belanja dan voucher diskon aktif di Modesy Marketplace.",
};

export default async function MyCouponsPage() {
  const user = await getCurrentUser();
  const coupons = user ? await getMyCoupons(user.id) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb: "Home / My Coupons" (text-sm text-gray-500 mb-4) */}
          <nav className="text-sm text-gray-500 mb-4">
            <Link
              href="/"
              className="hover:text-gray-900 transition-colors"
            >
              Home
            </Link>{" "}
            / <span className="text-gray-600 font-medium">My Coupons</span>
          </nav>

          {/* Judul "My Coupons" (text-2xl font-bold mb-6) */}
          <h1 className="text-2xl font-bold mb-6 text-gray-900">
            My Coupons
          </h1>

          {/* Grid Coupons */}
          <MyCouponsClient initialCoupons={coupons} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
