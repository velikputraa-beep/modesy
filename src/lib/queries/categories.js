import { createClient } from "@/lib/supabase/server";

// Satu query tambahan untuk mengambil gambar produk representative per kategori,
// supaya thumbnail kategori memakai foto asli dari tabel products (bukan placeholder).
async function getCategoryThumbnails(supabase) {
  const { data, error } = await supabase
    .from("products")
    .select("category_id, image:product_images(url, is_primary)")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return {};

  const map = {};
  for (const row of data) {
    if (!row.category_id || map[row.category_id]) continue;
    const images = row.image || [];
    const primary = images.find((img) => img?.is_primary) || images[0];
    if (primary?.url) map[row.category_id] = primary.url;
  }
  return map;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("id");

  if (error) return [];

  const thumbnails = await getCategoryThumbnails(supabase);

  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    itemCount: `${c.products?.[0]?.count ?? 0} Items`,
    count: c.products?.[0]?.count ?? 0,
    image: thumbnails[c.id] || "",
  }));
}

// Versi ringan untuk Navbar/Footer: hanya nama kategori, tanpa hitung produk
// dan tanpa query thumbnail (dipakai di hampir semua halaman).
export async function getNavCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("name").order("id");

  if (error || !data?.length) return [];
  return data.map((c) => ({
    name: c.name,
    href: `/products?category=${encodeURIComponent(c.name)}`,
  }));
}

export async function getCategoryBySlug(slug) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return null;
  return data;
}
