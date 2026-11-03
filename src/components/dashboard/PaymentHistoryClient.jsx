"use client";

import { useState } from "react";
import { FileDown, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatPriceIDR } from "@/lib/utils";

const STATUS_STYLE = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  refunded: "bg-gray-100 text-gray-600 border-gray-200",
};

function buildInvoiceText(row, invoiceKind) {
  return [
    "MODESY — BUKTI PEMBAYARAN",
    "===========================================",
    `Jenis        : ${invoiceKind}`,
    `Payment Id   : ${row.paymentId}`,
    `Method       : ${row.method}`,
    `Amount       : ${formatPriceIDR(row.amount)}`,
    `Status       : ${row.status}`,
    `Detail       : ${row.detail}`,
    `Tanggal      : ${row.date}`,
    "===========================================",
    "Dokumen ini dibuat otomatis dari data pembayaran di database Modesy.",
  ].join("\n");
}

export function PaymentHistoryClient({
  title,
  sourceTable,
  invoiceKind,
  detailHeader,
  showBuyer = false,
  initialPayments = [],
  emptyTitle,
  emptyNote,
}) {
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleInvoice = (row) => {
    const blob = new Blob([buildInvoiceText(row, invoiceKind)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${row.paymentId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Invoice ${row.paymentId} diunduh`);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl">
          {toastMessage}
        </div>
      )}

      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">{title}</h1>
        <p className="text-xs text-gray-500 mt-1">
          Dibaca langsung dari tabel <code className="font-mono">{sourceTable}</code>.
        </p>
      </div>

      <Card className="border border-gray-200 bg-white rounded-lg p-5 shadow-xs space-y-4">
        {initialPayments.length === 0 ? (
          <div className="py-14 flex flex-col items-center text-center gap-2">
            <div className="size-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <Inbox className="size-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">{emptyTitle}</p>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed">{emptyNote}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-[11px] font-semibold text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-10">Id</th>
                    <th className="px-4 py-3">Payment Id</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Payment Amount</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3">{detailHeader}</th>
                    {showBuyer && <th className="px-4 py-3">User</th>}
                    <th className="px-4 py-3 whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {initialPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-gray-500">{p.id}</td>
                      <td className="px-4 py-3.5 font-mono text-gray-800 break-all max-w-[180px]">
                        {p.paymentId}
                      </td>
                      <td className="px-4 py-3.5">{p.method}</td>
                      <td className="px-4 py-3.5 font-medium text-gray-900">
                        {formatPriceIDR(p.amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-semibold capitalize ${
                            STATUS_STYLE[p.status] || STATUS_STYLE.pending
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{p.detail}</td>
                      {showBuyer && <td className="px-4 py-3.5 text-gray-600">{p.buyer}</td>}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{p.date}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleInvoice(p)}
                          className="inline-flex items-center gap-1.5 bg-[#0099ad] hover:bg-[#008294] text-white text-[11px] font-semibold px-3 py-1 rounded shadow-xs cursor-pointer transition-colors"
                        >
                          <FileDown className="size-3" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
              Number of Entries:{" "}
              <span className="font-semibold text-gray-800">{initialPayments.length}</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
