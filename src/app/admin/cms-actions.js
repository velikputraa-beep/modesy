"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/mock-auth";

const ADMIN_ROLES = ["admin", "moderator"];

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  if (!ADMIN_ROLES.includes(user.role)) return { error: "Akses ditolak: khusus admin/moderator" };
  return { user };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Whitelist tabel + kolom yang boleh ditulis halaman admin.
// Tipe: text | email | uuid | int | num | bool | enum(a|b|c), akhiran "!" berarti wajib.
const CMS_TABLES = {
  tags: { route: "/admin/tags", cols: { name: "text!", slug: "text" } },
  brands: {
    route: "/admin/brands",
    extraRoutes: ["/products"],
    cols: { name: "text!", slug: "text", logo_url: "text", active: "bool" },
  },
  banners: {
    route: "/admin/slider",
    extraRoutes: ["/"],
    cols: {
      title: "text!",
      subtitle: "text",
      button_link: "text",
      image_url: "text",
      sort_order: "int",
      active: "bool",
    },
  },
  themes: {
    route: "/admin/theme",
    cols: { name: "text!", description: "text", preview_url: "text", is_active: "bool", version: "text" },
  },
  pages: {
    route: "/admin/pages",
    cols: { title: "text!", slug: "text", location: "text", content: "text", status: "enum(active|inactive)" },
  },
  custom_fields: {
    route: "/admin/custom-fields",
    cols: { name: "text!", field_type: "text", category: "text", required: "bool", active: "bool" },
  },
  ad_spaces: {
    route: "/admin/ads",
    cols: { name: "text!", location: "text", size: "text", impressions: "int", clicks: "int", active: "bool" },
  },
  abuse_reports: {
    route: "/admin/abuse-reports",
    cols: { reporter_name: "text", reported_item: "text!", reason: "text", status: "enum(pending|resolved|banned)" },
  },
  email_blacklist: {
    route: "/admin/email-blacklist",
    cols: { email: "email!", reason: "text" },
  },
  newsletter_subscribers: {
    route: "/admin/newsletter",
    cols: { email: "email!", status: "enum(subscribed|unsubscribed)" },
  },
  contact_messages: {
    route: "/admin/contact-messages",
    cols: { name: "text", email: "email", subject: "text", message: "text" },
  },
  blog_categories: { route: "/admin/blog/categories", cols: { name: "text!", slug: "text" } },
  blog_posts: {
    route: "/admin/blog/posts",
    extraRoutes: ["/admin/blog", "/blog"],
    cols: {
      title: "text!",
      slug: "text",
      author_name: "text",
      category_id: "int",
      content: "text",
      image_url: "text",
      views: "int",
      status: "enum(draft|published)",
    },
  },
  blog_comments: {
    route: "/admin/comments/blog",
    cols: { post_id: "int!", commenter_name: "text", comment: "text", status: "enum(pending|approved|spam)" },
  },
  membership_plans: {
    route: "/admin/membership/plans",
    cols: { name: "text!", price: "num", duration: "text", features: "text", member_count: "int", active: "bool" },
  },
  membership_payments: {
    route: "/admin/payments/membership",
    cols: {
      payment_id: "text",
      method: "text",
      amount: "num!",
      status: "enum(pending|completed|refunded)",
      user_name: "text",
      plan: "text",
      ip: "text",
    },
  },
  promotion_payments: {
    route: "/admin/payments/promotion",
    cols: {
      payment_id: "text",
      method: "text",
      amount: "num!",
      status: "enum(pending|completed|refunded)",
      user_name: "text",
      promotion: "text",
      ip: "text",
    },
  },
  shop_requests: {
    route: "/admin/membership/shop-requests",
    cols: {
      user_id: "uuid",
      requester_name: "text",
      shop_name: "text!",
      categories: "text",
      status: "enum(pending|approved|rejected)",
    },
  },
  login_activities: {
    route: "/admin/membership/login-activities",
    cols: { user_name: "text", ip: "text", device: "text", location: "text" },
  },
  deletion_requests: {
    route: "/admin/membership/deletion-requests",
    cols: { user_name: "text", reason: "text", status: "enum(pending|approved|rejected)" },
  },
  affiliates: {
    route: "/admin/affiliate",
    cols: {
      affiliate_name: "text!",
      referrals: "int",
      earnings: "num",
      conversion_rate: "num",
      status: "enum(active|pending|banned)",
    },
  },
  countries: {
    route: "/admin/location/countries",
    extraRoutes: ["/admin/location"],
    cols: { name: "text!", code: "text!", flag: "text", active: "bool" },
  },
  states: {
    route: "/admin/location/states",
    extraRoutes: ["/admin/location"],
    cols: { name: "text!", country_id: "int!", active: "bool" },
  },
  cities: {
    route: "/admin/location/cities",
    extraRoutes: ["/admin/location"],
    cols: { name: "text!", state_id: "int!", active: "bool" },
  },
  quote_requests: {
    route: "/admin/quote-requests",
    extraRoutes: ["/products"],
    cols: {
      quantity: "int",
      bid: "num",
      message: "text",
      status: "enum(new|pending|accepted|rejected|cancelled)",
    },
  },
  support_tickets: {
    route: "/admin/help-center/tickets",
    extraRoutes: ["/admin/help-center"],
    cols: { user_name: "text", subject: "text!", priority: "enum(low|medium|high|urgent)", status: "enum(open|in_progress|resolved|closed)" },
  },
  knowledge_base_articles: {
    route: "/admin/help-center/knowledge-base",
    extraRoutes: ["/admin/help-center", "/knowledge-base"],
    cols: { title: "text!", category: "text", content: "text", views: "int", status: "enum(draft|published)" },
  },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function coerce(name, rule, raw) {
  const type = rule.replace(/!$/, "");
  if (type === "bool") return !!raw;
  if (raw === null || raw === undefined || String(raw).trim() === "") return null;
  const value = String(raw).trim();

  if (type === "int") {
    const num = Number.parseInt(value, 10);
    return Number.isNaN(num) ? undefined : num;
  }
  if (type === "num") {
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
  }
  if (type === "email") return EMAIL_RE.test(value) ? value.toLowerCase() : undefined;
  if (type === "uuid") return UUID_RE.test(value) ? value : undefined;
  if (type.startsWith("enum")) {
    const allowed = type.slice(5, -1).split("|");
    return allowed.includes(value) ? value : undefined;
  }
  return value.slice(0, 4000);
}

function sanitize(table, payload, { partial }) {
  const spec = CMS_TABLES[table];
  if (!spec) return { error: `Tabel ${table} tidak bisa dikelola dari halaman ini.` };

  const out = {};
  Object.entries(payload || {}).forEach(([key, raw]) => {
    const rule = spec.cols[key];
    if (!rule) return;
    if (raw === undefined) return;
    const value = coerce(key, rule, raw);
    if (value === undefined) {
      throw new Error(`Nilai kolom ${key} tidak valid`);
    }
    if (value !== null) out[key] = value;
  });

  if (!partial && spec.cols.slug && !out.slug) {
    const source = out.name || out.title;
    if (source) out.slug = slugify(source);
  }

  if (!partial) {
    const missing = Object.entries(spec.cols)
      .filter(([, rule]) => rule.endsWith("!"))
      .map(([key]) => key)
      .filter((key) => out[key] === undefined || out[key] === null || out[key] === "");
    if (missing.length) return { error: `Kolom wajib belum diisi: ${missing.join(", ")}` };
  }
  if (!Object.keys(out).length) return { error: "Tidak ada perubahan untuk disimpan" };

  return { values: out };
}

function revalidate(spec) {
  [spec.route, ...(spec.extraRoutes || [])].forEach((p) => revalidatePath(p));
  revalidatePath("/admin");
}

export async function cmsCreate(table, payload) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  let clean;
  try {
    clean = sanitize(table, payload, { partial: false });
  } catch (e) {
    return { success: false, error: e.message };
  }
  if (clean.error) return { success: false, error: clean.error };

  const supabase = await createClient();
  const { data, error } = await supabase.from(table).insert(clean.values).select().single();
  if (error) return { success: false, error: error.message };

  revalidate(CMS_TABLES[table]);
  return { success: true, message: "Data berhasil ditambahkan", row: data };
}

