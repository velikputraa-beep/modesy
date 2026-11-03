"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/mock-auth";
import { addAddress, getAddresses, updateAddress } from "@/lib/queries/content";

// Bucket `avatars` belum ada di Supabase dan kita tidak mengubah policy
// storage, jadi gambar profil disimpan di bucket `product-images`
// dengan prefix `avatars/` dan `covers/`.
const STORAGE_BUCKET = "product-images";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

async function uploadImage(supabase, file, userId, kind) {
  if (!file || typeof file.size !== "number" || file.size === 0) return { url: null };
  if (!String(file.type || "").startsWith("image/")) {
    return { error: `File ${kind} harus berupa gambar (PNG/JPG/WebP)` };
  }
  if (file.size > MAX_IMAGE_BYTES) return { error: `Gambar ${kind} melebihi 2MB` };

  const ext = (file.name || "jpg").split(".").pop().toLowerCase() || "jpg";
  const path = `${kind}/${userId}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type || `image/${ext}`, upsert: false });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function updateProfileAction(payload = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };

  const updates = {};

  const fullName = String(payload.fullName || "").trim();
  if (fullName) updates.full_name = fullName;

  const username = String(payload.username || "").trim().toLowerCase();
  if (username) {
    if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
      return { error: "Username 3-30 karakter: huruf, angka, titik, garis bawah, atau strip" };
    }
    updates.username = username;
  }

  if (payload.phone != null) updates.phone = String(payload.phone).trim();
  if (payload.bio != null) updates.bio = String(payload.bio);
  if (payload.website != null) {
    const site = String(payload.website).trim();
    if (site && !/^https?:\/\//i.test(site)) return { error: "Website harus diawali http:// atau https://" };
    updates.website = site;
  }

  const locationParts = [payload.address, payload.city, payload.country]
    .map((v) => String(v || "").trim())
    .filter(Boolean);
  if (payload.country != null || payload.city != null || payload.address != null) {
    updates.location = locationParts.join(", ");
  }

  const supabase = await createClient();

  if (payload.avatarFile) {
    const result = await uploadImage(supabase, payload.avatarFile, user.id, "avatars");
    if (result.error) return { error: result.error };
    if (result.url) updates.avatar_url = result.url;
  }
  if (payload.coverFile) {
    const result = await uploadImage(supabase, payload.coverFile, user.id, "covers");
    if (result.error) return { error: result.error };
    if (result.url) updates.banner_url = result.url;
  }

  if (Object.keys(updates).length === 0) return { error: "Tidak ada perubahan untuk disimpan" };

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) {
    if (error.code === "23505") return { error: "Username sudah dipakai" };
    return { error: error.message };
  }

  revalidatePath("/settings/edit-profile");
  // Avatar & banner tampil di Navbar/MobileNav yang ada di layout root, jadi
  // layout ikut di-invalidate supaya foto baru langsung muncul di semua halaman.
  revalidatePath("/", "layout");
  revalidatePath("/profile/[username]", "page");
  return {
    success: true,
    avatarUrl: updates.avatar_url || null,
    coverUrl: updates.banner_url || null,
  };
}

// Verifikasi password lama lewat endpoint Auth publik. Permintaan ini dibuat
// di server tanpa membawa cookie sesi, jadi sesi browser user tidak tergantikan.
async function verifyCurrentPassword(email, password) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { error: "Konfigurasi Supabase tidak lengkap" };

  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return { ok: true };
    if (res.status === 400 || res.status === 401 || res.status === 422) {
      return { error: "Password lama tidak cocok" };
    }
    if (res.status === 429) return { error: "Terlalu banyak percobaan, coba lagi sebentar" };
    return { error: `Gagal memverifikasi password (HTTP ${res.status})` };
  } catch {
    return { error: "Tidak dapat menghubungi server Auth" };
  }
}

export async function changePasswordAction({ currentPassword, newPassword, confirmPassword } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };

  const next = String(newPassword || "");
  const confirm = String(confirmPassword || "");

  if (!String(currentPassword || "")) return { error: "Password lama wajib diisi" };
  if (next.length < 6) return { error: "Password baru minimal 6 karakter" };
  if (next !== confirm) return { error: "Konfirmasi password tidak sama dengan password baru" };
  if (next === String(currentPassword)) return { error: "Password baru harus beda dari password lama" };

  const verified = await verifyCurrentPassword(user.email, String(currentPassword));
  if (verified.error) return { error: verified.error };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    return { error: error.message || "Gagal mengubah password" };
  }

  revalidatePath("/settings/edit-profile");
  return { success: true };
}

export async function saveShippingAddressAction({ label, address, isDefault, id } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };

  const cleanAddress = String(address || "").trim();
  if (cleanAddress.length < 10) return { error: "Alamat minimal 10 karakter" };

  const cleanLabel = String(label || "").trim() || "Home";
  const makeDefault = Boolean(isDefault);

  const supabase = await createClient();

  const result = id
    ? await updateAddress(user.id, String(id), { label: cleanLabel, address: cleanAddress })
    : await addAddress(user.id, { label: cleanLabel, address: cleanAddress, isDefault: makeDefault });
  if (result.error) return { error: result.error };

  if (makeDefault) {
    const savedId = result.data?.id;
    const others = await getAddresses(user.id);
    for (const row of others) {
      if (row.id === savedId) continue;
      if (!row.isDefault) continue;
      await supabase.from("addresses").update({ is_default: false }).eq("id", row.id).eq("user_id", user.id);
    }
    if (result.data) result.data.isDefault = true;
  }

  revalidatePath("/settings/edit-profile");
  revalidatePath("/checkout");
  return { success: true, address: result.data };
}
