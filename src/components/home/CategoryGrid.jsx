import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/queries/categories";

export async function CategoryGrid() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section: Judul kiri + View All kanan */}
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Category
          </h2>
          <Link
            href="/products"
            className="group flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition-all duration-200 hover:text-teal-600 sm:text-sm cursor-pointer hover:translate-x-1"
          >
            <span>View All</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid 8 Kategori Berbentuk Bulat */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group flex flex-col items-center text-center cursor-pointer"
            >
              {/* Gambar Bulat dengan Hover Effect */}
              <div className="relative size-24 sm:size-28 lg:size-28 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-50 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:-translate-y-0.5 group-hover:border-[#14B8A6]">
                {category.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <span className="h-full w-full flex items-center justify-center text-lg font-bold text-gray-400">
                    {category.name.slice(0, 1)}
                  </span>
                )}
                {/* Overlay saat hover */}
                <div className="absolute inset-0 bg-[#14B8A6]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              {/* Nama Kategori */}
              <h3 className="mt-3 text-xs font-semibold text-gray-800 transition-colors duration-200 group-hover:text-[#14B8A6] sm:text-sm line-clamp-1">
                {category.name}
              </h3>

              {/* Jumlah item */}
              <span className="mt-0.5 text-[11px] text-gray-400">
                {category.itemCount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
