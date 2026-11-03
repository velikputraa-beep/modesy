import { createClient } from "@/lib/supabase/server";

// Konfigurasi beranda disimpan sebagai satu baris app_settings (key: homepage_sections)
// dengan bentuk { items: [{ id, key, name, enabled, order }] } — ditulis oleh
// /admin/homepage-manager lewat RPC admin_save_setting.
export async function getHomepageSections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "homepage_sections")
    .maybeSingle();

  if (error) {
    console.error("[homepage] gagal membaca app_settings:", error.message);
    return [];
  }

  const items = Array.isArray(data?.value?.items) ? data.value.items : null;
  if (!items) return [];

  return items
    .map((item, i) => ({
      id: item.id ?? i + 1,
      type: String(item.key ?? "").toLowerCase(),
      title: item.name ?? "",
      order: Number(item.order) || i + 1,
      visible: item.enabled !== false,
      config: item.config ?? {},
    }))
    .filter((section) => section.visible && section.type)
    .sort((a, b) => a.order - b.order);
}
