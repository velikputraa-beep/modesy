import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";
import { mapReview } from "@/lib/queries/reviews";
import { mapProduct } from "@/lib/queries/products";

const PRODUCT_SELECT =
  "*, category:categories(*), seller:profiles(*), images:product_images(*), reviews:reviews(rating)";

const ORDER_SELECT =
  "*, buyer:profiles!orders_buyer_id_fkey(id, username, full_name, avatar_url), seller:profiles!orders_seller_id_fkey(id, username, full_name, avatar_url), items:order_items(*)";

async function headCount(supabase, table, applyFilter) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (applyFilter) query = applyFilter(query);
  const { count } = await query;
  return count ?? 0;
}

export function mapAdminOrder(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    buyer: row.buyer?.full_name || row.buyer?.username || "-",
    buyerUsername: row.buyer?.username || "",
    seller: row.seller?.full_name || row.seller?.username || "-",
    sellerUsername: row.seller?.username || "",
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal || 0),
    shippingCost: Number(row.shipping_cost || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    itemCount: (row.items || []).length,
    items: (row.items || []).map((it) => ({
      id: it.id,
      title: it.title,
      image: it.image,
      quantity: it.quantity,
      unitPrice: Number(it.unit_price || 0),
      productId: it.product_id,
    })),
    date: row.created_at ? row.created_at.slice(0, 10) : "",
    timeAgo: timeAgo(row.created_at),
    createdAt: row.created_at,
  };
}

// Statistik kartu + chart di halaman /admin
export async function getAdminOverview() {
  const supabase = await createClient();

  const [
    users,
    products,
    pendingProducts,
    orders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    reviews,
    comments,
    conversations,
    messages,
    categories,
    coupons,
    recentOrders,
    recentProducts,
    paidOrders,
  ] = await Promise.all([
    headCount(supabase, "profiles"),
    headCount(supabase, "products"),
    headCount(supabase, "products", (q) => q.eq("status", "pending")),
    headCount(supabase, "orders"),
    headCount(supabase, "orders", (q) => q.eq("status", "pending")),
    headCount(supabase, "orders", (q) => q.eq("status", "completed")),
    headCount(supabase, "orders", (q) => q.eq("status", "cancelled")),
    headCount(supabase, "reviews"),
    headCount(supabase, "product_comments"),
    headCount(supabase, "conversations"),
    headCount(supabase, "messages"),
    headCount(supabase, "categories"),
    headCount(supabase, "coupons"),
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("orders").select("total, created_at").eq("payment_status", "paid"),
  ]);

  const revenue = (paidOrders.data || []).reduce((acc, o) => acc + Number(o.total || 0), 0);

  // Revenue 6 bulan terakhir untuk chart
  const monthly = {};
  (paidOrders.data || []).forEach((o) => {
    const key = (o.created_at || "").slice(0, 7);
    if (!key) return;
    monthly[key] = (monthly[key] || 0) + Number(o.total || 0);
  });
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: d.toLocaleDateString("id-ID", { month: "short" }),
      total: monthly[key] || 0,
    });
  }

  return {
    counts: {
      users,
      products,
      pendingProducts,
      orders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      reviews,
      comments,
      conversations,
      messages,
      categories,
      coupons,
    },
    revenue,
    months,
    recentOrders: (recentOrders.data || []).map(mapAdminOrder),
    recentProducts: (recentProducts.data || []).map(mapProduct),
  };
}

export async function getOrdersForAdmin({ status, search, limit = 100 } = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (search) query = query.eq("order_number", search);

  const { data, error } = await query;
  if (error) return [];
  return (data || []).map(mapAdminOrder);
}

export async function getAdminReviews({ limit = 100 } = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "*, reviewer:profiles!reviews_reviewer_id_fkey(username, full_name, avatar_url), product:products(id, title, slug)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map((row) => ({
    ...mapReview(row),
    productTitle: row.product?.title || "-",
    productSlug: row.product?.slug || "",
  }));
}

export async function getAdminComments({ limit = 100 } = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_comments")
    .select(
      "*, user:profiles!product_comments_user_id_fkey(username, full_name, avatar_url), product:products(id, title, slug)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map((row) => ({
    id: row.id,
    name: row.user?.full_name || row.user?.username || "Pengguna",
    username: row.user?.username || "",
    avatar: row.user?.avatar_url || "",
    comment: row.comment,
    productId: row.product_id,
    productTitle: row.product?.title || "-",
    productSlug: row.product?.slug || "",
    date: timeAgo(row.created_at),
    createdAt: row.created_at,
  }));
}

