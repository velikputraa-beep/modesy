"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Info, Star, MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/toast-context";
import {
  createReviewAction,
  deleteReviewAction,
  createCommentAction,
  deleteCommentAction,
} from "@/app/products/[slug]/actions";

export function ProductTabs({
  description,
  productInfo = [],
  productId,
  initialReviews = [],
  initialComments = [],
  currentUser = null,
}) {
  const [activeTab, setActiveTab] = useState("description");
  const { toast } = useToast();

  // Reviews (dari tabel reviews)
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Comments (dari tabel product_comments)
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Silakan login untuk menulis review");
      return;
    }
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    const result = await createReviewAction({
      productId,
      rating,
      comment: reviewText.trim(),
    });
    setSubmittingReview(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setReviews((prev) => [result.review, ...prev]);
    setReviewText("");
    setRating(5);
    toast.success("Review berhasil ditambahkan!");
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Silakan login untuk berkomentar");
      return;
    }
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    const result = await createCommentAction({
      productId,
      comment: newComment.trim(),
    });
    setSubmittingComment(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setComments((prev) => [result.comment, ...prev]);
    setNewComment("");
    toast.success("Komentar berhasil ditambahkan!");
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs">
      {/* Tab Navigation Header dengan sliding underline */}
      <div className="flex border-b border-gray-200 gap-3 sm:gap-6 overflow-x-auto no-scrollbar relative">
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          className={`flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === "description"
              ? "text-teal-600 font-bold"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <FileText className="size-4" />
          <span>Description</span>
          {activeTab === "description" && (
            <motion.div
              layoutId="productTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === "info"
              ? "text-teal-600 font-bold"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Info className="size-4" />
          <span>Details</span>
          {activeTab === "info" && (
            <motion.div
              layoutId="productTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === "reviews"
              ? "text-teal-600 font-bold"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Star className="size-4" />
          <span>Reviews ({reviews.length})</span>
          {activeTab === "reviews" && (
            <motion.div
              layoutId="productTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comments")}
          className={`flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer whitespace-nowrap ${
            activeTab === "comments"
              ? "text-teal-600 font-bold"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <MessageSquare className="size-4" />
          <span>Comments ({comments.length})</span>
          {activeTab === "comments" && (
            <motion.div
              layoutId="productTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {activeTab === "description" && (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
            {description || "Tidak ada deskripsi untuk produk ini."}
          </div>
        )}

        {activeTab === "info" && (
          <div className="overflow-hidden rounded-lg border border-gray-100">
            {productInfo.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <tbody className="divide-y divide-gray-100 bg-white">
                  {productInfo.map((item, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-gray-50/60" : "bg-white"}
                    >
                      <td className="w-1/3 py-3 px-4 font-medium text-gray-500">
                        {item.label}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-semibold">
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-sm text-gray-500">
                Informasi produk tidak tersedia.
              </p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {/* Form Tulis Review */}
            {currentUser ? (
              <form
                onSubmit={handleAddReview}
                className="p-4 rounded-lg border border-teal-100 bg-teal-50/40 space-y-3"
              >
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className="cursor-pointer"
                      aria-label={`Beri rating ${n} bintang`}
                    >
                      <Star
                        className={`size-5 ${
                          n <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-gray-500 ml-1.5">
                    ({rating}/5)
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Ceritakan pengalamanmu dengan produk ini..."
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview || !reviewText.trim()}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Send className="size-3.5" />
                    <span>{submittingReview ? "Mengirim..." : "Kirim"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-gray-400">
                <Link href="/login" className="text-teal-600 hover:underline">
                  Login
                </Link>{" "}
                untuk menulis review.
              </p>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Belum ada review untuk produk ini.
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.avatar || "https://i.pravatar.cc/100?u=guest"}
                        alt={rev.reviewer}
                        className="size-9 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <Link
                          href={`/profile/${rev.reviewerUsername || "member"}`}
                          className="font-semibold text-sm text-gray-900 hover:text-teal-600 transition-colors"
                        >
                          {rev.reviewer}
                        </Link>
                        <p className="text-xs text-gray-400">{rev.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-5">
            {/* Form Tambah Komentar */}
            {currentUser ? (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis pertanyaan atau komentar mengenai produk ini..."
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send className="size-3.5" />
                  <span>{submittingComment ? "Mengirim..." : "Kirim"}</span>
                </button>
              </form>
            ) : (
              <p className="text-xs text-gray-400">
                <Link href="/login" className="text-teal-600 hover:underline">
                  Login
                </Link>{" "}
                untuk berkomentar.
              </p>
            )}

            {/* List Komentar */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  Belum ada komentar untuk produk ini.
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={c.avatar || "https://i.pravatar.cc/100?u=guest"}
                        alt={c.name}
                        className="size-7 rounded-full object-cover border border-gray-200"
                      />
                      <Link
                        href={`/profile/${c.username || "member"}`}
                        className="font-semibold text-xs text-gray-900 hover:text-teal-600 transition-colors"
                      >
                        {c.name}
                      </Link>
                      <span className="text-[11px] text-gray-400">• {c.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 pl-9.5">
                      {c.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
