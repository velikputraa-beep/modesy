import { createClient } from "@/lib/supabase/server";

const QUOTE_LABELS = {
  new: "New Quote Request",
  pending: "Pending Quote",
  accepted: "Accepted Quote",
  rejected: "Rejected Quote",
  cancelled: "Cancelled Quote",
};

const REFUND_LABELS = {
  requested: "Requested",
  processing: "Processing",
  approved: "Approved",
  rejected: "Rejected",
};

function daysAgo(iso) {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

export async function getQuoteRequests(userId) {
  if (!userId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quote_requests")
    .select(
      "id, quantity, bid, message, status, created_at, product:products(id, title, slug, images:product_images(url))"
    )
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).map((q) => ({
    id: q.id,
    reference: q.id.slice(0, 8).toUpperCase(),
    productName: q.product?.title || "Produk",
    slug: q.product?.slug || "",
    image: q.product?.images?.[0]?.url || "",
    quantity: q.quantity,
    bid: q.bid === null || q.bid === undefined ? undefined : Number(q.bid),
    message: q.message || "",
    status: QUOTE_LABELS[q.status] || q.status,
    daysAgo: daysAgo(q.created_at),
  }));
}

export async function deleteQuoteRequest(userId, id) {
  if (!userId) return { error: "Login diperlukan" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("quote_requests")
    .delete()
    .eq("id", id)
    .eq("buyer_id", userId);

  if (error) return { error: error.message };
  return { ok: true };
}

const SELLER_QUOTE_STATUSES = ["new", "pending", "accepted", "rejected", "cancelled"];

export async function getSellerQuoteRequests(userId) {
  if (!userId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quote_requests")
    .select(
      "id, quantity, bid, message, status, created_at, buyer:profiles!quote_requests_buyer_id_fkey(username, full_name), product:products(id, title, slug, images:product_images(url))"
    )
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[quotes] gagal membaca quote_requests seller:", error.message);
    return [];
  }

  return (data || []).map((q) => ({
    id: q.id,
    reference: `#${String(q.id).slice(0, 6).toUpperCase()}`,
    productName: q.product?.title || "Produk dihapus",
    slug: q.product?.slug || "",
    image: q.product?.images?.[0]?.url || "",
    quantity: q.quantity,
    message: q.message || "",
    buyer: q.buyer?.full_name || q.buyer?.username || "Pembeli",
    status: q.status,
    statusLabel: QUOTE_LABELS[q.status] || q.status,
    bid: q.bid === null || q.bid === undefined ? null : Number(q.bid),
    date: q.created_at ? String(q.created_at).slice(0, 16).replace("T", " / ") : "",
    daysAgo: daysAgo(q.created_at),
  }));
}

export async function updateSellerQuoteRequest(userId, id, { status, bid }) {
  if (!userId) return { error: "Login diperlukan" };
  if (!SELLER_QUOTE_STATUSES.includes(status)) return { error: "Status tidak valid" };

  const patch = { status };
  if (bid !== undefined && bid !== null && bid !== "") {
    const value = Number(bid);
    if (!Number.isFinite(value) || value < 0) return { error: "Nilai bid tidak valid" };
    patch.bid = value;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .update(patch)
    .eq("id", id)
    .eq("seller_id", userId)
    .select("id, status, bid")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Permintaan penawaran tidak ditemukan" };
  return { ok: true, quote: { id: data.id, status: data.status, bid: data.bid } };
}

export async function getRefundRequests(userId) {
  if (!userId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("refund_requests")
    .select("id, reason, status, created_at, order:orders(order_number, items:order_items(title, image))")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).map((r) => ({
    id: r.id,
    orderNumber: r.order?.order_number || "",
    orderId: r.order?.id || null,
    productName: r.order?.items?.[0]?.title || "Pesanan",
    image: r.order?.items?.[0]?.image || "",
    reason: r.reason,
    status: REFUND_LABELS[r.status] || r.status,
    daysAgo: daysAgo(r.created_at),
  }));
}

export async function createRefundRequest(userId, { orderNumber, reason }) {
  if (!userId) return { error: "Login diperlukan" };
  if (!orderNumber) return { error: "Nomor order wajib diisi" };
  if (!reason) return { error: "Alasan wajib diisi" };

  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, seller_id")
    .eq("order_number", orderNumber.startsWith("#") ? orderNumber : `#${orderNumber}`)
    .eq("buyer_id", userId)
    .maybeSingle();

  if (!order) return { error: "Order tidak ditemukan untuk akun ini" };

  const { error } = await supabase.from("refund_requests").insert({
    order_id: order.id,
    buyer_id: userId,
    seller_id: order.seller_id,
    reason,
    status: "requested",
  });

  if (error) return { error: error.message };
  return { ok: true, refunds: await getRefundRequests(userId) };
}

const SELLER_REFUND_STATUSES = ["requested", "processing", "approved", "rejected"];

export async function getSellerRefundRequests(userId) {
  if (!userId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("refund_requests")
    .select(
      "id, reason, status, created_at, buyer:profiles!refund_requests_buyer_id_fkey(username, full_name), order:orders(order_number, total, items:order_items(title, image))"
    )
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[refunds] gagal membaca refund_requests seller:", error.message);
    return [];
  }

  return (data || []).map((r) => ({
    id: r.id,
    orderNumber: r.order?.order_number ? `#${r.order.order_number}` : "",
    productName: r.order?.items?.[0]?.title || "Pesanan",
    buyer: r.buyer?.full_name || r.buyer?.username || "Pembeli",
    total: Number(r.order?.total || 0),
    reason: r.reason || "",
    status: r.status,
    statusLabel: REFUND_LABELS[r.status] || r.status,
    daysAgo: daysAgo(r.created_at),
    date: r.created_at ? String(r.created_at).slice(0, 16).replace("T", " / ") : "",
  }));
}

export async function updateSellerRefundRequest(userId, id, status) {
  if (!userId) return { error: "Login diperlukan" };
  if (!SELLER_REFUND_STATUSES.includes(status)) return { error: "Status tidak valid" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("refund_requests")
    .update({ status })
    .eq("id", id)
    .eq("seller_id", userId)
    .select("id, status")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Pengajuan refund tidak ditemukan" };
  return { ok: true, status: data.status };
}

export async function getDigitalDownloads(userId) {
  if (!userId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_number, created_at, items:order_items(id, title, image, quantity, product:products(id, slug, is_digital, file_url, seller:profiles(username, full_name), reviews:reviews(rating)))"
    )
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).flatMap((order) =>
    (order.items || [])
      .filter((item) => item.product?.is_digital)
      .map((item) => {
        const ratings = (item.product.reviews || []).map((r) => r.rating).filter(Boolean);
        const avg = ratings.length
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
          : 0;
        return {
          id: item.id,
          productId: item.product.id,
          productName: item.title,
          slug: item.product.slug || "",
          seller: item.product.seller?.full_name || item.product.seller?.username || "",
          rating: avg,
          image: item.image,
          fileUrl: item.product.file_url || "",
          orderNumber: order.order_number || "",
        };
      })
  );
}
