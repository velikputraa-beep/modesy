"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/mock-auth";

const ADMIN_ROLES = ["admin", "moderator"];

// Semua mutasi admin melewati guard ini — role dibaca dari tabel profiles (DB),
// tidak pernah dari metadata user saat login.
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  if (!ADMIN_ROLES.includes(user.role)) return { error: "Akses ditolak: khusus admin/moderator" };
  return { user };
}

function revalidateAdmin(paths) {
  paths.forEach((p) => revalidatePath(p));
}

const NOT_SUPPORTED = (feature) => ({
  success: false,
  error: `Fitur ${feature} belum punya tabel di schema Supabase Modesy.`,
});

// ---------- PRODUCTS ----------
export async function updateProductStatus(productId, status) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const allowed = ["draft", "pending", "published", "hidden", "sold", "rejected", "expired"];
  if (!allowed.includes(status)) return { success: false, error: `Status ${status} tidak valid` };

  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ status }).eq("id", productId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/products", "/admin", "/products"]);
  return { success: true, message: `Status produk diubah menjadi ${status}` };
}

export async function approveProduct(productId) {
  return updateProductStatus(productId, "published");
}

export async function rejectProduct(productId) {
  return updateProductStatus(productId, "rejected");
}

export async function setProductFeatured(productId, featured) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ featured: !!featured })
    .eq("id", productId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/products/featured", "/admin", "/"]);
  return { success: true, message: featured ? "Produk ditandai sebagai Featured" : "Featured dilepas" };
}

export async function deleteProduct(productId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/products", "/admin"]);
  return { success: true, message: "Produk berhasil dihapus" };
}

// Trash (tempat sampah) — status lama disimpan di pre_trash_status oleh RPC.
export async function trashProduct(productId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_trash_product", { p_product_id: productId });
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/products", "/admin/products/deleted", "/admin", "/products"]);
  return { success: true, message: "Produk dipindahkan ke tempat sampah" };
}

export async function restoreProduct(productId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_restore_product", { p_product_id: productId });
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/products", "/admin/products/deleted", "/admin", "/products"]);
  return { success: true, message: "Produk dipulihkan dari tempat sampah" };
}

export async function renewProduct(productId, days = 30) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_renew_product", {
    p_product_id: productId,
    p_days: Number(days) || 30,
  });
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/products", "/admin/products/expired", "/admin", "/products"]);
  return { success: true, message: `Masa tayang diperpanjang sampai ${String(data).slice(0, 10)}` };
}

// ---------- USERS & ROLES ----------
export async function updateUserRole(userId, newRole) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const allowed = ["admin", "moderator", "vendor", "member"];
  if (!allowed.includes(newRole)) return { success: false, error: `Role ${newRole} tidak valid` };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_user_role", {
    p_user_id: userId,
    p_role: newRole,
  });
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/membership/users", "/admin/roles", "/admin"]);
  return { success: true, message: `Role user diubah ke ${newRole}` };
}

export async function deleteUser(userId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_user", { p_user_id: userId });
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/membership/users", "/admin"]);
  return { success: true, message: "User beserta datanya berhasil dihapus" };
}

export async function setUserVerified(userId, verified) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ verified: !!verified })
    .eq("id", userId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/membership/users", `/profile/${guard.user.username}`]);
  return { success: true, message: verified ? "User diverifikasi" : "Verifikasi dilepas" };
}

// ---------- CATEGORIES ----------
function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategory(formData) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const name = String(formData?.get?.("name") || "").trim();
  if (!name) return { success: false, error: "Nama kategori wajib diisi" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ name, slug: slugify(name), icon: String(formData.get("icon") || "") });
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/categories", "/categories", "/"]);
  return { success: true, message: `Kategori ${name} ditambahkan` };
}

export async function updateCategory(categoryId, formData) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const name = String(formData?.get?.("name") || "").trim();
  if (!name) return { success: false, error: "Nama kategori wajib diisi" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, slug: slugify(name), icon: String(formData.get("icon") || "") })
    .eq("id", categoryId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/categories", "/categories", "/"]);
  return { success: true, message: `Kategori ${name} diperbarui` };
}

export async function deleteCategory(categoryId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/categories", "/categories", "/"]);
  return { success: true, message: "Kategori dihapus" };
}

// ---------- REVIEWS & COMMENTS ----------
export async function deleteReview(reviewId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/reviews"]);
  return { success: true, message: "Review dihapus" };
}

export async function deleteComment(commentId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.from("product_comments").delete().eq("id", commentId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/comments"]);
  return { success: true, message: "Komentar dihapus" };
}

// Komentar produk tidak punya kolom moderasi di schema — approve = tidak menghapus.
export async function approveComment() {
  return NOT_SUPPORTED("moderasi/approve komentar");
}

// ---------- ORDERS / REFUND ----------
export async function updateOrderStatus(orderId, status) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const allowed = ["pending", "processing", "shipped", "completed", "cancelled"];
  if (!allowed.includes(status)) return { success: false, error: `Status ${status} tidak valid` };

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/orders", "/orders"]);
  return { success: true, message: `Status pesanan diubah menjadi ${status}` };
}

export async function markOrderPaid(orderId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "paid" })
    .eq("id", orderId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/orders", "/orders", "/admin"]);
  return { success: true, message: "Pembayaran pesanan ditandai lunas" };
}

export async function approveRefund(orderId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "refunded", status: "cancelled" })
    .eq("id", orderId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/orders", "/admin/refund-requests", "/orders"]);
  return { success: true, message: "Refund disetujui" };
}

export async function rejectRefund(orderId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "paid" })
    .eq("id", orderId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/orders", "/admin/refund-requests"]);
  return { success: true, message: "Permintaan refund ditolak" };
}

// ---------- PAYOUTS ----------
export async function approvePayout(transactionId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_resolve_payout", {
    p_transaction_id: transactionId,
    p_approve: true,
  });
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/payouts", "/admin/payouts/requests", "/wallet"]);
  return { success: true, message: "Payout disetujui" };
}

export async function rejectPayout(transactionId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_resolve_payout", {
    p_transaction_id: transactionId,
    p_approve: false,
  });
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/payouts", "/admin/payouts/requests", "/wallet"]);
  return { success: true, message: "Payout ditolak, saldo user dikembalikan" };
}

// ---------- COUPONS ----------
export async function toggleCoupon(couponId, active) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.from("coupons").update({ active: !!active }).eq("id", couponId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/coupons", "/my-coupons"]);
  return { success: true, message: active ? "Kupon diaktifkan" : "Kupon dinonaktifkan" };
}

// ---------- CHAT ----------
export async function deleteMessage(messageId) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.from("messages").delete().eq("id", messageId);
  if (error) return { success: false, error: error.message };

  revalidateAdmin(["/admin/chat-messages", "/messages"]);
  return { success: true, message: "Pesan dihapus" };
}

// ---------- SYSTEM ----------
export async function clearCache() {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  revalidatePath("/", "layout");
  return { success: true, message: "Cache seluruh route berhasil dibersihkan" };
}
