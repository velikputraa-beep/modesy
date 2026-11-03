import Link from "next/link";
import { ArrowRight, BadgeCheck, Store } from "lucide-react";
import { getTopSellers } from "@/lib/queries/vendors";

export async function TopSellersSection({ config = {}, title }) {
  const limit = Number(config.limit) > 0 ? Number(config.limit) : 6;
  const sellers = await getTopSellers({ limit });

  if (sellers.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 bg-gray-50/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-[#14B8A6]">
              <Store className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {title || "Top Sellers"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Penjual dengan transaksi terselesai terbanyak
              </p>
            </div>
          </div>
          <Link
            href="/shops"
            className="group flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition-all duration-200 hover:text-teal-600 sm:text-sm cursor-pointer hover:translate-x-1"
          >
            <span>View All</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {sellers.map((seller) => (
            <Link
              key={seller.userId}
              href={`/profile/${seller.username}`}
              className="group flex flex-col items-center rounded-xl border border-gray-100 bg-white p-4 text-center shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6] hover:shadow-lg"
            >
              <div className="relative size-16 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-50 sm:size-20">
                {seller.avatar ? (
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-300">
                    {seller.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>

              <h3 className="mt-3 flex items-center gap-1 text-xs font-semibold text-gray-800 transition-colors group-hover:text-[#14B8A6] sm:text-sm">
                <span className="line-clamp-1">{seller.name}</span>
                {seller.verified && <BadgeCheck className="size-3.5 shrink-0 text-[#14B8A6]" />}
              </h3>

              <span className="mt-1 text-[11px] text-gray-400">
                {seller.itemsSold} penjualan &middot; {seller.totalOrders} order
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
