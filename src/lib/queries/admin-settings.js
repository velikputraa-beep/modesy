import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_CURRENCIES = [
  { id: 1, name: "Indonesian Rupiah", code: "IDR", symbol: "Rp", format: "Rp 1.000", isDefault: true, status: "Active" },
  { id: 2, name: "US Dollar", code: "USD", symbol: "$", format: "$1,000", isDefault: false, status: "Active" },
  { id: 3, name: "Euro", code: "EUR", symbol: "€", format: "1.000 €", isDefault: false, status: "Active" },
  { id: 4, name: "British Pound", code: "GBP", symbol: "£", format: "£1,000", isDefault: false, status: "Inactive" },
  { id: 5, name: "Japanese Yen", code: "JPY", symbol: "¥", format: "¥1,000", isDefault: false, status: "Inactive" },
];

const DEFAULT_LANGUAGES = [
  { id: 1, name: "English", code: "en", order: 1, isDefault: true, status: "Active" },
  { id: 2, name: "Bahasa Indonesia", code: "id", order: 2, isDefault: false, status: "Active" },
  { id: 3, name: "Turkish", code: "tr", order: 3, isDefault: false, status: "Inactive" },
  { id: 4, name: "Arabic", code: "ar", order: 4, isDefault: false, status: "Inactive" },
  { id: 5, name: "French", code: "fr", order: 5, isDefault: false, status: "Inactive" },
];

const DEFAULT_HOMEPAGE_SECTIONS = [
  { id: 1, name: "Featured Products Carousel", key: "featured_products", enabled: true, order: 1 },
  { id: 2, name: "Top Categories Showcase", key: "categories_grid", enabled: true, order: 2 },
  { id: 3, name: "Latest Arrivals Grid", key: "latest_products", enabled: true, order: 3 },
  { id: 4, name: "Promotional Banner Strip", key: "promo_banner", enabled: true, order: 4 },
  { id: 5, name: "Special Offers & Deals", key: "special_offers", enabled: true, order: 5 },
  { id: 6, name: "Top Verified Vendors Showcase", key: "top_sellers", enabled: true, order: 6 },
  { id: 7, name: "Trending Blog Articles", key: "blog_slider", enabled: false, order: 7 },
  { id: 8, name: "Newsletter Subscription Box", key: "newsletter_section", enabled: true, order: 8 },
  { id: 9, name: "Trust Badges Strip", key: "trust_badges", enabled: true, order: 9 },
];

const DEFAULT_SEO = {
  metaTitle: "Modesy - Modern Multi-Vendor Marketplace",
  metaDescription:
    "Temukan produk unik, busana trendi, perlengkapan rumah tangga berkualitas, dan aset digital terpercaya di Modesy.",
  metaKeywords:
    "marketplace, belanja online, fashion, produk handmade, multi-vendor, toko online indonesia",
  googleAnalyticsId: "G-MDY8829910",
};

const DEFAULT_PREFERENCES = {
  physicalProducts: true,
  digitalProducts: true,
  marketplace: true,
  classifiedAds: true,
  biddingSystem: true,
  licenseKeys: true,
  multiVendor: true,
  timezone: "Asia/Jakarta (UTC+07:00)",
};

const DEFAULT_GENERAL = {
  language: "English",
  logoUrl: "",
  faviconUrl: "",
  applicationName: "Modesy",
  siteTitle: "Modesy - Marketplace - Classified Ads Script",
  homepageTitle: "Home",
  siteDescription: "Modesy Index Page",
  keywords: "index, home, modesy",
  copyright: "Copyright 2025 Modesy - All Rights Reserved.",
  footerAbout:
    "Modesy is a modern e-commerce marketplace where buyers and sellers connect with ease. Whether you are looking to shop for unique items or grow your business by selling online, Modesy is here to help you every step of the way.",
  captchaEnabled: false,
  captchaProvider: "cloudflare_turnstile",
  captchaSiteKey: "",
  captchaSecretEnv: "TURNSTILE_SECRET_KEY",
  maintenanceEnabled: false,
  maintenanceTitle: "Coming Soon",
  maintenanceDescription:
    "Our website is under construction. We'll be soon with our new awesome site.",
  // Contact Settings
  contactEmail: "support@modesy.com",
  contactPhone: "",
  contactAddress: "",
  contactWorkingHours: "",
  // Social Media Settings (tautan profil publik)
  socialFacebook: "",
  socialTwitter: "",
  socialInstagram: "",
  socialLinkedin: "",
  socialYoutube: "",
  socialTiktok: "",
  socialPinterest: "",
  socialTelegram: "",
  socialWhatsapp: "",
};

