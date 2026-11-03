"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Eye, Filter } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";
import { formatPriceIDR } from "@/lib/utils";

export function AdminMembershipPaymentsClient({ initialPayments = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [payments, setPayments] = useState(initialPayments);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchId, setSearchId] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  const handleApprove = async (payment) => {
    if (busyId) return;
    setBusyId(payment.id);
    const res = await cmsUpdate("membership_payments", payment.id, { status: "completed" });
    setBusyId(null);

    if (res?.success) {
      setPayments((prev) =>
        prev.map((p) => (p.id === payment.id ? { ...p, status: "Completed" } : p))
      );
      toast.success(`Pembayaran ${payment.paymentId} berhasil disetujui (Approved)!`);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyetujui pembayaran");
    }
  };

  const handleDelete = async (payment) => {
    if (!confirm(`Hapus pembayaran ${payment.paymentId}?`)) return;
    const res = await cmsDelete("membership_payments", payment.id);
    if (res?.success) {
      setPayments((prev) => prev.filter((p) => p.id !== payment.id));
      toast.success(`Pembayaran ${payment.paymentId} berhasil dihapus`);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus pembayaran");
    }
  };

  const filtered = payments.filter((p) => {
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && p.status === "Pending") ||
      (statusFilter === "completed" && p.status === "Completed");
    const matchId =
      !searchId || p.paymentId.toLowerCase().includes(searchId.toLowerCase());
    return matchStatus && matchId;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Membership Payments</h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar pembayaran langganan membership plan oleh para vendor & member
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-600">Show:</span>
          <select className="text-xs border rounded-md px-2.5 py-1.5 bg-white text-gray-700 focus:outline-hidden">
            <option>15</option>
            <option>30</option>
            <option>50</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending Payment</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Payment Id..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => toast.info("Filter membership payments diterapkan")}
            className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded shadow-2xs transition-colors cursor-pointer"
          >
            <Filter className="size-3.5" />
            Filter
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Payment Id</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Payment Amount</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">IP</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-28 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-500">
                    Tidak ada data pembayaran membership.
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{p.id}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">{p.paymentId}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{p.method}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(p.amount)}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{p.user}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{p.plan}</td>
                  <td className="py-3 px-4 font-mono text-gray-400 text-[11px]">{p.ip}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{p.date}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.status === "Pending" && (
                        <button
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => handleApprove(p)}
                          className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                          title="Setujui Pembayaran"
                        >
                          <Check className="size-3" />
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toast.info(`Lihat invoice ${p.paymentId}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Record"
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
