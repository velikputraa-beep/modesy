"use server";

import { getCurrentUser } from "@/lib/mock-auth";
import { sendMessage } from "@/lib/queries/chat";
import { createClient } from "@/lib/supabase/server";

export async function sendMessageAction({ conversationId, content }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login terlebih dahulu" };
  if (!conversationId || !content?.trim()) return { error: "Pesan kosong" };
  const result = await sendMessage({
    conversationId,
    senderId: user.id,
    content: content.trim(),
  });
  if (result.error) return { error: result.error };
  return { ok: true, message: result.data };
}

export async function getOrCreateConversationAction({ sellerId, productId }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login terlebih dahulu" };
  if (!sellerId) return { error: "Penjual tidak ditemukan" };
  if (sellerId === user.id) return { error: "Tidak bisa chat dengan diri sendiri" };

  const supabase = await createClient();
  let query = supabase
    .from("conversations")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("seller_id", sellerId);
  if (productId) {
    query = query.eq("product_id", productId);
  } else {
    query = query.is("product_id", null);
  }
  const { data: existing } = await query.maybeSingle();
  if (existing) return { conversationId: existing.id };

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      buyer_id: user.id,
      seller_id: sellerId,
      product_id: productId || null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { conversationId: data.id };
}
