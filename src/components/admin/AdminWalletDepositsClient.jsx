"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceIDR } from "@/lib/utils";

import { Eye, EyeOff, Trash2 } from "lucide-react";

function normStatus(status) {
  return String(status || "").toLowerCase();
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 16).replace("T", " ");
}

export function AdminWalletDepositsClient({ initialDeposits = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setExpandedId(null);
  }, [initialDeposits]);

  const rows = initialDeposits || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Wallet Deposits</h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar riwayat deposit saldo dompet (wallet) oleh member dan vendor, dibaca langsung dari
          tabel wallet_transactions
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Deposit Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-24 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-gray-500">
                    Belum ada riwayat deposit wallet di database.
                  </td>
                </tr>
              ) : (
                rows.map((d, idx) => {
                  const s = normStatus(d.status);
                  const open = expandedId === d.id;
                  return (
                    <Fragment key={d.id}>
                      <tr className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{d.method || "-"}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(d.amount)}</td>
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
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {d.username ? (
                            <Link
                              href={`/profile/${d.username}`}
                              className="hover:text-teal-600 transition-colors"
                            >
                              {d.user}
                            </Link>
                          ) : (
                            d.user
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {formatDate(d.createdAt || d.timeAgo)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setExpandedId(open ? null : d.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title={open ? "Sembunyikan detail" : "Lihat detail"}
                            >
                              {open ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            </button>
                            <button
                              type="button"
                              disabled
                              title="Segera hadir: penghapusan riwayat transaksi wallet dinonaktifkan agar audit trail tetap utuh"
                              className="p-1.5 text-gray-300 rounded cursor-not-allowed"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {open && (
                        <tr key={`${d.id}-detail`} className="bg-gray-50/70">
                          <td colSpan={7} className="px-4 py-3">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                              <div>
                                <dt className="text-gray-500 uppercase font-semibold">Transaction ID</dt>
                                <dd className="font-mono text-gray-800 mt-0.5 break-all">{d.id}</dd>
                              </div>
                              <div>
                                <dt className="text-gray-500 uppercase font-semibold">Tipe</dt>
                                <dd className="text-gray-800 mt-0.5 capitalize">{d.type || "deposit"}</dd>
                              </div>
                              <div>
                                <dt className="text-gray-500 uppercase font-semibold">Metode</dt>
                                <dd className="text-gray-800 mt-0.5">{d.method || "tidak tercatat"}</dd>
                              </div>
                              <div>
                                <dt className="text-gray-500 uppercase font-semibold">Jumlah</dt>
                                <dd className="text-gray-800 mt-0.5 font-semibold">{formatPriceIDR(d.amount)}</dd>
                              </div>
                              <div className="sm:col-span-2 lg:col-span-4">
                                <dt className="text-gray-500 uppercase font-semibold">Deskripsi</dt>
                                <dd className="text-gray-800 mt-0.5">
                                  {d.description || "Tidak ada deskripsi tersimpan di database."}
                                </dd>
                              </div>
                            </dl>
                            <p className="text-[11px] text-gray-500 mt-3">
                              Bukti transfer (file gambar) tidak punya kolom di wallet_transactions, jadi
                              tidak bisa ditampilkan di sini. Persetujuan/penolakan manual juga belum
                              tersedia untuk deposit.
                            </p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
