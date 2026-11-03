import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getProducts } from "@/lib/queries/products";
import { getBrands } from "@/lib/queries/content";
import { getNavCategories } from "@/lib/queries/categories";
import { ProductsClient } from "@/components/products/ProductsClient";

export const metadata = {
  title: "Products - Modesy",
  description:
    "Explore wide range of unique items, clothing, electronics and more on Modesy Marketplace.",
};

export default async function ProductsPage() {
  const [products, brands, navCategories] = await Promise.all([
    getProducts({ limit: 36 }),
    getBrands(),
    getNavCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb: "Home / Products" (text-sm text-gray-500 mb-4) */}
          <nav className="text-sm text-gray-500 mb-4">
            <Link
              href="/"
              className="hover:text-gray-900 transition-colors"
            >
              Home
            </Link>{" "}
            / <span className="text-gray-600 font-medium">Products</span>
          </nav>

          {/* Accessible title for SEO */}
          <h1 className="sr-only">Products</h1>

          {/* Products Listing with Sidebar Filters & Product Grid */}
          <ProductsClient
            initialProducts={products}
            initialBrands={brands}
            initialCategories={navCategories.map((c) => c.name)}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
