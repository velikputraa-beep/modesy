"use server";

import { getCurrentUser } from "@/lib/mock-auth";
import {
  createReview,
  deleteReview,
  createComment,
  deleteComment,
} from "@/lib/queries/reviews";

export async function createReviewAction({ productId, rating, comment }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login untuk menulis review" };
  if (!productId) return { error: "Produk tidak ditemukan" };
  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return { error: "Rating harus antara 1 sampai 5" };
  }
  const result = await createReview({
    productId,
    rating: ratingNum,
    comment: comment?.trim() || "",
  });
  if (result.error) return { error: result.error };
  return { review: result.review };
}

export async function deleteReviewAction(reviewId) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login terlebih dahulu" };
  if (!reviewId) return { error: "Review tidak ditemukan" };
  const result = await deleteReview(reviewId);
  if (result.error) return { error: result.error };
  return { ok: true };
}

export async function createCommentAction({ productId, comment }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login untuk berkomentar" };
  if (!productId) return { error: "Produk tidak ditemukan" };
  if (!comment?.trim()) return { error: "Komentar kosong" };
  const result = await createComment({ productId, comment: comment.trim() });
  if (result.error) return { error: result.error };
  return { comment: result.comment };
}

export async function deleteCommentAction(commentId) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login terlebih dahulu" };
  if (!commentId) return { error: "Komentar tidak ditemukan" };
  const result = await deleteComment(commentId);
  if (result.error) return { error: result.error };
  return { ok: true };
}