const DEFAULT_VISUAL = {
  primaryColor: "#0284C7",
  secondaryColor: "#10B981",
  darkModeSupport: false,
};

const DEFAULT_PRODUCT_SETTINGS = {
  commissionRate: "10",
  approveBeforePublish: true,
  allowGuestReviews: false,
  enableProductComments: true,
  enableWishlist: true,
  maxImageUpload: "6",
  maxFileSizeMb: "5",
  digitalDownloadAttempts: "5",
};

const DEFAULT_ROUTES = {
  productSlug: "products",
  categorySlug: "category",
  profileSlug: "profile",
  blogSlug: "blog",
  cartSlug: "cart",
};

const DEFAULT_FONTS = {
  primaryFont: "Inter",
  secondaryFont: "Outfit",
  baseFontSize: "14px",
  headingWeight: "700",
};

const KV_DEFAULTS = {
  seo: DEFAULT_SEO,
  preferences: DEFAULT_PREFERENCES,
  general: DEFAULT_GENERAL,
  visual: DEFAULT_VISUAL,
  product: DEFAULT_PRODUCT_SETTINGS,
  routes: DEFAULT_ROUTES,
  fonts: DEFAULT_FONTS,
};

async function readList(key, fallback) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error || !data || !Array.isArray(data.value?.items) || !data.value.items.length) return fallback;
  return data.value.items;
}

export async function getCurrenciesAdmin() {
  return readList("currencies", DEFAULT_CURRENCIES);
}

export async function getLanguagesAdmin() {
  return readList("languages", DEFAULT_LANGUAGES);
}

export async function getHomepageSectionsAdmin() {
  return readList("homepage_sections", DEFAULT_HOMEPAGE_SECTIONS);
}

export async function getKvSettings(kind) {
  const defaults = KV_DEFAULTS[kind];
  if (!defaults) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", kind)
    .maybeSingle();

  if (error) {
    console.error(`[admin-settings] gagal membaca ${kind}:`, error.message);
    return { ...defaults };
  }

  const value = data?.value;
  if (!value || typeof value !== "object" || Array.isArray(value) || Array.isArray(value.items)) {
    return { ...defaults };
  }

  return { ...defaults, ...value };
}

// Dipakai metadata publik (root layout): anon tidak boleh membaca key 'seo'
// karena policy app_settings hanya mengizinkan 'homepage_sections'.
export async function getSeoSettingsServer() {
  const supabase = createAdminClient();
  if (!supabase) {
    console.warn("[seo] key service role tidak tersedia — memakai default SEO");
    return { ...KV_DEFAULTS.seo };
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "seo")
    .maybeSingle();

  if (error) {
    console.warn("[seo] gagal membaca app_settings:", error.message);
    return { ...KV_DEFAULTS.seo };
  }

  const value = data?.value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...KV_DEFAULTS.seo };

  return { ...KV_DEFAULTS.seo, ...value };
}

export async function getRolesWithPermissions() {
  const supabase = await createClient();

  const { data: roleRows, error: roleError } = await supabase
    .from("roles")
    .select("key, name, description, sort_order")
    .order("sort_order", { ascending: true });

  if (roleError) {
    console.error("[admin-settings] gagal membaca roles:", roleError.message);
    return [];
  }
  if (!roleRows?.length) return [];

  const { data: permRows, error: permError } = await supabase
    .from("role_permissions")
    .select("role_key, permission")
    .order("id", { ascending: true });

  if (permError) {
    console.error("[admin-settings] gagal membaca role_permissions:", permError.message);
  }

  const permissionsByRole = {};
  (permRows ?? []).forEach((row) => {
    (permissionsByRole[row.role_key] ||= []).push(row.permission);
  });

  const counts = await Promise.all(
    roleRows.map((row) =>
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", row.key)
        .then(({ count }) => count ?? 0),
    ),
  );

  return roleRows.map((row, i) => ({
    id: row.key,
    key: row.key,
    name: row.name,
    description: row.description,
    permissions: permissionsByRole[row.key] ?? [],
    usersCount: counts[i],
  }));
}

export async function getCacheLastCleared() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "cache_last_cleared")
    .maybeSingle();

  if (error) {
    console.error("[admin-settings] gagal membaca cache_last_cleared:", error.message);
    return null;
  }

  const clearedAt = data?.value?.clearedAt;
  return typeof clearedAt === "string" ? clearedAt : null;
}

