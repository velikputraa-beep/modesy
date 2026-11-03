import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";
import { getBlogPosts } from "@/lib/queries/blog";

export const metadata = {
  title: "Blog - Modesy",
  description: "Read latest stories, shopping tips, and seller guides on Modesy Marketplace.",
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts({ limit: 12 });
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>{" "}
            / <span className="text-gray-800 font-medium">Blog</span>
          </nav>

          {/* Header */}
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Modesy Stories
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Latest Articles &amp; News
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              Explore insightful guides, vendor stories, and shopping inspirations from our community.
            </p>
          </div>

          {/* Blog Grid */}
          {blogPosts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-16">
              Belum ada artikel published. Tambahkan lewat menu Admin &rarr; Blog &rarr; Posts.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  <Link href={`/blog/${post.slug}`} className="relative block aspect-video w-full overflow-hidden bg-gray-100">
                    {post.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.image}
                        alt={post.title}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="size-full flex items-center justify-center text-xs font-semibold text-gray-400">
                        {post.category}
                      </span>
                    )}
                    <span className="absolute top-3 left-3 bg-teal-600 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-xs">
                      {post.category}
                    </span>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1.5">
                        <User className="size-3.5" />
                        <span>{post.author}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        <span>{post.date}</span>
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {post.excerpt && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-100">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        <span>Read article</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                      <span className="text-[11px] text-gray-400">{post.views} views</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
