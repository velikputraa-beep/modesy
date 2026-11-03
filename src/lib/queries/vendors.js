import { createClient } from "@/lib/supabase/server";

// orders + order_items tidak terbaca oleh pengunjung anonim (RLS-nya khusus
// peserta order & admin), jadi agregasi penjual terlaris dibaca lewat RPC
// security-definer home_top_sellers() yang hanya mengembalikan identitas
// publik seller + jumlah penjualan (tanpa nilai uang dan tanpa data pembeli).
export async function getTopSellers({ limit = 6 } = {}) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("home_top_sellers", {
    p_limit: Math.min(Math.max(Number(limit) || 6, 1), 20),
  });

  if (error) {
    console.error("[vendors] gagal membaca home_top_sellers:", error.message);
    return [];
  }

  return (data || [])
    .filter((row) => row?.username)
    .map((row) => ({
      userId: row.user_id,
      username: row.username,
      name: row.full_name || row.username,
      avatar: row.avatar_url || "",
      verified: Boolean(row.verified),
      totalOrders: Number(row.total_orders) || 0,
      itemsSold: Number(row.items_sold) || 0,
    }));
}
