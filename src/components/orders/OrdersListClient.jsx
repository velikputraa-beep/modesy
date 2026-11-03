"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Eye, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPriceIDR } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export function OrdersListClient({ initialOrders = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState("");

  const totalPages = Math.ceil(initialOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = initialOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-lg shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-3">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3 text-gray-400" />
          <span className="text-gray-800">Orders</span>
        </nav>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          Orders
        </h1>

        {/* Orders List */}
        <div className="space-y-3">
          {currentOrders.map((order) => (
            <Card
              key={order.id}
              className="bg-white border border-gray-200/90 rounded-lg p-4 shadow-2xs hover:shadow-md hover:border-teal-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
                {/* Col 1: Order Number (col-span-3) */}
                <div className="col-span-12 sm:col-span-3 text-sm text-gray-700">
                  <span>Order: </span>
                  <strong className="font-semibold text-gray-900">
                    {order.orderNumber}
                  </strong>
                </div>

                {/* Col 2: Total (col-span-3) */}
                <div className="col-span-12 sm:col-span-3 text-sm text-gray-700">
                  <span>Total: </span>
                  <strong className="font-semibold text-gray-900">
                    {formatPriceIDR(order.total)}
                  </strong>
                </div>

                {/* Col 3: Status Badge (col-span-2) */}
                <div className="col-span-6 sm:col-span-2">
                  <span
                    className={`inline-block rounded px-2.5 py-1 text-xs font-medium border animate-in fade-in duration-200 ${getStatusBadge(
                      order.statusLabel
                    )}`}
                  >
                    {order.statusLabel}
                  </span>
                </div>

                {/* Col 4: Date (col-span-2) */}
                <div className="col-span-6 sm:col-span-2 flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="size-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{order.date}</span>
                </div>

                {/* Col 5: Details Button (col-span-2, text-right) */}
                <div className="col-span-12 sm:col-span-2 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      triggerToast(`Membuka rincian pesanan ${order.orderNumber} `)
                    }
                    className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <Eye className="size-3.5" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="size-8 rounded flex items-center justify-center border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isActive = currentPage === page;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`size-8 rounded flex items-center justify-center text-xs font-semibold transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-teal-600 text-white shadow-2xs"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="size-8 rounded flex items-center justify-center border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
