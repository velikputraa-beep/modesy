"use server";

import { getCartItems, syncCart, clearCartDb } from "@/lib/queries/cart";
import { getCurrentUser } from "@/lib/mock-auth";

export async function getCartAction() {
  const user = await getCurrentUser();
  if (!user) return { items: [] };
  const items = await getCartItems(user.id);
  return { items };
}

export async function syncCartAction(items) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  return syncCart(user.id, items || []);
}

export async function clearCartAction() {
  const user = await getCurrentUser();
  if (!user) return { success: true };
  await clearCartDb(user.id);
  return { success: true };
}
