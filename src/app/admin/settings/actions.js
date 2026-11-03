"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/mock-auth";

const ADMIN_ROLES = ["admin", "moderator"];
const TEXT = (value, max = 120) => String(value ?? "").trim().slice(0, max);
const BOOL = (value) => value === true || value === "true" || value === 1;
const ONE_OF = (value, allowed, fallback) => (allowed.includes(String(value)) ? String(value) : fallback);

const NUMBER = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
};

const SLUG = (value, fallback) => {
  const cleaned = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return /^[a-z0-9][a-z0-9-]{1,39}$/.test(cleaned) ? cleaned : fallback;
};

// Nama env var tempat kunci rahasia realmente disimpan. Nilainya tidak
// pernah melewati server action ini, jadi tidak mungkin ikut tersimpan.
const ENV_KEY = (value, fallback) => {
  const name = String(value ?? "").trim().toUpperCase().replace(/[^A-Z0-9_]/g, "");
  return /^[A-Z][A-Z0-9_]{2,60}$/.test(name) ? name : fallback;
};

const KV_CONFIG = {
  seo: {
    paths: ["/admin/seo", "/admin/seo-tools"],
    clean: (v) => ({
      metaTitle: TEXT(v.metaTitle, 120),
      metaDescription: TEXT(v.metaDescription, 320),
      metaKeywords: TEXT(v.metaKeywords, 320),
      googleAnalyticsId: TEXT(v.googleAnalyticsId, 60).toUpperCase(),
    }),
    validate: (clean) => {
      if (!clean.metaTitle) return "Meta Title tidak boleh kosong";
      if (!clean.metaDescription) return "Meta Description tidak boleh kosong";
      if (clean.googleAnalyticsId && !/^[A-Z]{1,3}-[A-Z0-9-]{4,40}$/.test(clean.googleAnalyticsId)) {
        return `Google Analytics ID "${clean.googleAnalyticsId}" tidak valid (contoh: G-XXXXXXXXXX)`;
      }
      return null;
    },
  },
  preferences: {
    paths: ["/admin/preferences"],
    clean: (v) => ({
      physicalProducts: BOOL(v.physicalProducts),
      digitalProducts: BOOL(v.digitalProducts),
      marketplace: BOOL(v.marketplace),
      classifiedAds: BOOL(v.classifiedAds),
      biddingSystem: BOOL(v.biddingSystem),
      licenseKeys: BOOL(v.licenseKeys),
      multiVendor: BOOL(v.multiVendor),
      timezone: TEXT(v.timezone, 60) || "Asia/Jakarta (UTC+07:00)",
    }),
    validate: () => null,
  },
  general: {
    paths: ["/admin/settings/general"],
    clean: (v) => ({
      language: TEXT(v.language, 40) || "English",
      logoUrl: TEXT(v.logoUrl, 400),
      faviconUrl: TEXT(v.faviconUrl, 400),
      applicationName: TEXT(v.applicationName, 80),
      siteTitle: TEXT(v.siteTitle, 160),
      homepageTitle: TEXT(v.homepageTitle, 120),
      siteDescription: TEXT(v.siteDescription, 320),
      keywords: TEXT(v.keywords, 320),
      copyright: TEXT(v.copyright, 200),
      footerAbout: TEXT(v.footerAbout, 2000),
      captchaEnabled: BOOL(v.captchaEnabled),
      captchaProvider: ONE_OF(v.captchaProvider, ["cloudflare_turnstile", "recaptcha_v2", "recaptcha_v3"], "cloudflare_turnstile"),
      captchaSiteKey: TEXT(v.captchaSiteKey, 200),
      captchaSecretEnv: ENV_KEY(v.captchaSecretEnv, "TURNSTILE_SECRET_KEY"),
      maintenanceEnabled: BOOL(v.maintenanceEnabled),
      maintenanceTitle: TEXT(v.maintenanceTitle, 120),
      maintenanceDescription: TEXT(v.maintenanceDescription, 500),
      contactEmail: TEXT(v.contactEmail, 160).toLowerCase(),
      contactPhone: TEXT(v.contactPhone, 40),
      contactAddress: TEXT(v.contactAddress, 500),
      contactWorkingHours: TEXT(v.contactWorkingHours, 120),
      socialFacebook: TEXT(v.socialFacebook, 300),
      socialTwitter: TEXT(v.socialTwitter, 300),
      socialInstagram: TEXT(v.socialInstagram, 300),
      socialLinkedin: TEXT(v.socialLinkedin, 300),
      socialYoutube: TEXT(v.socialYoutube, 300),
      socialTiktok: TEXT(v.socialTiktok, 300),
      socialPinterest: TEXT(v.socialPinterest, 300),
      socialTelegram: TEXT(v.socialTelegram, 300),
      socialWhatsapp: TEXT(v.socialWhatsapp, 300),
    }),
    validate: (clean) => {
      if (!clean.applicationName) return "Application Name tidak boleh kosong";
      if (!clean.siteTitle) return "Site Title tidak boleh kosong";
      const looksLikeUrl = (value) => !value || /^(https?:\/\/|\/)/.test(value);
      if (!looksLikeUrl(clean.logoUrl)) return "Application Icon harus URL (diawali https:// atau /)";
      if (!looksLikeUrl(clean.faviconUrl)) return "Favicon harus URL (diawali https:// atau /)";
      if (clean.captchaEnabled && !clean.captchaSiteKey) return "Site Key wajib diisi saat CAPTCHA diaktifkan";
      if (clean.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean.contactEmail)) {
        return `Support Email "${clean.contactEmail}" tidak valid`;
      }
      const socialKeys = [
        "socialFacebook",
        "socialTwitter",
        "socialInstagram",
        "socialLinkedin",
        "socialYoutube",
        "socialTiktok",
        "socialPinterest",
        "socialTelegram",
        "socialWhatsapp",
      ];
      for (const key of socialKeys) {
        if (clean[key] && !/^https?:\/\//.test(clean[key])) {
          return `${key} harus diawali http:// atau https://`;
        }
      }
      return null;
    },
  },
  visual: {
    paths: ["/admin/settings/visual"],
    clean: (v) => ({
      primaryColor: TEXT(v.primaryColor, 9).toLowerCase(),
      secondaryColor: TEXT(v.secondaryColor, 9).toLowerCase(),
      darkModeSupport: BOOL(v.darkModeSupport),
    }),
    validate: (clean) => {
      const hex = /^#[0-9a-f]{6}$/;
      if (!hex.test(clean.primaryColor)) return "Primary Brand Color harus format heksa (contoh: #0284C7)";
      if (!hex.test(clean.secondaryColor)) return "Secondary Accent Color harus format heksa (contoh: #10B981)";
      return null;
    },
  },
  product: {
    paths: ["/admin/settings/product"],
    clean: (v) => ({
      commissionRate: NUMBER(v.commissionRate, 0, 100, 10),
      maxImageUpload: NUMBER(v.maxImageUpload, 1, 20, 6),
      maxFileSizeMb: NUMBER(v.maxFileSizeMb, 1, 100, 5),
      digitalDownloadAttempts: NUMBER(v.digitalDownloadAttempts, 1, 50, 5),
      approveBeforePublish: BOOL(v.approveBeforePublish),
      allowGuestReviews: BOOL(v.allowGuestReviews),
      enableProductComments: BOOL(v.enableProductComments),
      enableWishlist: BOOL(v.enableWishlist),
    }),
    validate: (clean) => (Number(clean.commissionRate) > 90 ? "Komisi maksimal 90%" : null),
  },
  routes: {
    paths: ["/admin/settings/route"],
    clean: (v) => ({
      productSlug: SLUG(v.productSlug, "products"),
      categorySlug: SLUG(v.categorySlug, "category"),
      profileSlug: SLUG(v.profileSlug, "profile"),
      blogSlug: SLUG(v.blogSlug, "blog"),
      cartSlug: SLUG(v.cartSlug, "cart"),
    }),
    validate: (clean) => {
      const values = Object.values(clean);
      if (new Set(values).size !== values.length) return "Setiap route slug harus unik";
      return null;
    },
  },
  fonts: {
    paths: ["/admin/settings/font"],
    clean: (v) => ({
      primaryFont: TEXT(v.primaryFont, 60) || "Inter",
      secondaryFont: TEXT(v.secondaryFont, 60) || "Outfit",
      baseFontSize: ONE_OF(v.baseFontSize, ["13px", "14px", "15px", "16px"], "14px"),
      headingWeight: ONE_OF(v.headingWeight, ["600", "700", "800"], "700"),
    }),
    validate: () => null,
  },
};

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  if (!ADMIN_ROLES.includes(user.role)) return { error: "Akses ditolak: khusus admin/moderator" };
  return { user };
}