// --- TAHAP 12D: payment / email / social settings -------------------------
// Rahasia (API key, client secret, password SMTP) TIDAK PERNAH dibaca dari
// DB maupun dikirim ke browser. Yang dikirim hanya status boolean apakah
// env var pointer-nya terisi di server.
const DEFAULT_PAYMENT = {
  activeGateway: "stripe",
  gateways: {
    stripe: { enabled: false, mode: "test", publishableKeyEnv: "STRIPE_PUBLISHABLE_KEY", secretKeyEnv: "STRIPE_SECRET_KEY" },
    paypal: { enabled: false, mode: "sandbox", clientIdEnv: "PAYPAL_CLIENT_ID", secretKeyEnv: "PAYPAL_SECRET_KEY" },
    midtrans: { enabled: false, mode: "sandbox", clientKeyEnv: "MIDTRANS_CLIENT_KEY", serverKeyEnv: "MIDTRANS_SERVER_KEY" },
    bank: { enabled: true, instructions: "" },
    cod: { enabled: false, note: "" },
  },
};

const DEFAULT_EMAIL = {
  protocol: "smtp",
  host: "",
  port: "587",
  username: "",
  passwordEnv: "SMTP_PASSWORD",
  encryption: "tls",
  senderEmail: "",
  senderName: "Modesy Marketplace",
};

const DEFAULT_SOCIAL = {
  google: { enabled: false, clientId: "", secretEnv: "GOOGLE_CLIENT_SECRET" },
  facebook: { enabled: false, appId: "", secretEnv: "FACEBOOK_APP_SECRET" },
  apple: { enabled: false, serviceId: "" },
};

function envStatus(envVar) {
  const name = String(envVar ?? "").trim();
  return { envVar: name, configured: Boolean(name && process.env[name]) };
}

async function readSettingRow(table, defaults) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("value")
    .eq("key", "default")
    .maybeSingle();

  if (error) {
    console.error(`[admin-settings] gagal membaca ${table}:`, error.message);
    return { ...defaults };
  }

  const value = data?.value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...defaults };
  return { ...defaults, ...value };
}

export async function getPaymentSettings() {
  const raw = await readSettingRow("payment_settings", DEFAULT_PAYMENT);
  const source = raw.gateways && typeof raw.gateways === "object" ? raw.gateways : {};

  const gateways = {};
  const secretStatus = {};
  for (const [name, fallback] of Object.entries(DEFAULT_PAYMENT.gateways)) {
    const merged = { ...fallback, ...(source[name] ?? {}) };
    // field rahasia apa pun dari DB dibuang sebelum keluar dari server
    delete merged.publishableKey;
    delete merged.secretKey;
    delete merged.clientId;
    delete merged.clientKey;
    delete merged.serverKey;
    delete merged.password;
    gateways[name] = merged;

    const envKeys = Object.keys(merged).filter((k) => k.endsWith("Env"));
    if (envKeys.length) {
      secretStatus[name] = Object.fromEntries(envKeys.map((k) => [k, envStatus(merged[k])]));
    }
  }

  const active = DEFAULT_PAYMENT.gateways[raw.activeGateway] ? raw.activeGateway : "stripe";
  return { settings: { activeGateway: active, gateways }, secretStatus };
}

export async function getEmailSettings() {
  const raw = await readSettingRow("email_settings", DEFAULT_EMAIL);
  delete raw.password;
  delete raw.smtpPassword;
  return {
    settings: raw,
    secretStatus: { password: envStatus(raw.passwordEnv) },
  };
}

export async function getSocialSettings() {
  const raw = await readSettingRow("social_settings", DEFAULT_SOCIAL);
  const source = raw && typeof raw === "object" ? raw : {};
  const providers = {};
  const secretStatus = {};

  for (const [name, fallback] of Object.entries(DEFAULT_SOCIAL)) {
    const merged = { ...fallback, ...(source[name] ?? {}) };
    delete merged.clientSecret;
    delete merged.appSecret;
    delete merged.secret;
    providers[name] = merged;
    if (fallback.secretEnv) secretStatus[name] = envStatus(merged.secretEnv);
  }

  return { settings: providers, secretStatus };
}

export async function getGeneralSettings() {
  const settings = await getKvSettings("general");
  return { settings, secretStatus: { captchaSecret: envStatus(settings.captchaSecretEnv) } };
}
