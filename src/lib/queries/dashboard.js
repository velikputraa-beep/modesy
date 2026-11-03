import { createClient } from "@/lib/supabase/server";
import { mapOrder, attachCouponCodes } from "@/lib/queries/orders";
import { mapProduct } from "@/lib/queries/products";
import { timeAgo } from "@/lib/utils";

const ORDER_SELECT =
  "*, buyer:profiles!orders_buyer_id_fkey(username, full_name, avatar_url), seller:profiles!orders_seller_id_fkey(username, full_name, avatar_url), items:order_items(*)";

const PRODUCT_SELECT =
  "*, category:categories(*), seller:profiles(*), images:product_images(*), reviews:reviews(rating)";

const PAYMENT_LABELS = {
  pending: "Pending Payment",
  paid: "Payment Received",
  refunded: "Refunded",
};

const STATUS_FILTER_LABEL = {
  all: null,
  products: null,
  published: "published",
  active: "published",
  pending: "pending",
  drafts: "draft",
  draft: "draft",
  hidden: "hidden",
  sold: "sold",
  rejected: "rejected",
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} / ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function firstItemTitle(order) {
  const items = order.items || [];
  if (items.length === 0) return "—";
  return items.length > 1 ? `${items[0].title} +${items.length - 1} lainnya` : items[0].title;
}

function toSalesRow(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.buyer?.full_name || order.buyer?.username || "Pembeli",
    buyerUsername: order.buyer?.username || "",
    product: firstItemTitle(order),
    total: order.total,
    subtotal: order.subtotal,
    status: order.statusLabel,
    statusKey: order.status,
    paymentStatus: PAYMENT_LABELS[order.paymentStatus] || "Pending Payment",
    paymentKey: order.paymentStatus,
    date: order.date,
    createdAt: order.createdAt,
    items: order.items || [],
  };
}

function toOrderRow(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    seller: order.seller?.full_name || order.seller?.username || "Penjual",
    sellerUsername: order.seller?.username || "",
    product: firstItemTitle(order),
    total: order.total,
    status: order.statusLabel,
    statusKey: order.status,
    paymentStatus: PAYMENT_LABELS[order.paymentStatus] || "Pending Payment",
    paymentKey: order.paymentStatus,
    date: order.date,
    createdAt: order.createdAt,
    items: order.items || [],
  };
}

function toDashboardProduct(product) {
  return {
    ...product,
    sku: product.slug,
    productType: product.condition,
    plan: product.isFeatured ? "Featured" : null,
    stockStatus: product.stock > 0 ? `Tersedia (${product.stock})` : "Habis",
    statusKey: product.status,
    pageViews: product.views ?? 0,
    date: formatDate(product.createdAt),
    badge: product.isFeatured ? "Featured" : null,
    discountBadge: product.discountPercentage ? `Diskon ${product.discountPercentage}%` : null,
  };
}

async function fetchOrders(supabase, column, userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq(column, userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return [];
  return (await attachCouponCodes(data || [])).map(mapOrder);
}

// ---------- Sales & Orders ----------

export async function getSellerSales(sellerId) {
  const supabase = await createClient();
  const orders = await fetchOrders(supabase, "seller_id", sellerId);
  return orders.map(toSalesRow);
}

export async function getBuyerOrders(buyerId) {
  const supabase = await createClient();
  const orders = await fetchOrders(supabase, "buyer_id", buyerId);
  return orders.map(toOrderRow);
}

// ---------- Statistik dashboard ----------

export async function getSellerStats(sellerId) {
  if (!sellerId) return { products: 0, sales: 0, balance: 0, views: 0 };
  const supabase = await createClient();

  const [products, orders, wallet] = await Promise.all([
    supabase
      .from("products")
      .select("id, views, status")
      .eq("seller_id", sellerId),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .neq("status", "cancelled"),
    supabase.from("wallets").select("balance").eq("user_id", sellerId).maybeSingle(),
  ]);

  const rows = products.data || [];
  return {
    products: rows.length,
    sales: orders.count ?? 0,
    balance: wallet.data ? Number(wallet.data.balance) : 0,
    views: rows.reduce((sum, p) => sum + (p.views || 0), 0),
    pendingProducts: rows.filter((p) => p.status === "pending").length,
  };
}

export async function getBuyerStats(buyerId) {
  if (!buyerId) return { orders: 0, wishlist: 0, messages: 0, reviews: 0 };
  const supabase = await createClient();

  const [orders, wishlist, conversations, reviews] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", buyerId),
    supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", buyerId),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", buyerId),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("reviewer_id", buyerId),
  ]);

  return {
    orders: orders.count ?? 0,
    wishlist: wishlist.count ?? 0,
    messages: conversations.count ?? 0,
    reviews: reviews.count ?? 0,
  };
}

// ---------- Produk milik penjual ----------

export async function getSellerProducts(sellerId, status = "all") {
  if (!sellerId) return [];
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(200);

  const statusKey = Object.hasOwn(STATUS_FILTER_LABEL, status)
    ? STATUS_FILTER_LABEL[status]
    : status;
  if (statusKey) query = query.eq("status", statusKey);

  const { data, error } = await query;
  if (error) return [];
  return (data || []).map((row) => toDashboardProduct(mapProduct(row)));
}

