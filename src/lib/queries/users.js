import { createClient } from "@/lib/supabase/server";

function mapUser(row) {
  return {
    id: row.id,
    username: row.username,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    banner_url: row.banner_url,
    role: row.role,
    verified: row.verified || false,
    bio: row.bio || "",
    location: row.location || "",
    phone: row.phone || "",
    website: row.website || "",
    shop_name: row.shop_name || "",
    shop_description: row.shop_description || "",
    shop_settings: row.shop_settings || null,
    shop_policies: row.shop_policies || null,
    shipping_settings: row.shipping_settings || null,
    joined: row.created_at ? row.created_at.slice(0, 10) : "",
    created_at: row.created_at,
  };
}

export async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).map(mapUser);
}

export async function getUserByUsername(username) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) return null;
  return mapUser(data);
}

export async function getUserById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapUser(data);
}

export async function updateProfile(id, updates) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

// Direktori toko (/shops): seller + rating rata-rata + jumlah penjualan.
export async function getShops() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "*, products(id, reviews(rating)), sales:orders!orders_seller_id_fkey(id)"
    )
    .in("role", ["vendor", "admin"])
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data || []).map((row) => {
    const ratings = (row.products || []).flatMap((p) => p.reviews || []).map((r) => r.rating).filter(Boolean);
    return {
      ...mapUser(row),
      rating: ratings.length
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0,
      salesCount: (row.sales || []).length,
      productCount: (row.products || []).length,
    };
  });
}
