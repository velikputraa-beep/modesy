import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/queries/products";

export async function getFavoriteProducts(userId) {
  if (!userId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select(
      "product:products(*, category:categories(*), seller:profiles(*), images:product_images(*), reviews:reviews(rating))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).map((row) => mapProduct(row.product)).filter(Boolean);
}

export async function addToFavorites(userId, productId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("favorites")
    .upsert({ user_id: userId, product_id: productId });

  if (error) return { error: error.message };
  return { success: true };
}

export async function removeFromFavorites(userId, productId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function isFavorite(userId, productId) {
  if (!userId || !productId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  return !!data;
}

export async function clearFavorites(userId) {
  const supabase = await createClient();
  const { error } = await supabase.from("favorites").delete().eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}
