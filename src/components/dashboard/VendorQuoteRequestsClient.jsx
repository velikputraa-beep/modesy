"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { updateSellerQuoteAction } from "@/app/dashboard/quote-requests/actions";

const STATUS_BADGE = {
  new: "bg-[#10b981] text-white",
  pending: "bg-[#0ea5e9] text-white",
  accepted: "bg-[#6366f1] text-white",
  rejected: "bg-red-500 text-white",
  cancelled: "bg-gray-400 text-white",
};

const STATUS_LABELS = {
  new: "New Quote Request",
  pending: "Pending Quote",
  accepted: "Accepted Quote",
  rejected: "Rejected Quote",
  cancelled: "Cancelled Quote",
};

const money = (value) =>
  value === null || value === undefined
    ? "-"
    : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
        Number(value)
      );

export function VendorQuoteRequestsClient({ quotes }) {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState({});

  const rows = quotes.map((q) => ({ ...q, ...(localStatus[q.id] || {}) }));

  const filteredQuotes = rows.filter((q) => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (
      search &&
      !q.productName.toLowerCase().includes(search.toLowerCase()) &&
      !q.buyer.toLowerCase().includes(search.toLowerCase()) &&
      !q.reference.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const applyAction = (id, patch) => {
    startTransition(async () => {
      const result = await updateSellerQuoteAction({ id, ...patch });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setLocalStatus((prev) => ({ ...prev, [id]: { status: result.status, bid: result.bid } }));
      toast.success(result.message);
    });
  };

  const sendCounterOffer = (quote) => {
    const input = window.prompt(`Harga penawaran untuk ${quote.productName} (Rp)`, quote.bid ?? "");
    if (input === null) return;
    const value = Number(String(input).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Nilai penawaran tidak valid");
      return;
    }
    applyAction(quote.id, { status: "pending", bid: value });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Quote Requests</h1>

      <Card className="border border-gray-200 bg-white rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-end gap-3 text-xs">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500 min-w-[130px]"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Search</label>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500 min-w-[180px]"
            />
          </div>

          <span className="h-9 flex items-center text-[11px] text-gray-500">
            {filteredQuotes.length} dari {rows.length} permintaan
          </span>
        </div>

        <div className="overflow-x-auto border-t border-gray-100 pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] font-semibold text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Quote</th>
                <th className="px-4 py-3 min-w-[220px]">Product</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Seller&apos;s Bid</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-gray-900">{q.reference}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {q.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={q.image}
                          alt={q.productName}
                          className="size-12 rounded object-cover border border-gray-200 bg-gray-50 shrink-0"
                        />
                      ) : (
                        <span className="size-12 rounded border border-gray-200 bg-gray-50 shrink-0" />
                      )}
                      <div>
                        {q.slug ? (
                          <Link
                            href={`/products/${q.slug}`}
                            className="font-medium text-gray-900 hover:text-teal-600"
                          >
                            {q.productName}
                          </Link>
                        ) : (
                          <div className="font-medium text-gray-900">{q.productName}</div>
                        )}
                        <div className="text-[11px] text-gray-500">Quantity: {q.quantity}</div>
                        {q.message && (
                          <div className="text-[11px] text-gray-500 line-clamp-2">{q.message}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-800 font-medium">{q.buyer}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                        STATUS_BADGE[q.status] || "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {STATUS_LABELS[q.status] || q.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {q.bid !== null && q.bid !== undefined ? (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#10b981] text-white">
                        {money(q.bid)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{q.daysAgo} days ago</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{q.date}</td>
                  <td className="px-4 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          disabled={pending}
                          className="bg-[#5b5fe4] hover:bg-[#4d51cb] text-white text-[11px] font-semibold h-7 px-3 rounded gap-1 shadow-xs cursor-pointer disabled:opacity-60"
                        >
                          <span>Select an option</span>
                          <ChevronDown className="size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 bg-white border border-gray-200 shadow-md"
                      >
                        <DropdownMenuItem
                          onClick={() => applyAction(q.id, { status: "accepted" })}
                          className="text-xs cursor-pointer"
                        >
                          Accept Quote
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => sendCounterOffer(q)}
                          className="text-xs cursor-pointer"
                        >
                          Counter Offer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => applyAction(q.id, { status: "rejected" })}
                          className="text-xs text-red-600 cursor-pointer"
                        >
                          Decline Quote
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Belum ada permintaan penawaran untuk toko Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
          Number of Entries:{" "}
          <span className="font-semibold text-gray-800">{filteredQuotes.length}</span>
        </div>
      </Card>
    </div>
  );
}
