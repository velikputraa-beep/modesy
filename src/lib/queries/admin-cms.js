import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  resolved: "Resolved",
  banned: "Banned",
  subscribed: "Subscribed",
  unsubscribed: "Unsubscribed",
  published: "Published",
  draft: "Draft",
  spam: "Spam",
  completed: "Completed",
  refunded: "Refunded",
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
  new: "Pending",
  accepted: "Responded",
  cancelled: "Closed",
};

const label = (v) => STATUS_LABEL[v] || (v ? v[0].toUpperCase() + v.slice(1) : "");

function dateOnly(iso) {
  return iso ? String(iso).slice(0, 10) : "";
}

function dateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function rows(table, select, opts = {}) {
  const supabase = await createClient();
  let query = supabase.from(table).select(select);
  if (opts.order) query = query.order(opts.order, { ascending: opts.asc ?? false });
  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

// ---------- Katalog: tags & brands ----------

export async function getTagsAdmin() {
  const [tags, links] = await Promise.all([
    rows("tags", "id, name, slug", { order: "id", asc: true }),
    rows("product_tags", "tag_id"),
  ]);
  const counts = {};
  (links || []).forEach((l) => {
    counts[l.tag_id] = (counts[l.tag_id] || 0) + 1;
  });
  return (tags || []).map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: counts[t.id] || 0 }));
}

export async function getBrandsAdmin() {
  const [brands, prods] = await Promise.all([
    rows("brands", "id, name, slug, logo_url, active", { order: "id", asc: true }),
    rows("products", "brand"),
  ]);
  const counts = {};
  (prods || []).forEach((p) => {
    if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1;
  });
  return (brands || []).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug || "",
    logo: b.logo_url || "",
    count: counts[b.name] || 0,
    status: b.active ? "Active" : "Inactive",
  }));
}

// ---------- Sliderreuse tabel banners ----------

export async function getSlidersAdmin() {
  const data = await rows("banners", "id, title, subtitle, button_link, image_url, sort_order, active", {
    order: "sort_order",
    asc: true,
  });
  return (data || []).map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || "",
    link: b.button_link || "/products",
    order: b.sort_order,
    image: b.image_url || "",
    status: b.active ? "Active" : "Inactive",
  }));
}

// ---------- CMS lainnya ----------

export async function getThemesAdmin() {
  const data = await rows("themes", "*", { order: "id", asc: true });
  return (data || []).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description || "",
    preview: t.preview_url || "",
    isActive: !!t.is_active,
    version: t.version || "",
  }));
}

export async function getPagesAdmin() {
  const data = await rows("pages", "*", { order: "id", asc: true });
  return (data || []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    location: p.location || "",
    status: label(p.status),
    date: dateOnly(p.created_at),
  }));
}

export async function getCustomFieldsAdmin() {
  const data = await rows("custom_fields", "*", { order: "id", asc: true });
  return (data || []).map((f) => ({
    id: f.id,
    name: f.name,
    type: f.field_type || "Text Input",
    category: f.category || "",
    required: !!f.required,
    status: f.active ? "Active" : "Inactive",
  }));
}

export async function getAdSpacesAdmin() {
  const data = await rows("ad_spaces", "*", { order: "id", asc: true });
  return (data || []).map((a) => ({
    id: a.id,
    name: a.name,
    location: a.location || "",
    size: a.size || "",
    impressions: a.impressions ?? 0,
    clicks: a.clicks ?? 0,
    status: a.active ? "Active" : "Inactive",
  }));
}

export async function getAbuseReportsAdmin() {
  const data = await rows("abuse_reports", "*", { order: "created_at" });
  return (data || []).map((r) => ({
    id: r.id,
    reporter: r.reporter_name || "-",
    reportedItem: r.reported_item,
    reason: r.reason || "",
    status: label(r.status),
    date: dateOnly(r.created_at),
  }));
}

