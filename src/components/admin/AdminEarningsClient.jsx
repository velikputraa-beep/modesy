"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceIDR } from "@/lib/utils";

import { TrendingUp, Wallet } from "lucide-react";

function formatDate(row) {
  if (row.createdAt) return String(row.createdAt).slice(0, 16).replace("T", " ");
  return row.timeAgo || "-";
}

export function AdminEarningsClient({ initialEarnings = [] }) {
  const [earnings, setEarnings] = useState(initialEarnings);

  useEffect(() => {
    setEarnings(initialEarnings);
  }, [initialEarnings]);

  const rows = earnings || [];
  const totalEarnings = rows.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Earnings</h1>
        <p className="text-xs text-gray-500 mt-1">
          Riwayat pendapatan seller (tipe transaksi wallet &quot;earning&quot;) dari penjualan
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Total Seller Earnings</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatPriceIDR(totalEarnings)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <TrendingUp className="size-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Total Earning Transactions</p>
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
          Earnings Breakdown
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 font-bold">Earning Amount</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-gray-500">
                    Belum ada transaksi earning di database.
                  </td>
                </tr>
              ) : (
                rows.map((e, idx) => (
                  <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {e.username ? (
                        <Link
                          href={`/profile/${e.username}`}
                          className="hover:text-teal-600 transition-colors"
                        >
                          {e.user}
                        </Link>
                      ) : (
                        e.user
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{e.description || "-"}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      +{formatPriceIDR(e.amount)}
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDate(e)}</td>
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
