import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { PageEntrance } from "@/components/common/PageEntrance";
import { getCurrentUser } from "@/lib/mock-auth";
import { getFavoriteProducts } from "@/lib/queries/favorites";

export const metadata = {
  title: "Wishlist Saya - Modesy",
  description: "Daftar produk favorit yang kamu simpan di Modesy Marketplace.",
};

export default async function WishlistPage() {
  const user = await getCurrentUser();
  const favoriteProducts = user ? await getFavoriteProducts(user.id) : [];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <PageEntrance>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Wishlist Saya
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Koleksi produk yang kamu sukai dan pantau untuk dibeli nanti
              </p>
            </div>

            <WishlistView initialItems={favoriteProducts} />
          </div>
        </PageEntrance>
      </main>

      <Footer />
    </div>
  );
}
