"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Trash2 } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { approveComment, deleteComment } from "@/app/admin/actions";

export function AdminProductCommentsClient({ initialComments = [] }) {
  const { toast } = useToast();
  const [comments, setComments] = useState(initialComments);
  const [busyKey, setBusyKey] = useState(null);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleApprove = async (id) => {
    if (busyKey) return;
    setBusyKey(`approve:${id}`);
    const res = await approveComment(id);
    setBusyKey(null);
    if (res?.success) {
      toast.success(res.message);
    } else {
      toast.error(res?.error || "Gagal menyetujui komentar");
    }
  };

  const handleDelete = async (id) => {
    if (busyKey) return;
    setBusyKey(`del:${id}`);
    const res = await deleteComment(id);
    setBusyKey(null);
    if (res?.success) {
      toast.success(res.message);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } else {
      toast.error(res?.error || "Gagal menghapus komentar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Product Comments</h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar diskusi dan pertanyaan produk yang diposting oleh calon pembeli di halaman listing
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
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Comment Text</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-gray-500">
                    Belum ada komentar produk di database.
                  </td>
                </tr>
              ) : (
                comments.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      {c.username ? (
                        <Link
                          href={`/profile/${c.username}`}
                          className="font-semibold text-gray-900 hover:text-teal-600 transition-colors"
                        >
                          {c.name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-gray-900">{c.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-blue-600 max-w-[180px] truncate">
                      {c.productSlug ? (
                        <Link href={`/products/${c.productSlug}`} className="hover:underline">
                          {c.productTitle}
                        </Link>
                      ) : (
                        c.productTitle
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700 max-w-sm">{c.comment}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        Published
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{c.date}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApprove(c.id)}
                          disabled={busyKey === `approve:${c.id}`}
                          className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <Check className="size-3" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          disabled={busyKey === `del:${c.id}`}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none"
                          title="Hapus Komentar"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
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
