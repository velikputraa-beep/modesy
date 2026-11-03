"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/mock-auth";

const ADMIN_ROLES = ["admin", "moderator"];

export async function saveHomepageSectionsAction(sections) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Login diperlukan" };
  if (!ADMIN_ROLES.includes(user.role)) {
    return { success: false, error: "Akses ditolak: khusus admin/moderator" };
  }

  if (!Array.isArray(sections) || !sections.length) {
    return { success: false, error: "Daftar section tidak boleh kosong" };
  }

  const items = sections.map((sec, i) => ({
    id: Number(sec.id) || i + 1,
    name: String(sec.name ?? "").trim().slice(0, 80),
    key: String(sec.key ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 40),
    enabled: !!sec.enabled,
    order: Number(sec.order) || i + 1,
  }));

  if (items.some((sec) => !sec.key)) {
    return { success: false, error: "Setiap section wajib punya key" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_setting", {
    p_key: "homepage_sections",
    p_value: { items },
  });
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/homepage-manager");
  revalidatePath("/");
  return { success: true, message: `Konfigurasi homepage tersimpan (${items.length} section)` };
}
