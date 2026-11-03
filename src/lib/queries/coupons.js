import { createClient } from "@/lib/supabase/server";

export function mapCoupon(row, redeemedByMe = false) {
  const discountLabel =
    row.discount_type === "percent"
      ? `${row.discount_value}% OFF`
      : `Rp ${Number(row.discount_value).toLocaleString("id-ID")} OFF`;
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    discountLabel,
    minPurchase: Number(row.min_purchase),
    maxUses: row.max_uses,
    usedCount: row.used_count,
    expiresAt: row.expires_at,
    active: row.active,
    sellerId: row.seller_id,
    sellerName: row.seller?.full_name || row.seller?.username || "Modesy",
    used: redeemedByMe,
  };
}

// Kupon yang tersedia untuk user (belum pernah dia pakai) + yang sudah dipakai
export async function getMyCoupons(userId) {
  if (!userId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("*, seller:profiles(username, full_name), redemptions:coupon_redemptions!left(user_id)")
    .eq("active", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || [])
    .filter((row) => row.seller_id === null || row.redemptions === null || true)
    .map((row) => mapCoupon(row, (row.redemptions || []).some((r) => r.user_id === userId)));
}

export async function getSellerCoupons(sellerId) {
  if (!sellerId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*, seller:profiles(username, full_name)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).map((row) => mapCoupon(row));
}

// Validasi kupon untuk preview di checkout (validasi final tetap di RPC place_order)
export async function validateCoupon(code, subtotal, userId = null) {
  if (!code) return { error: "Kode kupon wajib diisi" };
  const supabase = await createClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", code.trim())
    .eq("active", true)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .maybeSingle();

  if (!coupon) return { error: "Kupon tidak valid atau sudah kedaluwarsa" };
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses)
    return { error: "Kuota kupon sudah habis" };
  if (Number(coupon.min_purchase) > 0 && subtotal < Number(coupon.min_purchase))
    return { error: `Minimal pembelian Rp ${Number(coupon.min_purchase).toLocaleString("id-ID")}` };
  if (userId) {
    const { data: redeemed } = await supabase
      .from("coupon_redemptions")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (redeemed) return { error: "Kupon sudah pernah kamu pakai" };
  }

  const discount =
    coupon.discount_type === "percent"
      ? Math.round((subtotal * Number(coupon.discount_value)) / 100)
      : Math.min(Number(coupon.discount_value), subtotal);

  return { coupon: mapCoupon(coupon), discount };
}

// Dipakai server actions dashboard (buat/hapus kupon penjual)
export async function createCoupon({ code, discountType, discountValue, minPurchase, maxUses, expiresAt, sellerId }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      min_purchase: minPurchase || 0,
      max_uses: maxUses || null,
      expires_at: expiresAt || null,
      seller_id: sellerId || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { coupon: mapCoupon(data) };
}

export async function deleteCoupon(id, sellerId) {
  const supabase = await createClient();
  let query = supabase.from("coupons").delete().eq("id", id);
  if (sellerId) query = query.eq("seller_id", sellerId);
  const { error } = await query;
  if (error) return { error: error.message };
  return { success: true };
}
