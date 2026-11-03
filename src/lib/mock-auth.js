"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Wrapper kompatibel lama di atas Supabase Auth.
 * Semua logika auth ada di src/lib/supabase/*.
 *
 * Bentuk return disamakan dengan mock user lama (name, avatar, balance, ...)
 * supaya komponen yang sudah ada tetap jalan tanpa perubahan.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return null;

    return {
      ...profile,
      name: profile.full_name,
      avatar: profile.avatar_url,
      email: user.email,
      balance: 0,
    };
  } catch (error) {
    return null;
  }
}

export async function clearCurrentUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
