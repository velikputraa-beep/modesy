"use client";

import { useEffect, useState } from "react";
import { ChevronDown, FileText, Eye, CheckCircle2, XCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast-context";
import { formatPriceIDR } from "@/lib/utils";
import { updateOrderStatus, markOrderPaid } from "@/app/admin/actions";

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

function label(value) {
  if (!value) return "-";
  if (STATUS_LABELS[value]) return STATUS_LABELS[value];
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AdminOrdersClient({ initialOrders = [] }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [busyKey, setBusyKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (order.orderNumber || "").toLowerCase().includes(q) ||
      (order.buyer || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const runStatusChange = async (order, nextStatus) => {
    const key = `${order.id}:${nextStatus}`;
    if (busyKey) return;
    setBusyKey(key);
    const prev = orders;
    setOrders((cur) =>
      cur.map((item) =>
        item.id === order.id ? { ...item, status: nextStatus } : item
      )
    );
    const res = await updateOrderStatus(order.id, nextStatus);
    setBusyKey(null);
    if (res?.success) {
      toast.success(res.message);
    } else {
      setOrders(prev);
      toast.error(res?.error || "Gagal mengubah status pesanan");
    }
  };

  const runMarkPaid = async (order) => {
    const key = `${order.id}:paid`;
    if (busyKey) return;
    setBusyKey(key);
    const prev = orders;
    setOrders((cur) =>
      cur.map((item) =>
        item.id === order.id ? { ...item, paymentStatus: "paid" } : item
      )
    );
    const res = await markOrderPaid(order.id);
    setBusyKey(null);
    if (res?.success) {
      toast.success(res.message);
    } else {
      setOrders(prev);
      toast.error(res?.error || "Gagal menandai pembayaran");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Orders</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Show</label>
            <select className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700">
              <option>15</option>
              <option>30</option>
              <option>50</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700"
            >
              <option value="All">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Payment Status</label>
            <select className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700">
              <option>All</option>
              <option>Pending Payment</option>
              <option>Payment Received</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-3">
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Order Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-800"
              />
              <button
                type="button"
                onClick={() => toast.success("Order filter applied")}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-1.5 rounded text-xs font-semibold shrink-0 cursor-pointer"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-700 font-semibold text-[11px]">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Buyer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Items</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3">Updated</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-400">
                    {orders.length === 0
                      ? "Belum ada pesanan di database."
                      : "Tidak ada pesanan yang cocok dengan filter."}
                  </td>
                </tr>
              )}
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3 font-bold text-gray-900">{o.orderNumber}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{o.buyer}</span>
                      {o.buyerUsername ? (
                        <span className="text-[10px] text-gray-400">@{o.buyerUsername}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-3 font-bold text-gray-900">{formatPriceIDR(o.total)}</td>
                  <td className="p-3 text-gray-600 font-medium">{o.itemCount} item</td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-gray-100 text-gray-700">
                      {label(o.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <p className="text-gray-700 font-medium">{label(o.paymentStatus)}</p>
                      {o.paymentStatus !== "paid" && (
                        <button
                          type="button"
                          onClick={() => runMarkPaid(o)}
                          disabled={busyKey === `${o.id}:paid`}
                          className="inline-flex items-center gap-1 text-[11px] text-gray-600 border border-gray-200 hover:bg-gray-50 px-2 py-0.5 rounded cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <FileText className="size-3 text-gray-500" />
                          <span>
                            {busyKey === `${o.id}:paid` ? "Memproses..." : "Tandai Lunas"}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-gray-500">{o.timeAgo}</td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">{o.date}</td>
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-xs transition-colors cursor-pointer focus:outline-none">
                        <span>Select an option</span>
                        <ChevronDown className="size-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 p-1 text-xs">
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info(
                              `Pesanan ${o.orderNumber}: ${o.itemCount} item, total ${formatPriceIDR(o.total)}`
                            )
                          }
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="size-3.5 text-gray-500" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        {o.status !== "completed" && (
                          <DropdownMenuItem
                            data-disabled={busyKey === `${o.id}:completed` ? "true" : undefined}
                            onClick={() => runStatusChange(o, "completed")}
                            className="flex items-center gap-2 text-emerald-600 cursor-pointer"
                          >
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            <span>
                              {busyKey === `${o.id}:completed` ? "Memproses..." : "Mark Completed"}
                            </span>
                          </DropdownMenuItem>
                        )}
                        {o.status !== "cancelled" && (
                          <DropdownMenuItem
                            data-disabled={busyKey === `${o.id}:cancelled` ? "true" : undefined}
                            onClick={() => runStatusChange(o, "cancelled")}
                            className="flex items-center gap-2 text-red-600 cursor-pointer"
                          >
                            <XCircle className="size-3.5 text-red-600" />
                            <span>
                              {busyKey === `${o.id}:cancelled` ? "Memproses..." : "Cancel Order"}
                            </span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
          <div>
            Showing 1 to {filteredOrders.length} of {filteredOrders.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                currentPage === 1
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 hover:bg-white text-gray-700"
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                currentPage === 2
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 hover:bg-white text-gray-700"
              }`}
            >
              2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
