"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Trash2, Ban } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

export function AdminBlogCommentsClient({ initialComments = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [comments, setComments] = useState(initialComments);
  const [busyKey, setBusyKey] = useState(null);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const patchRow = (id, status) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const handleStatusUpdate = async (id, status, label, fallback) => {
    if (busyKey) return;
    setBusyKey(`${status}:${id}`);
    const res = await cmsUpdate("blog_comments", id, { status });
    setBusyKey(null);

    if (res?.success) {
      patchRow(id, label);
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || fallback);
    }
  };

  const handleApprove = (id) =>
    handleStatusUpdate(id, "approved", "Approved", "Gagal menyetujui komentar");

  const handleSpam = (id) => handleStatusUpdate(id, "spam", "Spam", "Gagal menandai spam");

  const handleDelete = async (id) => {
    if (busyKey) return;
    setBusyKey(`del:${id}`);
    const res = await cmsDelete("blog_comments", id);
    setBusyKey(null);

    if (res?.success) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus komentar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Blog Comments</h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar tanggapan dan komentar pembaca pada artikel blog editorial Modesy
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
                <th className="py-3 px-4">Article Post</th>
                <th className="py-3 px-4">Comment Text</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{c.id}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/profile/${
                        c.username ||
                        (c.user.toLowerCase().includes("budi")
                          ? "budi-santoso"
                          : c.user.toLowerCase().includes("daniel")
                            ? "daniel-jones"
                            : c.user.toLowerCase().includes("admin")
                              ? "admin"
                              : c.user.toLowerCase().replace(/\s+/g, "-"))
                      }`}
                      className="font-semibold text-gray-900 hover:text-teal-600 transition-colors"
                    >
                      {c.user}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-medium text-blue-600 max-w-[200px] truncate">{c.post}</td>
                  <td className="py-3 px-4 text-gray-700 max-w-sm">{c.comment}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        c.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{c.date}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(c.id)}
                            disabled={busyKey === `approved:${c.id}`}
                            className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <Check className="size-3" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSpam(c.id)}
                            disabled={busyKey === `spam:${c.id}`}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                            title="Tandai Spam"
                          >
                            <Ban className="size-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        disabled={busyKey === `del:${c.id}`}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        title="Hapus Komentar"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
