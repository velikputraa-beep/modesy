"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/mock-auth";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavoriteAction(productId, favorited) {
  const user = await getCurrentUser();
  if (!user?.id) return { error: "Login diperlukan" };

  const supabase = await createClient();
  const q = favorited
    ? supabase.from("favorites").insert({ user_id: user.id, product_id: productId })
    : supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
  const { error } = await q.select();

  if (error) return { error: error.message };

  revalidatePath("/wishlist");
  return { success: true };
}

export async function clearWishlistAction() {
  const user = await getCurrentUser();
  if (!user?.id) return { error: "Login diperlukan" };

  const supabase = await createClient();
  const { error } = await supabase.from("favorites").delete().eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/wishlist");
  return { success: true };
}
