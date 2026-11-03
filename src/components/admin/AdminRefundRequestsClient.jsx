"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { formatPriceIDR } from "@/lib/utils";
import { approveRefund, rejectRefund } from "@/app/admin/actions";

export function AdminRefundRequestsClient({ initialOrders = [] }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleApprove = async (order) => {
    if (busyId) return;
    setBusyId(order.id);
    const res = await approveRefund(order.id);
    setBusyId(null);
    if (res?.success) {
      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id ? { ...item, paymentStatus: "refunded" } : item
        )
      );
      toast.success(res.message);
    } else {
      toast.error(res?.error || "Gagal menyetujui refund");
    }
  };

  const handleReject = async (order) => {
    if (busyId) return;
    setBusyId(order.id);
    const res = await rejectRefund(order.id);
    setBusyId(null);
    if (res?.success) {
      setOrders((prev) => prev.filter((item) => item.id !== order.id));
      toast.success(res.message);
    } else {
      toast.error(res?.error || "Gagal menolak refund");
    }
  };

  const rows = orders || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Refund Requests</h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar pengajuan pengembalian dana dari pembeli beserta status resolusinya
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">No</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Order#</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-36 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    Tidak ada permintaan refund saat ini.
                  </td>
                </tr>
              )}
              {rows.map((r, idx) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{r.buyer}</td>
                  <td className="py-3 px-4 font-medium text-blue-600">{r.orderNumber}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(r.total)}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        r.paymentStatus === "refunded"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.paymentStatus === "refunded" ? "Refunded" : "Pending"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{r.date}</td>
                  <td className="py-3 px-4 text-right">
                    {r.paymentStatus !== "refunded" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApprove(r)}
                          disabled={busyId === r.id}
                          className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium px-2.5 py-1 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <Check className="size-3" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(r)}
                          disabled={busyId === r.id}
                          className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-medium px-2.5 py-1 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <X className="size-3" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">Diselesaikan</span>
                    )}
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
