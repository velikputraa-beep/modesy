"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, X, ChevronRight, CheckCircle2 } from "lucide-react";
import { deleteQuoteAction } from "@/app/orders/actions";

import { Card } from "@/components/ui/card";
import { formatPriceIDR } from "@/lib/utils";

export function QuoteRequestsClient({ initialQuotes = [] }) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [toastMessage, setToastMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDelete = (id) => {
    startTransition(async () => {
      const result = await deleteQuoteAction(id);
      if (result?.error) {
        triggerToast(result.error);
        return;
      }
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      triggerToast("Permintaan penawaran berhasil dihapus");
      router.refresh();
    });
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
          <span className="text-gray-800">Quote Requests</span>
        </nav>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          Quote Requests
        </h1>

        {/* Quote List */}
        {quotes.length === 0 ? (
          <Card className="bg-white border border-gray-200/90 rounded-lg p-12 text-center text-xs text-gray-500">
            Tidak ada permintaan penawaran saat ini.
          </Card>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <Card
                key={quote.id}
                className="bg-white border border-gray-200/90 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
                  {/* Col 1: Thumbnail (col-span-3 sm:col-span-1) */}
                  <div className="col-span-3 sm:col-span-1">
                    <img
                      src={quote.image}
                      alt={quote.productName}
                      className="size-16 sm:size-20 rounded-lg object-cover bg-gray-100 border border-gray-100"
                    />
                  </div>

                  {/* Col 2: Info (col-span-9 sm:col-span-5 space-y-1) */}
                  <div className="col-span-9 sm:col-span-5 min-w-0">
                    <p className="text-xs text-gray-500">
                      Quote: <strong className="text-gray-900">#{quote.reference}</strong>
                    </p>
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {quote.productName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Quantity: {quote.quantity}
                    </p>
                  </div>

                  {/* Col 3: Status Badge (col-span-6 sm:col-span-2) */}
                  <div className="col-span-6 sm:col-span-2">
                    <span
                      className={`inline-block rounded px-2.5 py-1 text-xs font-medium border ${
                        quote.status === "New Quote Request"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      {quote.status}
                    </span>
                  </div>

                  {/* Col 4: Time / Bid (col-span-6 sm:col-span-2 space-y-0.5 text-xs text-gray-500) */}
                  <div className="col-span-6 sm:col-span-2">
                    {quote.bid !== undefined && (
                      <p className="text-xs text-gray-700 font-medium">
                        Seller's Bid:{" "}
                        <strong className="text-gray-900 font-bold">
                          {formatPriceIDR(quote.bid)}
                        </strong>
                      </p>
                    )}
                    {quote.message && (
                      <p className="text-xs text-gray-500 truncate">{quote.message}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="size-3.5 text-gray-400 shrink-0" />
                      <span>{quote.daysAgo} days ago</span>
                    </div>
                  </div>

                  {/* Col 5: Delete Button (col-span-12 sm:col-span-2 text-right) */}
                  <div className="col-span-12 sm:col-span-2 text-right">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(quote.id)}
                      className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 border border-gray-200 text-gray-700 rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <X className="size-3.5" />
                      <span>Delete Quote</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
