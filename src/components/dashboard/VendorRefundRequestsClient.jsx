"use client";

import { useState, useTransition } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";
import { updateSellerRefundAction } from "@/app/dashboard/refund-requests/actions";

const money = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

export function VendorRefundRequestsClient({ refunds }) {
  const { toast } = useToast();
  const [selected, setSelected] = useState(null);
  const [pending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState({});

  const rows = refunds.map((r) => {
    const patch = localStatus[r.id];
    return patch ? { ...r, status: patch.status, statusLabel: patch.label } : r;
  });

  const changeStatus = (row, status, label) => {
    startTransition(async () => {
      const result = await updateSellerRefundAction({ id: row.id, status });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setLocalStatus((prev) => ({ ...prev, [row.id]: { status, label } }));
      setSelected((prev) => (prev && prev.id === row.id ? { ...prev, status, statusLabel: label } : prev));
      toast.success(result.message);
    });
  };

  return (
    <div className="space-y-6">
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="bg-white max-w-md w-full p-6 space-y-4 shadow-2xl rounded-lg">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Refund Request Details</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Product:</span>
                <span className="font-semibold text-gray-900">{selected.productName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Order:</span>
                <span className="font-semibold text-gray-900">{selected.orderNumber || "-"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Buyer:</span>
                <span className="font-semibold text-blue-600">{selected.buyer}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Total:</span>
                <span className="font-bold text-teal-600">{money(selected.total)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-800">
                  {selected.statusLabel}
                </span>
              </div>
              <div className="py-1 border-b border-gray-50">
                <span className="text-gray-500 block mb-1">Alasan:</span>
                <span className="text-gray-800">{selected.reason || "-"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium text-gray-700">{selected.date}</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <Button
                type="button"
                disabled={pending}
                onClick={() => changeStatus(selected, "approved", "Approved")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 disabled:opacity-60"
              >
                Approve
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={() => changeStatus(selected, "processing", "Processing")}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 disabled:opacity-60"
              >
                Processing
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={() => changeStatus(selected, "rejected", "Rejected")}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 disabled:opacity-60"
              >
                Reject
              </Button>
              <Button
                type="button"
                onClick={() => setSelected(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-4 py-1.5"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Refund Requests</h1>

      <Card className="border border-gray-200 bg-white rounded-lg p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] font-semibold text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-900">
                    {r.orderNumber} - {r.productName}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900">{money(r.total)}</td>
                  <td className="px-4 py-3.5 font-semibold text-blue-600">{r.buyer}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-800">
                      {r.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{r.daysAgo} days ago</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors shadow-xs cursor-pointer"
                    >
                      <Info className="size-3 text-gray-500" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Belum ada pengajuan refund untuk toko Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
          Number of Entries: <span className="font-semibold text-gray-800">{rows.length}</span>
        </div>
      </Card>
    </div>
  );
}
