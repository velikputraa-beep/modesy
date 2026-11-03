import { createClient } from "@/lib/supabase/server";

export async function getBanners() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return (data || []).map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || "",
    tag: b.tag || "",
    buttonText: b.button_text || "Explore Now",
    buttonLink: b.button_link || "/products",
    image: b.image_url,
  }));
}

export async function getBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("name")
    .order("name", { ascending: true });

  if (error) return [];
  return (data || []).map((b) => b.name);
}

function mapAddress(a) {
  return { id: a.id, label: a.label, address: a.address, isDefault: a.is_default };
}

export async function getAddresses(userId) {
  if (!userId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data || []).map(mapAddress);
}

export async function addAddress(userId, { label, address, isDefault }) {
  if (!userId) return { error: "Login diperlukan" };
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      label: label || "Home",
      address,
      is_default: !!isDefault,
    })
    .select("id, label, address, is_default")
    .single();

  if (error) return { error: error.message };
  return { data: mapAddress(data) };
}

export async function updateAddress(userId, id, { label, address }) {
  if (!userId) return { error: "Login diperlukan" };
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("addresses")
    .update({ label: label || "Home", address })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, label, address, is_default")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Alamat tidak ditemukan" };
  return { data: mapAddress(data) };
}

export async function removeAddress(userId, id) {
  if (!userId) return { error: "Login diperlukan" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return { ok: true };
}
