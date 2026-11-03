"use client";

import Link from "next/link";
import { formatPriceIDR } from "@/lib/utils";

import { CreditCard, DollarSign, Clock, RefreshCw } from "lucide-react";

function norm(value) {
  return String(value || "").toLowerCase();
}

function formatDate(row) {
  if (row.createdAt) return String(row.createdAt).slice(0, 16).replace("T", " ");
  return row.timeAgo || "-";
}

function statusClass(status) {
  const s = norm(status);
  if (s === "completed" || s === "succeeded" || s === "paid")
    return "bg-emerald-100 text-emerald-800";
  if (s === "pending" || s === "processing") return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

export function AdminPaymentsClient({ initialOrders = [], initialTransactions = [] }) {
  const orders = initialOrders || [];
  const transactions = initialTransactions || [];

  const paidOrders = orders.filter((o) => norm(o.paymentStatus) === "paid");
  const totalRevenue = paidOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const pendingCount = orders.filter((o) => norm(o.paymentStatus) === "pending").length;
  const refundedCount = orders.filter((o) => norm(o.paymentStatus) === "refunded").length;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Payments Overview</h1>
        <p className="text-xs text-gray-500 mt-1">
          Ringkasan seluruh arus kas pembayaran masuk dan gateway billing Modesy
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatPriceIDR(totalRevenue)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign className="size-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{paidOrders.length} Transaksi</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <CreditCard className="size-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Pending Payment</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount} Pesanan</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="size-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Refunded</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{refundedCount} Pesanan</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <RefreshCw className="size-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/payments/wallet-deposits"
          className="p-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 text-center transition-all shadow-2xs"
        >
          Wallet Deposits →
        </Link>
        <Link
          href="/admin/payments/bank-transfer"
          className="p-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 text-center transition-all shadow-2xs"
        >
          Bank Transfer Reports →
        </Link>
        <Link
          href="/admin/refund-requests"
          className="p-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 text-center transition-all shadow-2xs"
        >
          Refund Requests →
        </Link>
        <Link
          href="/admin/payouts"
          className="p-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 text-center transition-all shadow-2xs"
        >
          Payouts →
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 font-semibold text-xs text-gray-700">
          Recent Wallet Transactions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-14 text-center">No</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    Belum ada transaksi wallet di database.
                  </td>
                </tr>
              )}
              {transactions.map((t, idx) => (
                <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-800 capitalize">
                    {t.type || "-"}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{t.method || "-"}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(t.amount)}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusClass(
                        t.status
                      )}`}
                    >
                      {t.status || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{t.user || "-"}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDate(t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
