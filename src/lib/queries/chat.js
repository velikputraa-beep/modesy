import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

function formatMessageTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export async function getConversations(userId) {
  if (!userId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("*, buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*), product:products(id, title, slug)")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) return [];

  const conversations = (data || []).map((conv) => {
    const other = conv.buyer_id === userId ? conv.seller : conv.buyer;
    return {
      id: conv.id,
      name: other?.full_name || other?.username || "Pengguna",
      username: other?.username || "",
      avatar: other?.avatar_url || "",
      lastMessage: conv.product?.title || "",
      time: timeAgo(conv.created_at),
      unread: 0,
      productId: conv.product_id,
      buyerId: conv.buyer_id,
      sellerId: conv.seller_id,
    };
  });

  // Ambil pesan terakhir tiap percakapan
  const convIds = conversations.map((c) => c.id);
  if (convIds.length > 0) {
    const { data: lastMessages } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false });

    const latestByConv = {};
    for (const msg of lastMessages || []) {
      if (!latestByConv[msg.conversation_id]) {
        latestByConv[msg.conversation_id] = msg;
      }
    }
    for (const conv of conversations) {
      const latest = latestByConv[conv.id];
      if (latest) {
        conv.lastMessage = latest.content;
        conv.time = timeAgo(latest.created_at);
      }
    }
  }

  return conversations;
}

export async function getMessagesByConversation(userId) {
  if (!userId) return {};
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  if (!conversations || conversations.length === 0) return {};

  const convIds = conversations.map((c) => c.id);
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: true });

  if (error) return {};

  const grouped = {};
  for (const conv of conversations) grouped[conv.id] = [];
  for (const msg of data || []) {
    grouped[msg.conversation_id]?.push({
      id: msg.id,
      senderId: msg.sender_id === userId ? "me" : "them",
      text: msg.content,
      time: formatMessageTime(msg.created_at),
    });
  }
  return grouped;
}

export async function sendMessage({ conversationId, senderId, content }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}