export async function getCategoriesWithCounts() {
  const supabase = await createClient();
  const [{ data: cats }, { data: prods }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("products").select("id, category_id, status"),
  ]);

  const counts = {};
  (prods || []).forEach((p) => {
    const key = p.category_id ?? "none";
    counts[key] = (counts[key] || 0) + 1;
  });

  return (cats || []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon || "",
    productCount: counts[c.id] || 0,
  }));
}

export async function getUsersForAdmin({ role, search, limit = 200 } = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (role) query = query.eq("role", role);
  if (search) {
    const term = `%${search}%`;
    query = query.or(`username.ilike.${term},full_name.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data || []).map((row) => ({
    id: row.id,
    username: row.username,
    full_name: row.full_name || row.username,
    email: row.email || `${row.username}@modesy.local`,
    avatar_url: row.avatar_url || "",
    role: row.role,
    verified: row.verified || false,
    shop_name: row.shop_name || "",
    location: row.location || "",
    joined: row.created_at ? row.created_at.slice(0, 10) : "",
    created_at: row.created_at,
  }));
}

export async function getAdminConversations({ limit = 50 } = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      "*, buyer:profiles!conversations_buyer_id_fkey(id, username, full_name, avatar_url), seller:profiles!conversations_seller_id_fkey(id, username, full_name, avatar_url), product:products(id, title, slug), messages(*)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map((row) => {
    const msgs = row.messages || [];
    const last = msgs[msgs.length - 1];
    return {
      id: row.id,
      buyer: row.buyer?.full_name || row.buyer?.username || "-",
      buyerUsername: row.buyer?.username || "",
      seller: row.seller?.full_name || row.seller?.username || "-",
      sellerUsername: row.seller?.username || "",
      productTitle: row.product?.title || "Umum",
      productSlug: row.product?.slug || "",
      messageCount: msgs.length,
      lastMessage: last?.content || "-",
      lastSender: last?.sender_id === row.buyer_id ? "buyer" : "seller",
      createdAt: row.created_at,
      timeAgo: timeAgo(row.created_at),
    };
  });
}

export async function getMessagesForAdmin({ limit = 200 } = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select(
      "*, sender:profiles!messages_sender_id_fkey(id, username, full_name, avatar_url), conversation:conversations(id, buyer_id, seller_id)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map((row) => ({
    id: row.id,
    content: row.content,
    sender: row.sender?.full_name || row.sender?.username || "-",
    senderUsername: row.sender?.username || "",
    avatar: row.sender?.avatar_url || "",
    conversationId: row.conversation_id,
    createdAt: row.created_at,
    timeAgo: timeAgo(row.created_at),
  }));
}

export async function getWalletTransactionsForAdmin({ type, limit = 100 } = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("wallet_transactions")
    .select("*, user:profiles!wallet_transactions_user_id_fkey(id, username, full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return [];
  return (data || []).map((row) => ({
    id: row.id,
    user: row.user?.full_name || row.user?.username || "-",
    username: row.user?.username || "",
    avatar: row.user?.avatar_url || "",
    type: row.type,
    amount: Number(row.amount || 0),
    status: row.status,
    method: row.method || "",
    description: row.description || "",
    createdAt: row.created_at,
    timeAgo: timeAgo(row.created_at),
  }));
}

export async function getWalletBalances({ limit = 100 } = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallets")
    .select("user_id, balance, updated_at, user:profiles!wallets_user_id_fkey(id, username, full_name, avatar_url)")
    .order("balance", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map((row) => ({
    userId: row.user_id,
    name: row.user?.full_name || row.user?.username || "-",
    username: row.user?.username || "",
    avatar: row.user?.avatar_url || "",
    balance: Number(row.balance || 0),
    updatedAt: row.updated_at,
  }));
}

export async function getAdminCoupons({ limit = 100 } = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*, seller:profiles!coupons_seller_id_fkey(id, username, full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map((row) => ({
    id: row.id,
    code: row.code,
    seller: row.seller?.full_name || row.seller?.username || "Platform",
    discountType: row.discount_type,
    discountValue: Number(row.discount_value || 0),
    minPurchase: Number(row.min_purchase || 0),
    maxUses: row.max_uses,
    usedCount: row.used_count,
    active: row.active,
    expiresAt: row.expires_at,
  }));
}
