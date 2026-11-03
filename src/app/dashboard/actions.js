"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/mock-auth";
import {
  createCoupon as insertCoupon,
  deleteCoupon as removeCoupon,
} from "@/lib/queries/coupons";
import { deleteComment as removeComment, deleteReview as removeReview } from "@/lib/queries/reviews";
import { updateProfile } from "@/lib/queries/users";

const STORAGE_BUCKET = "product-images";
const PRODUCT_ROLES = ["vendor", "admin", "moderator"];
const VALID_STATUS = ["draft", "pending", "published", "hidden", "sold", "rejected"];

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function num(value, fallback = 0) {
  const n = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

async function requireSignedIn() {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  return { user };
}

async function requireVendor() {
  const result = await requireSignedIn();
  if (result.error) return result;
  if (!PRODUCT_ROLES.includes(result.user.role)) {
    return { error: "Hanya penjual yang bisa mengelola produk" };
  }
  return result;
}

async function uniqueSlug(supabase, base) {
  let slug = base || "produk";
  for (let i = 1; i <= 30; i += 1) {
    const candidate = i === 1 ? slug : `${slug}-${i}`;
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

async function uploadImage(supabase, file, userId) {
  if (!file || typeof file.size !== "number" || file.size === 0) return null;
  if (file.size > 5 * 1024 * 1024) return { error: "Gambar melebihi 5MB" };

  const ext = (file.name || "jpg").split(".").pop().toLowerCase() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type || `image/${ext}`, upsert: false });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

// ---------------- PRODUCTS ----------------

export async function createProduct(formData) {
  const { user, error } = await requireVendor();
  if (error) return { success: false, error };

  const title = String(formData.get("title") || "").trim();
  if (!title) return { success: false, error: "Judul produk wajib diisi" };

  let status = String(formData.get("status") || "pending");
  if (!VALID_STATUS.includes(status)) status = "pending";

  const supabase = await createClient();

  let categoryId = null;
  const categorySlug = String(formData.get("categorySlug") || "").trim();
  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    categoryId = cat?.id || null;
  }

  const slug = await uniqueSlug(supabase, slugify(title) || "produk");

  const productRow = {
    seller_id: user.id,
    category_id: categoryId,
    title,
    slug,
    description: String(formData.get("description") || ""),
    short_description: String(formData.get("shortDescription") || ""),
    price: num(formData.get("price")),
    old_price: num(formData.get("oldPrice")) || null,
    stock: num(formData.get("stock")),
    condition: String(formData.get("condition")) === "new" ? "new" : "used",
    location: String(formData.get("location") || user.location || ""),
    status,
  };

  let { data: product, error: insertError } = await supabase
    .from("products")
    .insert(productRow)
    .select("*")
    .single();

  // Slug bisa bentrok dengan produk milik penjual lain (tidak terlihat oleh RLS).
  if (insertError?.code === "23505") {
    ({ data: product, error: insertError } = await supabase
      .from("products")
      .insert({ ...productRow, slug: `${slug}-${Date.now().toString(36)}` })
      .select("*")
      .single());
  }

  if (insertError) return { success: false, error: insertError.message };

  const files = formData.getAll("images").filter((f) => f && typeof f.size === "number");
  const imageRows = [];
  for (let i = 0; i < Math.min(files.length, 8); i += 1) {
    const result = await uploadImage(supabase, files[i], user.id);
    if (result?.url) imageRows.push({ product_id: product.id, url: result.url, is_primary: i === 0 });
  }
  if (imageRows.length > 0) {
    await supabase.from("product_images").insert(imageRows);
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  return {
    success: true,
    productId: product.id,
    message: imageRows.length === 0
      ? "Produk tersimpan. Belum ada gambar yang berhasil diunggah."
      : `Produk tersimpan dengan ${imageRows.length} gambar (menunggu persetujuan admin).`,
  };
}

export async function updateProduct(id, formData) {
  const { user, error } = await requireVendor();
  if (error) return { success: false, error };
  if (!id) return { success: false, error: "ID produk tidak valid" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("products")
    .select("id, seller_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { success: false, error: "Produk tidak ditemukan" };
  if (existing.seller_id !== user.id && !["admin", "moderator"].includes(user.role)) {
    return { success: false, error: "Tidak bisa mengubah produk penjual lain" };
  }

  const updates = {};
  const textFields = {
    title: "title",
    description: "description",
    shortDescription: "short_description",
    location: "location",
  };
  for (const [key, column] of Object.entries(textFields)) {
    const value = formData.get(key);
    if (value != null) updates[column] = String(value);
  }
  if (formData.get("price") != null) updates.price = num(formData.get("price"));
  if (formData.get("oldPrice") != null) updates.old_price = num(formData.get("oldPrice")) || null;
  if (formData.get("stock") != null) updates.stock = num(formData.get("stock"));
  if (formData.get("condition") != null) {
    updates.condition = String(formData.get("condition")) === "new" ? "new" : "used";
  }
  if (formData.get("status") != null && VALID_STATUS.includes(String(formData.get("status")))) {
    updates.status = String(formData.get("status"));
  }

  const { error: updateError } = await supabase.from("products").update(updates).eq("id", id);
  if (updateError) return { success: false, error: updateError.message };

  const files = formData.getAll("images").filter((f) => f && typeof f.size === "number");
  const imageRows = [];
  for (let i = 0; i < Math.min(files.length, 8); i += 1) {
    const result = await uploadImage(supabase, files[i], user.id);
    if (result?.url) imageRows.push({ product_id: id, url: result.url, is_primary: files.length === 0 });
  }
  if (imageRows.length > 0) {
    const { data: current } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", id)
      .limit(1);
    if (!current?.length) imageRows[0].is_primary = true;
    await supabase.from("product_images").insert(imageRows);
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/products/${id}`);
  return { success: true, message: "Produk berhasil diperbarui" };
}

export async function bulkImportProductsAction(rows) {
  const { user, error } = await requireVendor();
  if (error) return { success: false, error };
  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, error: "CSV tidak punya baris data" };
  }
  if (rows.length > 100) {
    return { success: false, error: "Maksimal 100 produk per sekali impor" };
  }

  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, slug");
  const categoryBySlug = new Map((categories || []).map((c) => [c.slug, c.id]));

  const created = [];
  const skipped = [];

  for (const [index, row] of rows.entries()) {
    const line = index + 2;
    const title = String(row.title || "").trim();
    if (!title) {
      skipped.push(`baris ${line}: judul kosong`);
      continue;
    }

    const slug = await uniqueSlug(supabase, slugify(title) || "produk");
    const { data, error: insertError } = await supabase
      .from("products")
      .insert({
        seller_id: user.id,
        category_id: categoryBySlug.get(String(row.category || "").trim().toLowerCase()) ?? null,
        title,
        slug,
        description: String(row.description || "").slice(0, 4000),
        price: num(row.price),
        old_price: num(row.oldPrice ?? row.old_price) || null,
        stock: num(row.stock),
        condition: String(row.condition || "").trim().toLowerCase() === "new" ? "new" : "used",
        location: String(row.location || user.location || "").slice(0, 120),
        status: "pending",
      })
      .select("id, slug")
      .single();

    if (insertError) {
      skipped.push(`baris ${line}: ${insertError.message}`);
      continue;
    }
    created.push(data.slug);
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  return {
    success: true,
    created: created.length,
    skipped,
    message: `${created.length} produk dibuat (status pending, menunggu persetujuan admin)`,
  };
}

export async function deleteProduct(id) {
  const { user, error } = await requireVendor();
  if (error) return { success: false, error };
  if (!id) return { success: false, error: "ID produk tidak valid" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("products")
    .select("id, seller_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { success: false, error: "Produk tidak ditemukan" };
  if (existing.seller_id !== user.id && !["admin", "moderator"].includes(user.role)) {
    return { success: false, error: "Tidak bisa menghapus produk penjual lain" };
  }

  const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
  if (deleteError) return { success: false, error: deleteError.message };

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  return { success: true, message: "Produk berhasil dihapus" };
}

// ---------------- COUPONS ----------------

export async function createCoupon(payload = {}) {
  const { user, error } = await requireSignedIn();
  if (error) return { success: false, error };

  const { code, discountRate, numCoupons, expiryDate } = payload;
  if (!code) return { success: false, error: "Kode kupon wajib diisi" };

  const rawRate = String(discountRate || "").trim();
  const isPercent = rawRate.includes("%");
  const discountValue = num(rawRate);
  if (!discountValue || discountValue <= 0) {
    return { success: false, error: "Diskon tidak valid" };
  }

  let expiresAt = null;
  if (expiryDate) {
    const parsed = new Date(String(expiryDate).replace(" / ", "T"));
    expiresAt = Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const result = await insertCoupon({
    code: String(code).trim(),
    discountType: isPercent ? "percent" : "fixed",
    discountValue: isPercent ? Math.min(discountValue, 100) : discountValue,
    minPurchase: num(payload.minPurchase),
    maxUses: num(numCoupons) || null,
    expiresAt,
    sellerId: user.id,
  });

  if (result.error) return { success: false, error: result.error };

  revalidatePath("/dashboard/coupons");
  revalidatePath("/my-coupons");
  return { success: true, coupon: result.coupon, message: "Kupon berhasil dibuat" };
}

export async function deleteCoupon(id) {
  const { user, error } = await requireSignedIn();
  if (error) return { success: false, error };
  if (!id) return { success: false, error: "ID kupon tidak valid" };

  const scope = ["admin", "moderator"].includes(user.role) ? null : user.id;
  const result = await removeCoupon(id, scope);
  if (result.error) return { success: false, error: result.error };

  revalidatePath("/dashboard/coupons");
  return { success: true, message: "Kupon berhasil dihapus" };
}

// ---------------- SHOP SETTINGS ----------------

export async function updateShopSettings(payload = {}) {
  const { user, error } = await requireSignedIn();
  if (error) return { success: false, error };

  const updates = {
    shop_name: String(payload.shopName || ""),
    shop_description: String(payload.shopDescription || ""),
    phone: String(payload.whatsAppNumber || user.phone || ""),
    shop_settings: {
      showWhatsApp: payload.showWhatsApp === "yes",
      rssFeeds: payload.rssFeeds === "enable",
      vacationMode: payload.vacationMode === "enable",
      vacationMessage: String(payload.vacationMessage || ""),
      fixedVat: !!payload.fixedVat,
      vatRates: Array.isArray(payload.vatRates) ? payload.vatRates : [],
    },
  };

  const result = await updateProfile(user.id, updates);
  if (result.error) return { success: false, error: result.error };

  revalidatePath("/dashboard/shop-settings");
  return { success: true, message: "Pengaturan toko berhasil diperbarui" };
}

export async function updateShopPolicies(payload = {}) {
  const { user, error } = await requireSignedIn();
  if (error) return { success: false, error };

  const result = await updateProfile(user.id, {
    shop_policies: {
      returnPolicy: String(payload.returnPolicy || ""),
      cancellationPolicy: String(payload.cancellationPolicy || ""),
      shippingPolicy: String(payload.shippingPolicy || ""),
      faq: String(payload.faq || ""),
    },
  });
  if (result.error) return { success: false, error: result.error };

  revalidatePath("/dashboard/shop-policies");
  return { success: true, message: "Kebijakan toko berhasil diperbarui" };
}

export async function updateShippingSettings(payload = {}) {
  const { user, error } = await requireSignedIn();
  if (error) return { success: false, error };

  const result = await updateProfile(user.id, {
    shipping_settings: {
      zones: Array.isArray(payload.zones) ? payload.zones : [],
      deliveryTimes: Array.isArray(payload.deliveryTimes) ? payload.deliveryTimes : [],
    },
  });
  if (result.error) return { success: false, error: result.error };

  revalidatePath("/dashboard/shipping-settings");
  return { success: true, message: "Pengaturan pengiriman berhasil diperbarui" };
}

export async function deleteReview(id) {
  const { error } = await requireSignedIn();
  if (error) return { success: false, error };
  if (!id) return { success: false, error: "ID ulasan tidak valid" };

  const result = await removeReview(id);
  if (result.error) return { success: false, error: result.error };

  revalidatePath("/dashboard/reviews");
  return { success: true, message: "Ulasan berhasil dihapus" };
}

export async function deleteComment(id) {
  const { error } = await requireSignedIn();
  if (error) return { success: false, error };
  if (!id) return { success: false, error: "ID komentar tidak valid" };

  const result = await removeComment(id);
  if (result.error) return { success: false, error: result.error };

  revalidatePath("/dashboard/comments");
  return { success: true, message: "Komentar berhasil dihapus" };
}
