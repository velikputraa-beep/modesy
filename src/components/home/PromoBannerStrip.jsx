import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/queries/categories";

export async function PromoBannerStrip() {
  const categories = await getCategories();
  const promos = categories
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2);

  if (promos.length === 0) return null;

  return (
    <section className="py-4 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="group relative overflow-hidden rounded-xl bg-gray-900 h-44 sm:h-52"
            >
              {promo.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={promo.image}
                  alt={promo.name}
                  className="h-full w-full object-cover opacity-75 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6]">
                  {promo.count} produk tersedia
                </span>
                <h3 className="mt-1 text-xl sm:text-2xl font-bold text-white">{promo.name}</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-300">
                  Jelajahi produk kategori {promo.name} dari seller Modesy
                </p>
                <Link
                  href={`/products?category=${encodeURIComponent(promo.name)}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#14B8A6] transition-colors cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