export async function getEmailBlacklistAdmin() {
  const data = await rows("email_blacklist", "*", { order: "created_at" });
  return (data || []).map((e) => ({
    id: e.id,
    email: e.email,
    reason: e.reason || "",
    addedDate: dateOnly(e.created_at),
  }));
}

export async function getNewsletterAdmin() {
  const data = await rows("newsletter_subscribers", "*", { order: "created_at" });
  return (data || []).map((n) => ({
    id: n.id,
    email: n.email,
    subscribedDate: dateOnly(n.created_at),
    status: label(n.status),
  }));
}

export async function getContactMessagesAdmin() {
  const data = await rows("contact_messages", "*", { order: "created_at" });
  return (data || []).map((m) => ({
    id: m.id,
    name: m.name || "",
    email: m.email || "",
    subject: m.subject || "",
    message: m.message || "",
    date: dateTime(m.created_at),
  }));
}

// ---------- Blog ----------

export async function getBlogPostsAdmin() {
  const data = await rows(
    "blog_posts",
    "id, title, slug, author_name, category_id, views, status, created_at, category:blog_categories(id, name)",
    { order: "created_at" }
  );
  return (data || []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    author: p.author_name || "",
    categoryId: p.category_id || null,
    category: p.category?.name || "Uncategorized",
    status: label(p.status),
    views: p.views ?? 0,
    date: dateOnly(p.created_at),
    image: p.image_url || "",
  }));
}

export async function getBlogCategoriesAdmin() {
  const data = await rows("blog_categories", "id, name, slug", { order: "id", asc: true });
  const posts = await rows("blog_posts", "category_id");
  const counts = {};
  (posts || []).forEach((p) => {
    if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
  });
  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    postCount: counts[c.id] || 0,
  }));
}

export async function getBlogCommentsAdmin() {
  const data = await rows(
    "blog_comments",
    "id, commenter_name, comment, status, created_at, post:blog_posts(id, title)",
    { order: "created_at" }
  );
  return (data || []).map((c) => ({
    id: c.id,
    user: c.commenter_name || "Pengguna",
    product: null,
    post: c.post?.title || "-",
    type: "blog",
    comment: c.comment || "",
    status: label(c.status),
    date: dateTime(c.created_at),
  }));
}

// ---------- Membership & pembayaran ----------

export async function getMembershipPlansAdmin() {
  const data = await rows("membership_plans", "*", { order: "price" });
  return (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    duration: p.duration || "",
    features: p.features || "",
    members: p.member_count ?? 0,
    status: p.active ? "Active" : "Inactive",
  }));
}

export async function getMembershipPaymentsAdmin() {
  const data = await rows("membership_payments", "*", { order: "created_at" });
  return (data || []).map((p) => ({
    id: String(p.id),
    paymentId: p.payment_id || "",
    method: p.method || "",
    amount: Number(p.amount),
    status: label(p.status),
    user: p.user_name || "",
    plan: p.plan || "",
    ip: p.ip || "",
    date: dateTime(p.created_at),
  }));
}

export async function getPromotionPaymentsAdmin() {
  const data = await rows("promotion_payments", "*", { order: "created_at" });
  return (data || []).map((p) => ({
    id: p.id,
    paymentId: p.payment_id || "",
    method: p.method || "",
    amount: Number(p.amount),
    status: label(p.status),
    user: p.user_name || "",
    promotion: p.promotion || "",
    date: dateTime(p.created_at),
  }));
}

export async function getShopRequestsAdmin() {
  const data = await rows(
    "shop_requests",
    "id, requester_name, shop_name, categories, status, created_at",
    { order: "created_at" }
  );
  return (data || []).map((r) => ({
    id: r.id,
    user: r.requester_name || "",
    shopName: r.shop_name,
    categories: r.categories || "",
    status: label(r.status),
    date: dateOnly(r.created_at),
  }));
}

export async function getLoginActivitiesAdmin() {
  const data = await rows("login_activities", "*", { order: "created_at" });
  return (data || []).map((l) => ({
    id: l.id,
    user: l.user_name || "",
    ip: l.ip || "",
    device: l.device || "",
    location: l.location || "",
    date: dateTime(l.created_at),
  }));
}

