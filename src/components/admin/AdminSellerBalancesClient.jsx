"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceIDR } from "@/lib/utils";

import { useToast } from "@/components/ui/toast-context";
import { Eye } from "lucide-react";

function formatDate(updatedAt) {
  if (updatedAt) return String(updatedAt).slice(0, 16).replace("T", " ");
  return "-";
}

export function AdminSellerBalancesClient({ initialBalances = [] }) {
  const { toast } = useToast();
  const [balances, setBalances] = useState(initialBalances);

  useEffect(() => {
    setBalances(initialBalances);
  }, [initialBalances]);

  const rows = balances || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Seller Balances</h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar saldo dompet penjual (seller balance) yang tersimpan di database
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4 font-bold text-gray-800">Available Balance</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-gray-500">
                    Belum ada data saldo wallet di database.
                  </td>
                </tr>
              ) : (
                rows.map((b, idx) => (
                  <tr key={b.userId ?? idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {b.username ? (
                        <Link
                          href={`/profile/${b.username}`}
                          className="hover:text-teal-600 transition-colors"
                        >
                          {b.name}
                        </Link>
                      ) : (
                        b.name
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 text-sm">
                      {formatPriceIDR(b.balance)}
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDate(b.updatedAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toast.info(`Rincian saldo penjual ${b.name} belum tersedia`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Lihat Detail Saldo"
                      >
                        <Eye className="size-3.5" />
                      </button>
                    </td>
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
