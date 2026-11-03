"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, Edit2, Check, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

const STATUS_BY_LABEL = {
  Pending: "pending",
  Responded: "accepted",
  Rejected: "rejected",
  Closed: "cancelled",
};

const LABEL_BY_STATUS = {
  new: "Pending",
  pending: "Pending",
  accepted: "Responded",
  rejected: "Rejected",
  cancelled: "Closed",
};

export function AdminQuoteRequestsClient({ initialQuotes = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [quotes, setQuotes] = useState(initialQuotes);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ message: "", quantity: "", status: "pending" });
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setQuotes(initialQuotes);
  }, [initialQuotes]);

  const handleStatusUpdate = async (quote, status) => {
    if (busyId) return;
    setBusyId(quote.id);
    const res = await cmsUpdate("quote_requests", quote.id, { status });
    setBusyId(null);

    if (res?.success) {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quote.id ? { ...q, status: LABEL_BY_STATUS[status] || q.status } : q
        )
      );
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal memperbarui status quote");
    }
  };

  const openEdit = (quote) => {
    setEditingId(quote.id);
    setForm({
      message: quote.message || "",
      quantity: quote.quantity ?? "",
      status: quote.statusKey || STATUS_BY_LABEL[quote.status] || "pending",
    });
    setIsEditOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await cmsUpdate("quote_requests", editingId, {
      message: form.message,
      quantity: String(form.quantity).trim() === "" ? "" : Number(form.quantity),
      status: form.status,
    });
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsEditOpen(false);
      setEditingId(null);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan quote request");
    }
  };

  const handleDelete = async (quote) => {
    if (!confirm(`Hapus penawaran dari ${quote.buyer}?`)) return;
    const res = await cmsDelete("quote_requests", quote.id);
    if (res?.success) {
      setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus penawaran");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Quote Requests</h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar permintaan negosiasi harga penawaran khusus dari calon pembeli
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Id</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{String(q.id).slice(0, 8)}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{q.buyer}</td>
                  <td className="py-3 px-4 text-gray-800 max-w-[200px] truncate">{q.product}</td>
                  <td className="py-3 px-4 text-gray-500 max-w-[260px] truncate">{q.message}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        q.status === "Responded"
                          ? "bg-blue-100 text-blue-800"
                          : q.status === "Closed"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{q.date}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {q.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            disabled={busyId === q.id}
                            onClick={() => handleStatusUpdate(q, "accepted")}
                            className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                            title="Accept / Respond"
                          >
                            <Check className="size-3" />
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={busyId === q.id}
                            onClick={() => handleStatusUpdate(q, "rejected")}
                            className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-medium px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                            title="Reject"
                          >
                            <X className="size-3" />
                            Reject
                          </button>
                        </>
                      )}
                      {q.status !== "Closed" && q.status !== "Rejected" && (
                        <button
                          type="button"
                          disabled={busyId === q.id}
                          onClick={() => handleStatusUpdate(q, "cancelled")}
                          className="inline-flex items-center gap-1 bg-slate-500 hover:bg-slate-600 text-white text-[11px] font-medium px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                          title="Close"
                        >
                          Close
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          toast.info(`Detail quote #${String(q.id).slice(0, 8)}`);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Lihat Detail"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(q)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit Quote"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(q)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Hapus"
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

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-800">Edit Quote Request</h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (Opsional)</label>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="new">Pending (new)</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Responded</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Closed</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Menyimpan..." : "Update Quote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
