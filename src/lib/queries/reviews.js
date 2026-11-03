import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

// Shape yang dirender ProductTabs / ProfileClient:
// { id, reviewer, reviewerUsername, avatar, rating, comment, date }
export function mapReview(row) {
  const reviewer = row.reviewer || {};
  return {
    id: row.id,
    reviewer: reviewer.full_name || reviewer.username || "Pengguna",
    reviewerUsername: reviewer.username || "",
    avatar: reviewer.avatar_url || "",
    rating: row.rating,
    comment: row.comment || "",
    date: timeAgo(row.created_at),
    productId: row.product_id,
    createdAt: row.created_at,
  };
}

export async function getProductReviews(productId) {
  if (!productId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviews_reviewer_id_fkey(username, full_name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).map(mapReview);
}

export async function getSellerReviews(sellerId) {
  if (!sellerId) return [];
  const supabase = await createClient();

  // Dua langkah: produk milik seller → review untuk produk-produk itu
  const { data: products } = await supabase
    .from("products")
    .select("id, title, slug")
    .eq("seller_id", sellerId);
  const productIds = (products || []).map((p) => p.id);
  if (productIds.length === 0) return [];

  const productMap = Object.fromEntries((products || []).map((p) => [p.id, p]));
  const { data, error } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviews_reviewer_id_fkey(username, full_name, avatar_url)")
    .in("product_id", productIds)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).map((row) => ({
    ...mapReview(row),
    product: productMap[row.product_id] || null,
  }));
}

export async function createReview({ productId, rating, comment }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return { error: "Login diperlukan" };

  const { data, error } = await supabase
    .from("reviews")
    .insert({ product_id: productId, reviewer_id: userId, rating, comment })
    .select("*, reviewer:profiles!reviews_reviewer_id_fkey(username, full_name, avatar_url)")
    .single();

  if (error) return { error: error.message };
  return { review: mapReview(data) };
}

export async function deleteReview(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

// Shape yang dirender ProductTabs (tab Comments):
// { id, name, username, avatar, date, comment, productId }
export function mapComment(row) {
  const user = row.user || {};
  return {
    id: row.id,
    name: user.full_name || user.username || "Pengguna",
    username: user.username || "",
    avatar: user.avatar_url || "",
    date: timeAgo(row.created_at),
    comment: row.comment,
    productId: row.product_id,
  };
}

export async function getProductComments(productId) {
  if (!productId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_comments")
    .select("*, user:profiles!product_comments_user_id_fkey(username, full_name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).map(mapComment);
}

export async function createComment({ productId, comment }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return { error: "Login diperlukan" };

  const { data, error } = await supabase
    .from("product_comments")
    .insert({ product_id: productId, user_id: userId, comment })
    .select("*, user:profiles!product_comments_user_id_fkey(username, full_name, avatar_url)")
    .single();

  if (error) return { error: error.message };
  return { comment: mapComment(data) };
}

export async function deleteComment(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_comments").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
