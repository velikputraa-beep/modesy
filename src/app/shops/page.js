import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getShops } from "@/lib/queries/users";

import { Star, ShieldCheck, MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageEntrance } from "@/components/common/PageEntrance";

export const metadata = {
  title: "Shops Directory - Modesy",
  description: "Browse verified vendor stores and independent sellers on Modesy Marketplace.",
};

export default async function ShopsPage() {
  const vendors = await getShops();

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-10">
        <PageEntrance>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Home
              </Link>{" "}
              / <span className="text-gray-800 font-medium">Shops</span>
            </nav>

            {/* Header */}
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Verified Sellers
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
                Explore Independent Shops
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Connect directly with verified creators, manufacturers, and boutiques across the world.
              </p>
            </div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {vendors.map((vendor) => {
                const shopName = vendor.shop_name || vendor.full_name || "Modesy Store";
                const username = vendor.username || "daniel-jones";

                return (
                  <div
                    key={vendor.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-teal-300 transition-all duration-200 flex flex-col items-center text-center p-6 group"
                  >
                  <div className="relative mb-4">
                    <img
                      src={vendor.avatar_url || `https://i.pravatar.cc/150?u=${username}`}
                      alt={shopName}
                      className="size-20 rounded-full object-cover border-2 border-teal-500/20 group-hover:scale-105 transition-transform"
                    />
                    {vendor.verified && (
                      <span className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-xs">
                        <ShieldCheck className="size-5 text-teal-600 fill-teal-50" />
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {shopName}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">@{username}</p>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                    <div className="flex items-center text-amber-400">
                      <Star className="size-3.5 fill-amber-400" />
                    </div>
                    <span className="font-semibold text-gray-700">
                      {vendor.rating ? vendor.rating.toFixed(1) : "5.0"}
                    </span>
                    <span className="text-gray-400">
                      ({vendor.salesCount} sales)
                    </span>
                  </div>

                  {vendor.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                      <MapPin className="size-3" />
                      <span>{vendor.location}</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                    {vendor.bio || "Handcrafted products and curated goods with fast shipping."}
                  </p>

                  <div className="w-full mt-auto pt-5">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-teal-600/30 text-teal-700 hover:bg-teal-50 hover:border-teal-600 text-xs font-semibold cursor-pointer"
                    >
                      <Link href={`/profile/${username}`}>
                        <Store className="size-3.5 mr-1.5" />
                        <span>Visit Shop</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </PageEntrance>
      </main>

      <Footer />
    </div>
  );
}
