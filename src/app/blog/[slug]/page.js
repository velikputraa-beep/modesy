import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, User, ArrowLeft, Eye } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getBlogPostBySlug, getLatestBlogPosts } from "@/lib/queries/blog";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Artikel tidak ditemukan - Modesy" };
  return { title: `${post.title} - Modesy Blog`, description: post.title };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = (await getLatestBlogPosts({ limit: 4 })).filter((p) => p.slug !== post.slug);
  const paragraphs = post.content
    .split(/\n{2,}|\n/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/blog" className="hover:text-gray-900">
              Blog
            </Link>{" "}
            / <span className="text-gray-800 font-medium">{post.category}</span>
          </nav>

          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-4">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {post.views} views
            </span>
          </div>

          {post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image}
              alt={post.title}
              className="w-full rounded-xl border border-gray-200 object-cover mt-6 aspect-video"
            />
          ) : null}

          {paragraphs.length > 0 ? (
            <div className="mt-8 space-y-4 text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-line">
              {paragraphs.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-gray-500 rounded-lg border border-gray-200 bg-white p-4">
              Artikel ini belum punya isi. Admin dapat menambahkannya lewat menu Admin &rarr; Blog
              &rarr; Posts.
            </p>
          )}

          <div className="mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              <ArrowLeft className="size-3.5" />
              Kembali ke semua artikel
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Artikel lainnya</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wide text-teal-600">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 mt-1.5 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-2">{item.date}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
