"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Eye, Plus, ChevronRight, CheckCircle2, X } from "lucide-react";
import { createRefundAction } from "@/app/orders/actions";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RefundRequestsClient({ initialRefunds = [] }) {
  const [refunds, setRefunds] = useState(initialRefunds);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // New refund form state
  const [orderNumber, setOrderNumber] = useState("");
  const [reason, setReason] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCreateRefund = async (e) => {
    e.preventDefault();
    if (!orderNumber || !reason) return;

    setSaving(true);
    const result = await createRefundAction({ orderNumber, reason });
    setSaving(false);

    if (result?.error) {
      triggerToast(result.error);
      return;
    }

    if (result?.refunds) setRefunds(result.refunds);
    setModalOpen(false);
    setOrderNumber("");
    setReason("");
    triggerToast("Pengajuan refund berhasil dikirim");
    router.refresh();
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

      {/* Submit Refund Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <Card className="bg-white max-w-md w-full p-6 space-y-4 shadow-2xl rounded-xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">
                Submit a Refund Request
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRefund} className="space-y-4 text-xs">
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1">
                  Order Number
                </Label>
                <Input
                  required
                  placeholder="e.g. #10040"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1">
                  Reason for Refund
                </Label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Describe the issue with the item or order..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="resize-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-4"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-3">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3 text-gray-400" />
          <span className="text-gray-800">Refund Requests</span>
        </nav>

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Refund Requests
          </h1>

          <Button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>Submit a Refund Request</span>
          </Button>
        </div>

        {/* Refund List */}
        {refunds.length === 0 ? (
          <Card className="bg-white border border-gray-200/90 rounded-lg p-12 text-center text-xs text-gray-500">
            Belum ada permintaan pengembalian dana.
          </Card>
        ) : (
          <div className="space-y-3">
            {refunds.map((refund) => (
              <Card
                key={refund.id}
                className="bg-white border border-gray-200/90 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
                  {/* Col 1: Thumbnail (col-span-3 sm:col-span-1) */}
                  <div className="col-span-3 sm:col-span-1">
                    <img
                      src={refund.image}
                      alt={refund.productName}
                      className="size-16 sm:size-20 rounded-lg object-cover bg-gray-100 border border-gray-100"
                    />
                  </div>

                  {/* Col 2: Info (col-span-9 sm:col-span-5 space-y-0.5 min-w-0"> */}
                  <div className="col-span-9 sm:col-span-5 min-w-0">
                    <p className="text-xs text-gray-500">
                      Order:{" "}
                      <strong className="text-gray-900">{refund.orderNumber}</strong>
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {refund.productName}
                    </h3>
                  </div>

                  {/* Col 3: Status Badge (col-span-6 sm:col-span-2) */}
                  <div className="col-span-6 sm:col-span-2">
                    <span className="inline-block rounded px-2.5 py-1 text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                      {refund.status}
                    </span>
                  </div>

                  {/* Col 4: Time (col-span-6 sm:col-span-2 flex items-center gap-1.5 text-xs text-gray-500) */}
                  <div className="col-span-6 sm:col-span-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="size-3.5 text-gray-400 shrink-0" />
                    <span>
                      {refund.daysAgo === 0
                        ? "Just now"
                        : `${refund.daysAgo} days ago`}
                    </span>
                  </div>

                  {/* Col 5: Details Button (col-span-12 sm:col-span-2 text-right) */}
                  <div className="col-span-12 sm:col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        triggerToast(
                          `Refund ${refund.orderNumber}: ${refund.reason}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>Details</span>
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