// ---------- Ulasan & komentar pada produk penjual ----------

export async function getSellerComments(sellerId) {
  if (!sellerId) return [];
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, slug")
    .eq("seller_id", sellerId);
  const productIds = (products || []).map((p) => p.id);
  if (productIds.length === 0) return [];

  const productMap = Object.fromEntries((products || []).map((p) => [p.id, p]));
  const { data, error } = await supabase
    .from("product_comments")
    .select("*, user:profiles!product_comments_user_id_fkey(username, full_name, avatar_url)")
    .in("product_id", productIds)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return [];
  return (data || []).map((row) => {
    const prod = productMap[row.product_id] || {};
    return {
      id: row.id,
      comment: row.comment,
      product: prod.title || "Produk",
      productSlug: prod.slug || "",
      user: row.user?.full_name || row.user?.username || "Pengguna",
      avatar: row.user?.avatar_url || "",
      date: formatDate(row.created_at),
      timeAgo: timeAgo(row.created_at),
    };
  });
}

export async function getDashboardReviews(userId, { asSeller = true } = {}) {
  if (!userId) return [];
  const supabase = await createClient();

  let query = supabase.from("reviews").select(
    asSeller
      ? "*, product:products!reviews_product_id_fkey(id, title, slug, seller_id), reviewer:profiles!reviews_reviewer_id_fkey(username, full_name, avatar_url)"
      : "*, product:products!reviews_product_id_fkey(id, title, slug), reviewer:profiles!reviews_reviewer_id_fkey(username, full_name, avatar_url)"
  );

  if (asSeller) query = query.eq("product.seller_id", userId);
  else query = query.eq("reviewer_id", userId);

  const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
  if (error) return [];

  return (data || []).map((row) => ({
    id: row.id,
    user: row.reviewer?.full_name || row.reviewer?.username || "Pengguna",
    rating: row.rating,
    comment: row.comment || "",
    product: row.product?.title || "Produk",
    productSlug: row.product?.slug || "",
    date: formatDate(row.created_at),
  }));
}

// ---------- Produk tunggal milik penjual (mode edit) ----------

export async function getSellerProductById(productId, sellerId) {
  if (!productId || !sellerId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .maybeSingle();
  if (error || !data) return null;
  return toDashboardProduct(mapProduct(data));
}

// ---------- Riwayat pembayaran langganan & promosi ----------
// Tabel membership_payments / promotion_payments hanya punya kolom user_name
// (teks, tanpa FK user_id). Admin/moderator membaca seluruh buku besar (policy
// SELECT-nya memang khusus is_admin()), akun lain difilter berdasarkan
// username / full_name / shop_name milik sendiri sehingga biasanya kosong —
// halaman menampilkan empty state, bukan data contoh.

const LEDGER_ROLES = ["admin", "moderator"];

function paymentNameKeys(user) {
  return [...new Set([user?.username, user?.full_name, user?.shop_name].filter(Boolean))];
}

async function fetchUserPayments(table, user, detailKey) {
  if (!user) return { rows: [], scopedToUser: false };
  const isLedger = LEDGER_ROLES.includes(user.role);
  const names = paymentNameKeys(user);
  if (!isLedger && names.length === 0) return { rows: [], scopedToUser: true };

  const supabase = await createClient();
  let query = supabase.from(table).select("*");
  if (!isLedger) query = query.in("user_name", names);
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { rows: [], scopedToUser: !isLedger };

  return {
    scopedToUser: !isLedger,
    rows: (data || []).map((row) => ({
      id: row.id,
      paymentId: row.payment_id || "—",
      method: row.method || "—",
      amount: Number(row.amount || 0),
      status: row.status || "pending",
      detail: row[detailKey] || "",
      buyer: row.user_name || "",
      date: formatDate(row.created_at),
    })),
  };
}

export function getUserMembershipPayments(user) {
  return fetchUserPayments("membership_payments", user, "plan");
}

export function getUserPromotionPayments(user) {
  return fetchUserPayments("promotion_payments", user, "promotion");
}

// ---------- Ringkasan untuk halaman utama dashboard ----------

export async function getDashboardOverview(user) {
  if (!user) return null;
  const isVendor = ["vendor", "admin", "moderator"].includes(user.role);

  if (!isVendor) {
    const [stats, orders, reviews] = await Promise.all([
      getBuyerStats(user.id),
      getBuyerOrders(user.id),
      getDashboardReviews(user.id, { asSeller: false }),
    ]);
    return { role: user.role, stats, orders, reviews, sales: [], comments: [] };
  }

  const [stats, sales, products, reviews, comments] = await Promise.all([
    getSellerStats(user.id),
    getSellerSales(user.id),
    getSellerProducts(user.id),
    getDashboardReviews(user.id, { asSeller: true }),
    getSellerComments(user.id),
  ]);
  return { role: user.role, stats, sales, products, reviews, comments, orders: [] };
}
