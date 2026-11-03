import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { getSpecialOffers } from "@/lib/queries/products";
import { ProductCard } from "@/components/home/ProductCard";

export async function SpecialOffersSection({ config = {}, title }) {
  const limit = Number(config.limit) > 0 ? Number(config.limit) : 8;
  const products = await getSpecialOffers({ limit });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <Flame className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {title || "Special Offers"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Produk dengan harga coret yang sedang diskon
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition-all duration-200 hover:text-teal-600 sm:text-sm cursor-pointer hover:translate-x-1"
          >
            <span>View All</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
