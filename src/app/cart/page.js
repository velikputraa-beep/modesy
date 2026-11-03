import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartView } from "@/components/cart/CartView";
import { getCurrentUser } from "@/lib/mock-auth";
import { PageEntrance } from "@/components/common/PageEntrance";

export const metadata = {
  title: "Shopping Cart - Modesy",
  description: "Lihat dan kelola barang belanjaan kamu di Modesy Marketplace.",
};

export default async function CartPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <PageEntrance>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Shopping Cart
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Periksa item yang akan kamu beli sebelum melakukan checkout
              </p>
            </div>

            <CartView user={user} />
          </div>
        </PageEntrance>
      </main>

      <Footer />
    </div>
  );
}