export async function getDeletionRequestsAdmin() {
  const data = await rows("deletion_requests", "*", { order: "created_at" });
  return (data || []).map((d) => ({
    id: d.id,
    user: d.user_name || "",
    reason: d.reason || "",
    status: label(d.status),
    date: dateOnly(d.created_at),
  }));
}

export async function getAffiliatesAdmin() {
  const data = await rows("affiliates", "*", { order: "id", asc: true });
  return (data || []).map((a) => ({
    id: a.id,
    affiliate: a.affiliate_name,
    referrals: a.referrals ?? 0,
    earnings: Number(a.earnings ?? 0),
    conversionRate: `${a.conversion_rate}%`,
    status: label(a.status),
  }));
}

// ---------- Lokasi ----------

export async function getCountriesAdmin() {
  const data = await rows("countries", "*", { order: "name", asc: true });
  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    flag: c.flag || "",
    status: c.active ? "Active" : "Inactive",
  }));
}

export async function getStatesAdmin() {
  const data = await rows("states", "id, name, active, country:countries(id, name)", {
    order: "name",
    asc: true,
  });
  return (data || []).map((s) => ({
    id: s.id,
    name: s.name,
    country: s.country?.name || "",
    status: s.active ? "Active" : "Inactive",
  }));
}

export async function getCitiesAdmin() {
  const data = await rows(
    "cities",
    "id, name, active, state:states(id, name, country:countries(id, name))",
    { order: "name", asc: true }
  );
  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    state: c.state?.name || "",
    country: c.state?.country?.name || "",
    status: c.active ? "Active" : "Inactive",
  }));
}

// ---------- Help center ----------

export async function getSupportTicketsAdmin() {
  const data = await rows("support_tickets", "*", { order: "created_at" });
  return (data || []).map((t) => ({
    id: t.id,
    user: t.user_name || "",
    subject: t.subject,
    priority: label(t.priority),
    status: label(t.status),
    date: dateOnly(t.created_at),
  }));
}

export async function getKnowledgeBaseAdmin() {
  const data = await rows("knowledge_base_articles", "*", { order: "id", asc: true });
  return (data || []).map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category || "",
    views: a.views ?? 0,
    status: label(a.status),
  }));
}

// ---------- Quote requests (reuse tabel quote_requests) ----------

export async function getQuoteRequestsAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select(
      "id, quantity, message, status, created_at, buyer:profiles!quote_requests_buyer_id_fkey(username, full_name), product:products(id, title)"
    )
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).map((q) => ({
    id: q.id,
    buyer: q.buyer?.full_name || q.buyer?.username || "-",
    product: q.product?.title || "-",
    quantity: q.quantity,
    statusKey: q.status,
    message: q.message || (q.quantity ? `Jumlah: ${q.quantity}` : ""),
    status: label(q.status),
    date: dateOnly(q.created_at),
  }));
}

// ---------- Pengaturan payout ----------

const PAYOUT_DEFAULTS = {
  minPayoutBank: 100000,
  minPayoutPaypal: 150000,
  processingDays: 3,
  payoutFeePercentage: 0,
  autoPayoutEnabled: false,
};

export async function getPayoutSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "payout")
    .maybeSingle();

  if (error || !data) return PAYOUT_DEFAULTS;
  return { ...PAYOUT_DEFAULTS, ...(data.value || {}) };
}

export async function getPayoutTargets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallets")
    .select("balance, user_id, profile:profiles!wallets_user_id_fkey(id, username, full_name, shop_name, role)");

  if (error) return [];
  return (data || [])
    .filter((w) => w.profile && (w.profile.role === "vendor" || w.profile.role === "admin"))
    .map((w) => ({
      userId: w.user_id,
      seller: w.profile.shop_name || w.profile.full_name || w.profile.username,
      balance: Number(w.balance),
    }));
}
