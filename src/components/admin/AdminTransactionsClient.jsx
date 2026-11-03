"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Eye, CheckCircle2, XCircle } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { formatPriceIDR } from "@/lib/utils";
import { approvePayout, rejectPayout } from "@/app/admin/actions";

const TYPE_LABELS = {
  deposit: "Deposit",
  withdraw: "Penarikan",
  purchase: "Pembelian",
  earning: "Penghasilan",
  payout: "Payout",
};

const STATUS_STYLES = {
  completed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-rose-100 text-rose-800",
};

export function AdminTransactionsClient({ initialTransactions = [] }) {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyKey, setBusyKey] = useState(null);

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const filtered = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (tx.user || "").toLowerCase().includes(q) ||
      (tx.username || "").toLowerCase().includes(q) ||
      (tx.method || "").toLowerCase().includes(q) ||
      (tx.description || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || tx.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const resolvePayout = async (tx, approve) => {
    const key = `${tx.id}:${approve ? "approve" : "reject"}`;
    if (busyKey) return;
    setBusyKey(key);
    const res = approve ? await approvePayout(tx.id) : await rejectPayout(tx.id);
    setBusyKey(null);
    if (res?.success) {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === tx.id
            ? { ...item, status: approve ? "completed" : "rejected" }
            : item
        )
      );
      toast.success(res.message);
    } else {
      toast.error(res?.error || "Gagal memproses payout");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Transactions</h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar riwayat transaksi dompet (top up, penarikan, pembelian, penghasilan)
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari user atau metode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            type="button"
            onClick={() => toast.success("Filter transaksi diterapkan")}
            className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-2xs transition-colors cursor-pointer"
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
                <th className="py-3 px-4 w-16 text-center">Id</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Jumlah (Rp)</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 px-4 text-center text-gray-400">
                    {transactions.length === 0
                      ? "Belum ada transaksi wallet di database."
                      : "Tidak ada transaksi yang cocok dengan filter."}
                  </td>
                </tr>
              )}
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">
                    {String(tx.id).slice(0, 8)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{tx.user}</span>
                      {tx.username ? (
                        <span className="text-[10px] text-gray-400">@{tx.username}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-700">
                    {TYPE_LABELS[tx.type] || tx.type}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {formatPriceIDR(tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{tx.method || "-"}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        STATUS_STYLES[tx.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{tx.timeAgo}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {tx.type === "withdraw" && tx.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => resolvePayout(tx, true)}
                            disabled={busyKey === `${tx.id}:approve`}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none"
                            title="Setujui penarikan"
                          >
                            <CheckCircle2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => resolvePayout(tx, false)}
                            disabled={busyKey === `${tx.id}:reject`}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none"
                            title="Tolak penarikan"
                          >
                            <XCircle className="size-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          toast.info(
                            tx.description
                              ? `Transaksi ${tx.id.slice(0, 8)}: ${tx.description}`
                              : `Transaksi ${tx.id.slice(0, 8)} senilai ${formatPriceIDR(tx.amount)}`
                          )
                        }
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>
            Menampilkan 1-{filtered.length} dari {transactions.length} transaksi
          </span>
          <div className="flex gap-1">
            <button type="button" className="px-2.5 py-1 border rounded bg-white text-gray-700 disabled:opacity-50 cursor-not-allowed" disabled>Previous</button>
            <button type="button" className="px-2.5 py-1 border rounded bg-blue-500 text-white font-medium cursor-pointer">1</button>
            <button
              type="button"
              onClick={() => toast.info("Halaman terakhir")}
              className="px-2.5 py-1 border rounded bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
