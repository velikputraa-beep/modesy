import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getCurrentUser } from "@/lib/mock-auth";
import { getAddresses } from "@/lib/queries/content";
import { getProductById } from "@/lib/queries/products";
import { getStorefrontPaymentOptions } from "@/lib/queries/payment";
import { PageEntrance } from "@/components/common/PageEntrance";

export const metadata = {
  title: "Checkout - Modesy",
  description: "Secure checkout process for your order at Modesy Marketplace.",
};

function toBuyNowItem(product, rawQty) {
  const requested = Number.parseInt(String(rawQty ?? "1"), 10);
  const quantity = Number.isFinite(requested) && requested > 0 ? requested : 1;
  return {
    id: product.id,
    productId: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    originalPrice: product.originalPrice,
    seller: product.seller?.name || "Penjual",
    sellerId: product.sellerId,
    image: product.image || "https://picsum.photos/seed/product/200/200",
    quantity: Math.min(quantity, product.stock || 1),
    stock: product.stock,
  };
}

export default async function CheckoutPage({ searchParams }) {
  const { buyNow, qty } = await searchParams;
  const user = await getCurrentUser();

  const [addresses, paymentSettings, buyNowProduct] = await Promise.all([
    user ? getAddresses(user.id) : Promise.resolve([]),
    getStorefrontPaymentOptions(),
    buyNow ? getProductById(buyNow) : Promise.resolve(null),
  ]);

  let buyNowItem = null;
  let buyNowError = "";
  if (buyNow) {
    if (!buyNowProduct) {
      buyNowError = "Produk untuk Beli Sekarang tidak ditemukan.";
    } else if (buyNowProduct.status !== "published") {
      buyNowError = `"${buyNowProduct.title}" sedang tidak tersedia (status: ${buyNowProduct.status}).`;
    } else if (!buyNowProduct.stock) {
      buyNowError = `"${buyNowProduct.title}" sedang habis.`;
    } else {
      buyNowItem = toBuyNowItem(buyNowProduct, qty);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* Layout Publik (TopBar + Navbar) */}
      <TopBar />
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 py-8">
        <PageEntrance>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <CheckoutClient
              user={user}
              initialAddresses={addresses}
              paymentSettings={paymentSettings}
              buyNowItem={buyNowItem}
              buyNowError={buyNowError}
            />
          </div>
        </PageEntrance>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
