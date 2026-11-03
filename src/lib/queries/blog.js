import { createClient } from "@/lib/supabase/server";

// blog_posts punya policy "Published blog posts are public" sehingga
// pengunjung anonim boleh membaca artikel berstatus published.
export async function getLatestBlogPosts({ limit = 4 } = {}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, author_name, image_url, views, created_at, category:blog_categories(id, name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(Number(limit) || 4, 1), 12));

  if (error) {
    console.error("[blog] gagal membaca blog_posts:", error.message);
    return [];
  }

  return (data || []).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    author: post.author_name || "Tim Modesy",
    category: post.category?.name || "Artikel",
    image: post.image_url || "",
    views: post.views ?? 0,
    date: post.created_at ? String(post.created_at).slice(0, 10) : "",
  }));
}

function excerptOf(content = "") {
  return String(content)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export async function getBlogPosts({ limit = 12 } = {}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, author_name, image_url, content, views, created_at, category:blog_categories(id, name)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(Number(limit) || 12, 1), 30));

  if (error) {
    console.error("[blog] gagal membaca daftar artikel:", error.message);
    return [];
  }

  return (data || []).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    author: post.author_name || "Tim Modesy",
    category: post.category?.name || "Artikel",
    image: post.image_url || "",
    excerpt: excerptOf(post.content),
    views: post.views ?? 0,
    date: post.created_at ? String(post.created_at).slice(0, 10) : "",
  }));
}

export async function getBlogPostBySlug(slug) {
  if (!slug) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, author_name, image_url, content, views, created_at, category:blog_categories(id, name)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[blog] gagal membaca artikel:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    author: data.author_name || "Tim Modesy",
    category: data.category?.name || "Artikel",
    image: data.image_url || "",
    content: data.content || "",
    views: data.views ?? 0,
    date: data.created_at ? String(data.created_at).slice(0, 10) : "",
  };
}
