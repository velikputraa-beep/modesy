"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { formatPriceIDR } from "@/lib/utils";
import { markOrderPaid } from "@/app/admin/actions";

export function AdminBankTransferClient({ initialOrders = [] }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleMarkPaid = async (order) => {
    if (busyId) return;
    setBusyId(order.id);
    const res = await markOrderPaid(order.id);
    setBusyId(null);
    if (res?.success) {
      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id ? { ...item, paymentStatus: "paid" } : item
        )
      );
      toast.success(res.message);
    } else {
      toast.error(res?.error || "Gagal menandai pembayaran");
    }
  };

  const rows = orders || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Bank Transfer Reports</h1>
        <p className="text-xs text-gray-500 mt-1">
          Pesanan dengan metode pembayaran transfer bank manual beserta konfirmasi admin
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Transfer Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-36 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    Belum ada pesanan dengan metode transfer bank.
                  </td>
                </tr>
              )}
              {rows.map((o, idx) => (
                <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{o.orderNumber}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{o.buyer}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(o.total)}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                        o.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.paymentStatus || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{o.date}</td>
                  <td className="py-3 px-4 text-right">
                    {o.paymentStatus !== "paid" ? (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(o)}
                        disabled={busyId === o.id}
                        className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium px-2 py-1 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <Check className="size-3" />
                        {busyId === o.id ? "Memproses..." : "Tandai Lunas"}
                      </button>
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
