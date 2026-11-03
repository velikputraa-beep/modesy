"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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
import { deleteComment } from "@/app/dashboard/actions";

export function DashboardCommentsClient({ comments = [] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;
    if (deletingId) return;
    setDeletingId(id);
    const result = await deleteComment(id);
    setDeletingId(null);
    if (result?.success) {
      toast.success(result.message || "Komentar berhasil dihapus");
      router.refresh();
    } else {
      toast.error(result?.error || "Gagal menghapus komentar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Card */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-800">
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-16 text-xs font-semibold text-gray-600">
                  Id
                </TableHead>
                <TableHead className="w-36 text-xs font-semibold text-gray-600">
                  Username
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">
                  Comment
                </TableHead>
                <TableHead className="w-64 text-xs font-semibold text-gray-600">
                  Product
                </TableHead>
                <TableHead className="w-40 text-xs font-semibold text-gray-600">
                  Date
                </TableHead>
                <TableHead className="w-20 text-xs font-semibold text-gray-600 text-right">
                  Options
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-sm text-gray-500"
                  >
                    No records found!
                  </TableCell>
                </TableRow>
              ) : (
                comments.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-sm text-gray-600">
                      {String(item.id).slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-800">
                      {item.user || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {item.comment}
                    </TableCell>
                    <TableCell className="text-sm text-teal-600 hover:underline cursor-pointer">
                      {item.productSlug ? (
                        <Link href={`/products/${item.productSlug}`}>
                          {item.product}
                        </Link>
                      ) : (
                        item.product
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {item.date || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
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
            Number of Entries:{" "}
            <span className="font-semibold text-gray-900">{comments.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
