import { createClient } from "@/lib/supabase/server";

const ORDER_SELECT =
  "*, buyer:profiles!orders_buyer_id_fkey(*), seller:profiles!orders_seller_id_fkey(*), items:order_items(*)";

export async function attachCouponCodes(rows) {
  const ids = [...new Set((rows || []).map((r) => r.coupon_id).filter(Boolean))];
  if (!ids.length) return rows;
  const supabase = await createClient();
  const { data } = await supabase.from("coupons").select("id, code").in("id", ids);
  const byId = new Map((data || []).map((c) => [c.id, c.code]));
  return rows.map((r) => (r.coupon_id ? { ...r, coupon: { code: byId.get(r.coupon_id) } } : r));
}

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} / ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function mapOrder(row) {
  return {
    id: row.id,
    orderNumber: row.order_number || row.id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    buyer: row.buyer || null,
    seller: row.seller || null,
    items: (row.items || []).map((it) => ({
      id: it.id,
      productId: it.product_id,
      title: it.title,
      image: it.image,
      quantity: it.quantity,
      unitPrice: Number(it.unit_price),
    })),
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    discount: Number(row.discount),
    couponCode: row.coupon?.code || null,
    total: Number(row.total),
    status: row.status,
    statusLabel: STATUS_LABELS[row.status] || row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    shippingAddress: row.shipping_address,
    createdAt: row.created_at,
    date: formatDate(row.created_at),
  };
}

export async function getOrdersForUser(userId) {
  if (!userId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (await attachCouponCodes(data || [])).map(mapOrder);
}

export async function getOrdersForSeller(sellerId) {
  if (!sellerId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (await attachCouponCodes(data || [])).map(mapOrder);
}

export async function getSellerSalesCount(sellerId) {
  if (!sellerId) return 0;
  const supabase = await createClient();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", sellerId)
    .neq("status", "cancelled");
  return count ?? 0;
}

export async function getOrderById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapOrder((await attachCouponCodes([data]))[0]);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Checkout atomik via RPC: validasi stok, kurangi stok, buat order per penjual,
// terapkan kupon. Harga dan seller_id SELALU diambil dari DB di dalam RPC.
export async function placeOrder({ items, shippingAddress, paymentMethod, couponCode }) {
  const supabase = await createClient();

  const payload = [];
  for (const it of items || []) {
    const productId = it.productId || it.id;
    if (!UUID_RE.test(String(productId ?? ""))) {
      return { error: "Item keranjang tidak valid, hapus lalu tambahkan ulang produknya" };
    }
    payload.push({ product_id: productId, quantity: it.quantity || 1 });
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_items: payload,
    p_shipping_address: shippingAddress || "",
    p_payment_method: paymentMethod || "bank_transfer",
    p_coupon_code: couponCode || null,
  });

  if (error) return { error: error.message };
  return { orderId: data?.order_id };
}
