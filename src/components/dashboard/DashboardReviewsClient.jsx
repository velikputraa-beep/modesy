"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast-context";
import { deleteReview } from "@/app/dashboard/actions";

export function DashboardReviewsClient({ reviews = [] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) return;
    if (deletingId) return;
    setDeletingId(id);
    const result = await deleteReview(id);
    setDeletingId(null);
    if (result?.success) {
      toast.success(result.message || "Ulasan berhasil dihapus");
      router.refresh();
    } else {
      toast.error(result?.error || "Gagal menghapus ulasan");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-800">
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-16 text-xs font-semibold text-gray-600">
                  Id
                </TableHead>
                <TableHead className="w-40 text-xs font-semibold text-gray-600">
                  User
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">
                  Review
                </TableHead>
                <TableHead className="w-64 text-xs font-semibold text-gray-600">
                  Product
                </TableHead>
                <TableHead className="w-44 text-xs font-semibold text-gray-600">
                  Date
                </TableHead>
                <TableHead className="w-20 text-xs font-semibold text-gray-600 text-right">
                  Options
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-sm text-gray-500"
                  >
                    No records found!
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((rev) => (
                  <TableRow key={rev.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-sm text-gray-600 font-medium align-top py-4">
                      {String(rev.id).slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-800 align-top py-4">
                      {rev.user || "—"}
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-4 ${
                                i < (rev.rating || 0)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                          {rev.comment}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 align-top py-4">
                      {rev.productSlug ? (
                        <Link
                          href={`/products/${rev.productSlug}`}
                          className="hover:text-teal-600 hover:underline"
                        >
                          {rev.product}
                        </Link>
                      ) : (
                        <span>{rev.product}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap align-top py-4">
                      {rev.date || "—"}
                    </TableCell>
                    <TableCell className="align-top py-4 text-right">
                      <button
                        type="button"
                        disabled={deletingId === rev.id}
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-40 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Footer Count */}
          <div className="p-4 border-t border-gray-100 text-sm text-gray-600">
            Number of Entries: <span className="font-semibold text-gray-900">{reviews.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
