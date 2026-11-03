"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Info,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
} from "lucide-react";
import { formatPriceIDR } from "@/lib/utils";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";

// Status yang dianggap "aktif" berdasarkan statusKey dari Supabase
const ACTIVE_STATUS_KEYS = ["pending", "processing", "shipped"];

export function SalesTable({ title = "Sales", statusFilter = "all", showStats = false, sales = [] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);

  const pageSize = 15;

  // Statistik dihitung dari data real (hanya untuk halaman dengan showStats)
  const statCounts = {
    total: sales.length,
    active: sales.filter((s) => ACTIVE_STATUS_KEYS.includes(s.statusKey)).length,
    completed: sales.filter((s) => s.statusKey === "completed").length,
    cancelled: sales.filter((s) => s.statusKey === "cancelled").length,
  };

  // Filter sales list
  const filteredSales = sales.filter((sale) => {
    if (statusFilter !== "all") {
      if (statusFilter === "active" && !ACTIVE_STATUS_KEYS.includes(sale.statusKey)) return false;
      if (statusFilter === "completed" && sale.statusKey !== "completed") return false;
      if (statusFilter === "cancelled" && sale.statusKey !== "cancelled") return false;
    }
    if (paymentStatusFilter !== "all") {
      if (sale.paymentKey !== paymentStatusFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (
        !String(sale.orderNumber || "").toLowerCase().includes(q) &&
        !String(sale.customer || "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedSales = filteredSales.slice((safePage - 1) * pageSize, safePage * pageSize);

  const getStatusBadge = (statusKey) => {
    switch (statusKey) {
      case "processing":
        return "bg-teal-500 text-white";
      case "completed":
        return "bg-emerald-600 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Detail Dialog Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="bg-white max-w-md w-full p-6 space-y-4 shadow-2xl rounded-lg">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">
                Sale Details ({selectedSale.orderNumber})
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Customer:</span>
                <span className="font-semibold text-gray-900">{selectedSale.customer || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Product:</span>
                <span className="font-semibold text-gray-900">{selectedSale.product || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Total:</span>
                <span className="font-bold text-teal-600">{formatPriceIDR(selectedSale.total)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadge(selectedSale.statusKey)}`}>
                  {selectedSale.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Payment:</span>
                <span className="font-medium text-gray-700">{selectedSale.paymentStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium text-gray-700">{selectedSale.date || "—"}</span>
              </div>

              {/* Item-item order (real data order_items) */}
              {selectedSale.items && selectedSale.items.length > 0 && (
                <div className="pt-2">
                  <p className="text-gray-500 font-semibold mb-1.5">Items:</p>
                  <div className="space-y-1">
                    {selectedSale.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between py-1 border-b border-gray-50"
                      >
                        <span className="text-gray-700 min-w-0 truncate max-w-[220px]">
                          {item.title}
                          <span className="text-gray-400"> × {item.quantity}</span>
                        </span>
                        <span className="font-medium text-gray-800 whitespace-nowrap">
                          {formatPriceIDR(item.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-4 py-1.5"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">
        {title}
      </h1>

      {/* Optional Stat Cards on /sales */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-gray-200 border-l-4 border-l-blue-500">
            <div className="text-2xl font-bold text-gray-900">{statCounts.total}</div>
            <div className="text-xs text-gray-500 mt-1">Total Sales</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 border-l-4 border-l-teal-500">
            <div className="text-2xl font-bold text-gray-900">
              {statCounts.active}
            </div>
            <div className="text-xs text-gray-500 mt-1">Active Sales</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 border-l-4 border-l-emerald-600">
            <div className="text-2xl font-bold text-gray-900">
              {statCounts.completed}
            </div>
            <div className="text-xs text-gray-500 mt-1">Completed Sales</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 border-l-4 border-l-red-500">
            <div className="text-2xl font-bold text-gray-900">
              {statCounts.cancelled}
            </div>
            <div className="text-xs text-gray-500 mt-1">Cancelled Sales</div>
          </Card>
        </div>
      )}

      {/* Main Table Card */}
      <Card className="border border-gray-200 bg-white rounded-lg p-5 shadow-xs space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 text-xs">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500 min-w-[140px]"
            >
              <option value="all">All</option>
              <option value="pending">Pending Payment</option>
              <option value="paid">Payment Received</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Sale Id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500 min-w-[180px]"
            />
          </div>

          <Button
            type="button"
            onClick={() => {
              router.refresh();
              toast("Filter diterapkan otomatis; data penjualan dimuat ulang");
            }}
            className="h-9 px-4 bg-[#5b5fe4] hover:bg-[#4d51cb] text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer gap-1"
          >
            <Filter className="size-3.5" />
            <span>Filter</span>
          </Button>

          <Button
            type="button"
            onClick={() => {
              toast("Ekspor CSV belum tersedia di versi Supabase");
            }}
            variant="outline"
            className="h-9 px-3 text-gray-700 border-gray-300 hover:bg-gray-50 text-xs font-semibold rounded-md shadow-xs cursor-pointer gap-1"
          >
            <Download className="size-3.5" />
            <span>Export</span>
          </Button>
        </div>

        {/* Table Sales */}
        <div className="overflow-x-auto border-t border-gray-100 pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] font-semibold text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Sale</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {pagedSales.length > 0 ? (
                pagedSales.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-900">
                      {s.orderNumber}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      {formatPriceIDR(s.total)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {s.paymentStatus}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${getStatusBadge(s.statusKey)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {s.date || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSale(s)}
                        className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors shadow-xs cursor-pointer"
                      >
                        <Info className="size-3 text-gray-500" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400">
                    {sales.length === 0
                      ? "No sales found!"
                      : "No sales match the current filters!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Count & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div>
            Number of Entries:{" "}
            <span className="font-semibold text-gray-800">
              {filteredSales.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`size-7 rounded font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                    safePage === page
                      ? "bg-teal-600 text-white shadow-xs"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
