"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceIDR } from "@/lib/utils";

import { useToast } from "@/components/ui/toast-context";
import { approvePayout, rejectPayout } from "@/app/admin/actions";

import { Check, X } from "lucide-react";

function normStatus(status) {
  return String(status || "").toLowerCase();
}

function formatDate(row) {
  if (row.createdAt) return String(row.createdAt).slice(0, 16).replace("T", " ");
  return row.timeAgo || "-";
}

export function AdminPayoutRequestsClient({ initialRequests = [] }) {
  const { toast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  const [busyKey, setBusyKey] = useState(null);

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  const rows = requests || [];

  const resolve = async (id, action) => {
    if (busyKey) return;
    setBusyKey(`${action}:${id}`);
    const res = action === "approve" ? await approvePayout(id) : await rejectPayout(id);
    setBusyKey(null);
    if (res?.success) {
      toast.success(res.message);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: action === "approve" ? "completed" : "rejected" } : r
        )
      );
    } else {
      toast.error(res?.error || "Gagal memproses pengajuan payout");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Payout Requests</h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar permohonan penarikan dana saldo hasil penjualan oleh vendor
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Seller Store</th>
                <th className="py-3 px-4">Amount Requested</th>
                <th className="py-3 px-4">Method / Account</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Request Date</th>
                <th className="py-3 px-4 w-36 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-gray-500">
                    Tidak ada pengajuan payout yang menunggu.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const s = normStatus(r.status);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {r.username ? (
                          <Link
                            href={`/profile/${r.username}`}
                            className="hover:text-teal-600 transition-colors"
                          >
                            {r.user}
                          </Link>
                        ) : (
                          r.user
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(r.amount)}</td>
                      <td className="py-3 px-4 text-gray-700">{r.method || "-"}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                            s === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : s === "rejected" || s === "failed"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDate(r)}</td>
                      <td className="py-3 px-4 text-right">
                        {s === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => resolve(r.id, "approve")}
                              disabled={busyKey !== null}
                              className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium px-2 py-1 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                            >
                              <Check className="size-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => resolve(r.id, "reject")}
                              disabled={busyKey !== null}
                              className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-medium px-2 py-1 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
