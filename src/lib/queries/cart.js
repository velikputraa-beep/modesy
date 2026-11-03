import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Ambil cart DB (user login) dan petakan ke shape yang dipakai cart-context:
// { id, productId, slug, title, price, originalPrice, seller, sellerId, image, quantity }
export async function getCartItems(userId) {
  if (!userId) return [];
  const supabase = await createClient();

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!cart) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select("quantity, product:products(id, slug, title, price, old_price, seller_id, seller:profiles(username, full_name), images:product_images(url))")
    .eq("cart_id", cart.id)
    .order("added_at", { ascending: false });

  if (error) return [];
  return (data || [])
    .filter((row) => row.product)
    .map((row) => ({
      id: row.product.id,
      productId: row.product.id,
      slug: row.product.slug,
      title: row.product.title,
      price: Number(row.product.price),
      originalPrice: row.product.old_price ? Number(row.product.old_price) : null,
      seller: row.product.seller?.full_name || row.product.seller?.username || "",
      sellerId: row.product.seller_id,
      image: row.product.images?.[0]?.url || "",
      quantity: row.quantity,
    }));
}

// Sinkronisasi penuh cart client ke DB.
// Pastikan baris carts ada, hapus semua item, sisipkan ulang daftar terbaru.
export async function syncCart(userId, items) {
  if (!userId) return { error: "Login diperlukan" };
  const supabase = await createClient();

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .upsert({ user_id: userId, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select("id")
    .single();

  if (cartError || !cart) return { error: cartError?.message || "Cart gagal dibuat" };

  await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  const rows = (items || [])
    .filter((it) => UUID_RE.test(String(it.productId ?? it.id ?? "")))
    .map((it) => ({
      cart_id: cart.id,
      product_id: it.productId ?? it.id,
      quantity: it.quantity || 1,
    }));

  if (rows.length > 0) {
    const { error } = await supabase.from("cart_items").insert(rows);
    if (error) return { error: error.message };
  }

  return { success: true };
}

export async function clearCartDb(userId) {
  if (!userId) return;
  const supabase = await createClient();
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (cart) await supabase.from("cart_items").delete().eq("cart_id", cart.id);
}