async function saveList(key, items, paths) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };
  if (!Array.isArray(items) || !items.length) return { success: false, error: "Daftar tidak boleh kosong" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_setting", { p_key: key, p_value: { items } });
  if (error) return { success: false, error: error.message };

  paths.forEach((p) => revalidatePath(p));
  return { success: true, message: "Pengaturan berhasil disimpan" };
}

export async function saveCurrenciesAction(currencies) {
  if (!Array.isArray(currencies) || !currencies.length) return { success: false, error: "Daftar tidak boleh kosong" };

  const items = [];
  for (const [i, c] of currencies.entries()) {
    const code = TEXT(c.code, 6).toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) return { success: false, error: `Kode mata uang "${c.code}" harus 3 huruf` };
    items.push({
      id: Number(c.id) || i + 1,
      name: TEXT(c.name, 80),
      code,
      symbol: TEXT(c.symbol, 6),
      format: TEXT(c.format, 30),
      isDefault: !!c.isDefault,
      status: c.status === "Inactive" ? "Inactive" : "Active",
    });
  }

  if (items.filter((c) => c.isDefault).length !== 1) {
    return { success: false, error: "Harus ada tepat satu mata uang default" };
  }

  const res = await saveList("currencies", items, ["/admin/settings/currency", "/admin"]);
  return res.success ? { ...res, message: `Mata uang tersimpan (${items.length})` } : res;
}

