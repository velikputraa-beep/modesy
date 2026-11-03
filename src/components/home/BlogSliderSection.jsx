import Link from "next/link";
import { ArrowRight, Newspaper, User, Calendar } from "lucide-react";
import { getLatestBlogPosts } from "@/lib/queries/blog";
import { timeAgo } from "@/lib/utils";

export async function BlogSliderSection({ config = {}, title }) {
  const limit = Number(config.limit) > 0 ? Number(config.limit) : 4;
  const posts = await getLatestBlogPosts({ limit });

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Newspaper className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {title || "From the Blog"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Cerita, tips belanja, dan panduan penjual terbaru
              </p>
            </div>
          </div>
          <Link
            href="/blog"
            className="group flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition-all duration-200 hover:text-teal-600 sm:text-sm cursor-pointer hover:translate-x-1"
          >
            <span>View All</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Slider horizontal murni CSS (scroll-snap), tanpa library tambahan.
            Kartu tidak dipautkan ke halaman detail karena /blog/[slug] belum ada. */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="w-[260px] shrink-0 snap-start overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs transition-shadow duration-300 hover:shadow-lg sm:w-[300px]"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-gray-300">
                    <Newspaper className="size-8" />
                  </span>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                  {post.category}
                </span>
              </div>

              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-bold text-gray-900">{post.title}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {timeAgo(post.date)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
