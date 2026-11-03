"use server";

import { getCurrentUser } from "@/lib/mock-auth";
import { followUser, unfollowUser } from "@/lib/queries/follows";

export async function followAction(userId) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login terlebih dahulu" };
  if (!userId) return { error: "User tidak ditemukan" };
  const result = await followUser(userId);
  if (result.error) return { error: result.error };
  return { ok: true };
}

export async function unfollowAction(userId) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login terlebih dahulu" };
  if (!userId) return { error: "User tidak ditemukan" };
  const result = await unfollowUser(userId);
  if (result.error) return { error: result.error };
  return { ok: true };
}
