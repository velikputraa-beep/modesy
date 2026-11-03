"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCoupon, deleteCoupon } from "@/app/dashboard/actions";

// Mengubah baris kupon hasil query/action menjadi bentuk yang dipakai tabel.
function toRow(coupon) {
  return {
    id: coupon.id,
    code: coupon.code,
    discountLabel: coupon.discountLabel,
    usedCount: coupon.usedCount ?? 0,
    maxUses: coupon.maxUses ?? null,
    expiresAt: coupon.expiresAt,
    active: !!coupon.active,
  };
}

function formatExpiry(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("id-ID");
}

export function CouponsClient({ initialCoupons = [] }) {
  const [couponList, setCouponList] = useState(() =>
    (initialCoupons || []).map(toRow)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Form kupon baru
  const [code, setCode] = useState("");
  const [discountRate, setDiscountRate] = useState("10%");
  const [numCoupons, setNumCoupons] = useState("100");
  const [expiryDate, setExpiryDate] = useState("2027-01-01 / 00:00");

  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (msg, isError = false) => {
    setToastMessage(msg);
    setToastError(isError);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || creating) return;
    setCreating(true);
    const result = await createCoupon({ code, discountRate, numCoupons, expiryDate });
    setCreating(false);
    if (result?.success) {
      // Tambahkan kupon asli yang dikembalikan server, jangan bikin baris palsu.
      if (result.coupon) {
        setCouponList((prev) => [toRow(result.coupon), ...prev]);
      }
      setModalOpen(false);
      setCode("");
      showToast(result.message || "Kupon berhasil dibuat");
    } else {
      showToast(result?.error || "Gagal membuat kupon", true);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kupon ini?")) return;
    if (deletingId) return;
    setDeletingId(id);
    const result = await deleteCoupon(id);
    setDeletingId(null);
    if (result?.success) {
      setCouponList((prev) => prev.filter((c) => c.id !== id));
      showToast(result.message || "Kupon berhasil dihapus");
    } else {
      showToast(result?.error || "Gagal menghapus kupon", true);
    }
  };

  const handleUnavailable = (feature) => {
    showToast(`${feature} belum tersedia`, true);
  };

  return (
    <div className="space-y-6">
      {/* Toast popup */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 ${
            toastError ? "bg-red-600" : "bg-teal-600"
          }`}
        >
          {toastError ? (
            <X className="size-4 shrink-0" />
          ) : (
            <Check className="size-4 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="bg-white max-w-md w-full p-6 space-y-4 shadow-2xl rounded-lg">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">Add Coupon</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1">
                  Coupon Code
                </Label>
                <Input
                  placeholder="e.g. DISCOUNT20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1">
                  Discount Rate
                </Label>
                <Input
                  placeholder="e.g. 15%"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1">
                  Number of Coupons
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  value={numCoupons}
                  onChange={(e) => setNumCoupons(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1">
                  Expiry Date
                </Label>
                <Input
                  placeholder="YYYY-MM-DD / HH:mm"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
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
                  disabled={creating}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs h-8 px-4"
                >
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">
          Coupons
        </h1>
        <Button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Add Coupon</span>
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-200 bg-white rounded-lg p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] font-semibold text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Coupon Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {couponList.length > 0 ? (
                couponList.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-900">
                      {c.code}
                    </td>
                    <td className="px-4 py-3.5 text-gray-800 font-medium">
                      {c.discountLabel}
                    </td>
                    <td className="px-4 py-3.5">
                      {c.usedCount} / {c.maxUses ?? "∞"}{" "}
                      <span className="text-gray-400">
                        (Used:{" "}
                        <span className="text-red-500 font-semibold">
                          {c.usedCount}
                        </span>
                        )
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                      {formatExpiry(c.expiresAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.active
                            ? "bg-[#10b981] text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleUnavailable("Edit kupon")}
                          className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === c.id}
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-xs text-gray-400"
                  >
                    No coupons found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
          Number of Entries:{" "}
          <span className="font-semibold text-gray-800">
            {couponList.length}
          </span>
        </div>
      </Card>
    </div>
  );
}