export async function saveLanguagesAction(languages) {
  if (!Array.isArray(languages) || !languages.length) return { success: false, error: "Daftar tidak boleh kosong" };

  const items = [];
  for (const [i, l] of languages.entries()) {
    const code = TEXT(l.code, 8).toLowerCase();
    if (!/^[a-z]{2}(-[a-z]{2})?$/.test(code)) {
      return { success: false, error: `Kode bahasa "${l.code}" tidak valid (contoh: en, id, id-ID)` };
    }
    items.push({
      id: Number(l.id) || i + 1,
      name: TEXT(l.name, 80),
      code,
      order: Number(l.order) || i + 1,
      isDefault: !!l.isDefault,
      status: l.status === "Inactive" ? "Inactive" : "Active",
    });
  }

  if (items.filter((l) => l.isDefault).length !== 1) {
    return { success: false, error: "Harus ada tepat satu bahasa default" };
  }

  const res = await saveList("languages", items, ["/admin/settings/language", "/admin"]);
  return res.success ? { ...res, message: `Bahasa tersimpan (${items.length})` } : res;
}

export async function saveKvSettingAction(kind, value) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const config = KV_CONFIG[kind];
  if (!config) return { success: false, error: `Jenis pengaturan "${kind}" tidak dikenal` };
  if (!value || typeof value !== "object") return { success: false, error: "Data pengaturan tidak valid" };

  const clean = config.clean(value);
  const invalid = config.validate(clean);
  if (invalid) return { success: false, error: invalid };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_setting", { p_key: kind, p_value: clean });
  if (error) return { success: false, error: error.message };

  config.paths.forEach((p) => revalidatePath(p));
  return { success: true, message: "Pengaturan berhasil disimpan" };
}

export async function saveRolePermissionsAction(roleKey, permissions) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const key = TEXT(roleKey, 40).toLowerCase();
  if (!/^[a-z][a-z0-9_-]{1,39}$/.test(key)) return { success: false, error: "Key role tidak valid" };
  if (!Array.isArray(permissions)) return { success: false, error: "Daftar izin harus berupa array" };

  const items = [...new Set(permissions.map((p) => TEXT(p, 60)).filter(Boolean))].slice(0, 100);

  const supabase = await createClient();

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("key")
    .eq("key", key)
    .maybeSingle();
  if (roleError) return { success: false, error: roleError.message };
  if (!role) return { success: false, error: `Role "${key}" tidak ditemukan` };

  const { error: deleteError } = await supabase.from("role_permissions").delete().eq("role_key", key);
  if (deleteError) return { success: false, error: deleteError.message };

  if (items.length) {
    const { error: insertError } = await supabase
      .from("role_permissions")
      .insert(items.map((permission) => ({ role_key: key, permission })));
    if (insertError) return { success: false, error: insertError.message };
  }

  revalidatePath("/admin/roles");
  revalidatePath("/admin/roles-&-permissions");
  return { success: true, message: `Izin role ${key} tersimpan (${items.length})` };
}

export async function clearCacheAction() {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");

  const clearedAt = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_setting", {
    p_key: "cache_last_cleared",
    p_value: { clearedAt },
  });
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/cache");
  revalidatePath("/admin/cache-system");
  return { success: true, message: "Cache rute & tampilan berhasil dibersihkan" };
}

// --- TAHAP 12D: payment / email / social settings --------------------------

