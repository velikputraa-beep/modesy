"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { deleteReview } from "@/app/admin/actions";

export function AdminReviewsClient({ initialReviews = [] }) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState(initialReviews);
  const [busyKey, setBusyKey] = useState(null);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const handleDelete = async (id) => {
    if (busyKey) return;
    setBusyKey(`del:${id}`);
    const res = await deleteReview(id);
    setBusyKey(null);
    if (res?.success) {
      toast.success(res.message);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      toast.error(res?.error || "Gagal menghapus ulasan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Star className="size-5 text-amber-500 fill-amber-500" />
          Reviews
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar ulasan, rating bintang, dan feedback kepuasan dari pembeli produk
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Comment</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-gray-500">
                    Belum ada ulasan di database.
                  </td>
                </tr>
              ) : (
                reviews.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {r.reviewerUsername ? (
                        <Link
                          href={`/profile/${r.reviewerUsername}`}
                          className="hover:text-teal-600 transition-colors"
                        >
                          {r.reviewer}
                        </Link>
                      ) : (
                        r.reviewer
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-blue-600 max-w-[180px] truncate">
                      {r.productSlug ? (
                        <Link href={`/products/${r.productSlug}`} className="hover:underline">
                          {r.productTitle}
                        </Link>
                      ) : (
                        r.productTitle
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${
                              i < (r.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-bold text-gray-700 ml-1">
                          {(r.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs">{r.comment}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        Published
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{r.date}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        disabled={busyKey === `del:${r.id}`}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none"
                        title="Hapus Ulasan"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