export async function cmsUpdate(table, id, payload) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };
  if (id === undefined || id === null || id === "") return { success: false, error: "ID tidak valid" };

  let clean;
  try {
    clean = sanitize(table, payload, { partial: true });
  } catch (e) {
    return { success: false, error: e.message };
  }
  if (clean.error) return { success: false, error: clean.error };

  const supabase = await createClient();
  const { data, error } = await supabase.from(table).update(clean.values).eq("id", id).select().single();
  if (error) return { success: false, error: error.message };

  revalidate(CMS_TABLES[table]);
  return { success: true, message: "Perubahan tersimpan", row: data };
}

export async function cmsDelete(table, id) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };
  if (id === undefined || id === null || id === "") return { success: false, error: "ID tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidate(CMS_TABLES[table]);
  return { success: true, message: "Data berhasil dihapus" };
}

// Mengaktifkan satu theme sekaligus menonaktifkan yang lain.
export async function activateTheme(themeId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error: offError } = await supabase.from("themes").update({ is_active: false }).not("id", "eq", themeId);
  if (offError) return { success: false, error: offError.message };

  const { data, error } = await supabase
    .from("themes")
    .update({ is_active: true })
    .eq("id", themeId)
    .select("id, name")
    .maybeSingle();
  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Theme tidak ditemukan" };

  revalidatePath("/admin/theme");
  revalidatePath("/admin");
  return { success: true, message: `Theme ${data.name} diaktifkan` };
}
