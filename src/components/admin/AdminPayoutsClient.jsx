"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceIDR } from "@/lib/utils";

import { Wallet, Clock, CheckCircle2, Plus } from "lucide-react";

function normStatus(status) {
  return String(status || "").toLowerCase();
}

function formatDate(row) {
  if (row.createdAt) return String(row.createdAt).slice(0, 16).replace("T", " ");
  return row.timeAgo || "-";
}

export function AdminPayoutsClient({ initialPayouts = [] }) {
  const [payouts, setPayouts] = useState(initialPayouts);

  useEffect(() => {
    setPayouts(initialPayouts);
  }, [initialPayouts]);

  const rows = payouts || [];
  const completedSum = rows
    .filter((p) => normStatus(p.status) === "completed")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const pendingSum = rows
    .filter((p) => normStatus(p.status) === "pending")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Payouts</h1>
          <p className="text-xs text-gray-500 mt-1">
            Ringkasan dan manajemen penarikan saldo pendapatan para vendor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/payouts/add"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors"
          >
            <Plus className="size-3.5" />
            + Add Payout
          </Link>
          <Link
            href="/admin/payouts/settings"
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded shadow-2xs transition-colors"
          >
            Payout Settings
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Total Completed Payouts</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatPriceIDR(completedSum)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Pending Requests</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{formatPriceIDR(pendingSum)}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="size-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Total Requests Count</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{rows.length}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Wallet className="size-6" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 font-semibold text-xs text-gray-700">
          Recent Payout Transactions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Seller Store</th>
                <th className="py-3 px-4">Payout Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-gray-500">
                    Belum ada transaksi payout di database.
                  </td>
                </tr>
              ) : (
                rows.map((p, idx) => {
                  const s = normStatus(p.status);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{p.user}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(p.amount)}</td>
                      <td className="py-3 px-4 text-gray-700">{p.method || "-"}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                            s === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : s === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDate(p)}</td>
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
