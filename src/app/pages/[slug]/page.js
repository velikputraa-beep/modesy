import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getPageBySlug } from "@/lib/queries/pages";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Halaman tidak ditemukan - Modesy" };
  return { title: `${page.title} - Modesy`, description: page.title };
}

function renderContent(content) {
  const blocks = String(content)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const heading = block.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      return (
        <h2 key={index} className="text-base font-bold text-gray-900 pt-2">
          {heading[2]}
        </h2>
      );
    }
    return (
      <p key={index} className="whitespace-pre-line">
        {block}
      </p>
    );
  });
}

export default async function DynamicPageView({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>{" "}
            / <span className="text-gray-800 font-medium">{page.title}</span>
          </nav>

          <article className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 sm:p-9">
            <div className="flex items-center gap-2 text-teal-600 mb-2">
              <FileText className="size-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {page.location || "Informasi"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {page.title}
            </h1>
            {page.date && <p className="mt-2 text-xs text-gray-400">Diperbarui {page.date}</p>}

            <div className="mt-6 space-y-4 text-sm text-gray-600 leading-relaxed">
              {page.content ? (
                renderContent(page.content)
              ) : (
                <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-xs text-gray-500">
                  Konten halaman ini belum diisi administrator.
                </p>
              )}
            </div>

            <div className="mt-8 pt-5 border-t border-gray-100">
              <Link
                href="/"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                &larr; Kembali ke Home
              </Link>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