async function saveSettingRow(table, value, paths) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .upsert({ key: "default", value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { success: false, error: error.message };

  paths.forEach((p) => revalidatePath(p));
  return { success: true };
}

export async function savePaymentSettingsAction(payload) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const g = payload?.gateways ?? {};
  const clean = {
    activeGateway: ONE_OF(payload?.activeGateway, ["stripe", "paypal", "midtrans", "bank", "cod"], "stripe"),
    gateways: {
      stripe: {
        enabled: BOOL(g.stripe?.enabled),
        mode: ONE_OF(g.stripe?.mode, ["test", "live"], "test"),
        publishableKeyEnv: ENV_KEY(g.stripe?.publishableKeyEnv, "STRIPE_PUBLISHABLE_KEY"),
        secretKeyEnv: ENV_KEY(g.stripe?.secretKeyEnv, "STRIPE_SECRET_KEY"),
      },
      paypal: {
        enabled: BOOL(g.paypal?.enabled),
        mode: ONE_OF(g.paypal?.mode, ["sandbox", "live"], "sandbox"),
        clientIdEnv: ENV_KEY(g.paypal?.clientIdEnv, "PAYPAL_CLIENT_ID"),
        secretKeyEnv: ENV_KEY(g.paypal?.secretKeyEnv, "PAYPAL_SECRET_KEY"),
      },
      midtrans: {
        enabled: BOOL(g.midtrans?.enabled),
        mode: ONE_OF(g.midtrans?.mode, ["sandbox", "production"], "sandbox"),
        clientKeyEnv: ENV_KEY(g.midtrans?.clientKeyEnv, "MIDTRANS_CLIENT_KEY"),
        serverKeyEnv: ENV_KEY(g.midtrans?.serverKeyEnv, "MIDTRANS_SERVER_KEY"),
      },
      bank: {
        enabled: BOOL(g.bank?.enabled),
        instructions: TEXT(g.bank?.instructions, 1000),
      },
      cod: {
        enabled: BOOL(g.cod?.enabled),
        note: TEXT(g.cod?.note, 300),
      },
    },
  };

  const enabled = Object.entries(clean.gateways).filter(([, cfg]) => cfg.enabled);
  if (!enabled.length) return { success: false, error: "Aktifkan minimal satu metode pembayaran" };

  const res = await saveSettingRow("payment_settings", clean, ["/admin/settings/payment"]);
  if (!res.success) return res;
  return {
    success: true,
    message: `Gateway pembayaran tersimpan (${enabled.length} aktif). API key tetap di env var, tidak masuk database`,
  };
}

export async function saveEmailSettingsAction(payload) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const clean = {
    protocol: ONE_OF(payload?.protocol, ["smtp", "mail"], "smtp"),
    host: TEXT(payload?.host, 120),
    port: TEXT(payload?.port, 5),
    username: TEXT(payload?.username, 160),
    passwordEnv: ENV_KEY(payload?.passwordEnv, "SMTP_PASSWORD"),
    encryption: ONE_OF(payload?.encryption, ["tls", "ssl", "none"], "tls"),
    senderEmail: TEXT(payload?.senderEmail, 160).toLowerCase(),
    senderName: TEXT(payload?.senderName, 120),
  };

  if (clean.protocol === "smtp") {
    if (!clean.host) return { success: false, error: "SMTP Host tidak boleh kosong" };
    if (!/^\d{2,5}$/.test(clean.port)) return { success: false, error: `SMTP Port "${payload?.port}" harus angka` };
  }
  if (clean.senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean.senderEmail)) {
    return { success: false, error: `Sender Email "${clean.senderEmail}" tidak valid` };
  }
  if (!clean.senderName) return { success: false, error: "Sender Name tidak boleh kosong" };

  const res = await saveSettingRow("email_settings", clean, ["/admin/settings/email"]);
  if (!res.success) return res;
  return { success: true, message: "Konfigurasi email tersimpan. Password SMTP tidak disimpan di database" };
}

export async function saveSocialSettingsAction(payload) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const clean = {
    google: {
      enabled: BOOL(payload?.google?.enabled),
      clientId: TEXT(payload?.google?.clientId, 180),
      secretEnv: ENV_KEY(payload?.google?.secretEnv, "GOOGLE_CLIENT_SECRET"),
    },
    facebook: {
      enabled: BOOL(payload?.facebook?.enabled),
      appId: TEXT(payload?.facebook?.appId, 60),
      secretEnv: ENV_KEY(payload?.facebook?.secretEnv, "FACEBOOK_APP_SECRET"),
    },
    apple: {
      enabled: BOOL(payload?.apple?.enabled),
      serviceId: TEXT(payload?.apple?.serviceId, 120),
    },
  };

  if (clean.google.enabled && !clean.google.clientId) {
    return { success: false, error: "Google Client ID wajib diisi saat provider diaktifkan" };
  }
  if (clean.facebook.enabled && !clean.facebook.appId) {
    return { success: false, error: "Facebook App ID wajib diisi saat provider diaktifkan" };
  }
  if (clean.apple.enabled && !clean.apple.serviceId) {
    return { success: false, error: "Apple Service ID wajib diisi saat provider diaktifkan" };
  }

  const res = await saveSettingRow("social_settings", clean, ["/admin/settings/social"]);
  if (!res.success) return res;
  return { success: true, message: "Provider social login tersimpan. Client secret tetap di env var" };
}
