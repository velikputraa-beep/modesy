"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, clearCurrentUser } from "@/lib/mock-auth";

async function redirectByRole() {
  const user = await getCurrentUser();
  if (user?.role === "admin" || user?.role === "moderator") redirect("/admin");
  if (user?.role === "vendor") redirect("/dashboard");
  redirect("/");
}

/**
 * Login dengan email + password milik akun terdaftar.
 */
export async function loginAction(credentials) {
  const supabase = await createClient();

  const email = credentials?.email;
  const password = credentials?.password;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  await redirectByRole();
}

/**
 * Register user baru. Role SELALU 'member' di database (diatur trigger),
 * promosi ke vendor/admin dilakukan manual lewat SQL Editor.
 */
export async function registerAction(data) {
  const supabase = await createClient();

  const email = data?.email;
  const password = data?.password;
  if (!email || !password) {
    return { error: "Email dan password wajib diisi" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: data?.username,
        full_name: data?.name,
      },
    },
  });

  if (error) return { error: error.message };

  await redirectByRole();
}

/**
 * Logout
 */
export async function logoutAction() {
  await clearCurrentUser();
  redirect("/");
}
