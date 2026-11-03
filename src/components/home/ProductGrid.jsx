import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/queries/products";
import { ProductCard } from "@/components/home/ProductCard";

export async function ProductGrid({
  title = "Latest Products",
  subtitle = "Explore freshly added unique items from trusted sellers",
  featured = false,
  limit = 8,
}) {
  const products = await getProducts({ limit, featured });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 bg-gray-50/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section: Judul + View All */}
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              {title}
            </h2>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">{subtitle}</p>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition-all duration-200 hover:text-teal-600 sm:text-sm cursor-pointer hover:translate-x-1"
          >
            <span>View All</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid 4 Kolom Produk */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
