"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceIDR } from "@/lib/utils";

import { FileCode, Info } from "lucide-react";

export function AdminDigitalSalesClient({ initialSales = [] }) {
  const [sales, setSales] = useState(initialSales);

  useEffect(() => {
    setSales(initialSales);
  }, [initialSales]);

  const rows = sales || [];
  const totalSold = rows.reduce((acc, curr) => acc + Number(curr.lineTotal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">
          Penjualan Produk Digital — belum dapat dibedakan dari data
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Tabel produk tidak punya penanda digital/fisik, jadi daftar di bawah adalah seluruh
          item pesanan yang tersimpan di database
        </p>
      </div>

      {/* Catatan honesty */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <Info className="size-4 shrink-0 mt-0.5" />
        <span>
          Log pengunduhan aset dan jumlah download tidak tersedia di schema Supabase, jadi kolom
          tersebut dihapus. Nilai total di bawah mencakup semua produk, bukan hanya produk digital.
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Nilai Item Pesanan</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatPriceIDR(totalSold)}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase">Jumlah Baris Item</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{rows.length}</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Id</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-gray-500">
                    Belum ada item pesanan di database.
                  </td>
                </tr>
              ) : (
                rows.map((s, idx) => (
                  <tr key={s.key ?? `${s.orderId}-${idx}`} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <FileCode className="size-4 text-blue-500 shrink-0" />
                        <span>{s.product || "-"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {s.buyerUsername ? (
                        <Link
                          href={`/profile/${s.buyerUsername}`}
                          className="hover:text-teal-600 transition-colors"
                        >
                          {s.buyer}
                        </Link>
                      ) : (
                        s.buyer
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {formatPriceIDR(s.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
                        {s.quantity} pcs
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{s.orderNumber || "-"}</td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{s.date || "-"}</td>
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
