import { createClient } from "@/lib/supabase/server";

const BASE_SELECT = "id, title, slug, location, content, status, created_at";

function mapPage(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    location: row.location || "",
    content: row.content || "",
    date: row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "",
  };
}

// policy "Active pages are public" mengizinkan select tanpa login untuk baris active.
export async function getActivePages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select(BASE_SELECT)
    .eq("status", "active")
    .order("id", { ascending: true });

  if (error) return [];
  return (data || []).map(mapPage);
}

export async function getPageBySlug(slug) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select(BASE_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return null;
  return mapPage(data);
}
