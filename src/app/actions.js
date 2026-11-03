"use server";

import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribeNewsletterAction(rawEmail) {
  const email = String(rawEmail ?? "").trim().toLowerCase().slice(0, 180);

  if (!EMAIL_RE.test(email)) {
    return { success: false, error: "Format email tidak valid" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email, status: "subscribed" });

  if (error) {
    // unique(email) -> 23505; anggap sebagai langganan yang sudah ada
    if (error.code === "23505") {
      return { success: true, duplicate: true, message: "Email itu sudah terdaftar di newsletter." };
    }
    console.error("[newsletter] gagal menyimpan subscriber:", error.message);
    return { success: false, error: "Email belum tersimpan, coba lagi sebentar" };
  }

  return { success: true, message: "Terima kasih, email Anda sudah terdaftar di newsletter." };
}
