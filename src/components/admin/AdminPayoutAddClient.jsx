"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { createPayoutAction } from "@/app/admin/payouts/actions";

export function AdminPayoutAddClient({ initialTargets = [], initialSettings = null }) {
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    sellerId: initialTargets[0]?.userId || "",
    amount: "",
    method: "bank_transfer",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const minimum =
    formData.method === "paypal" ? initialSettings?.minPayoutPaypal : initialSettings?.minPayoutBank;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await createPayoutAction(formData);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setFormData({ sellerId: initialTargets[0]?.userId || "", amount: "", method: "bank_transfer", note: "" });
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal membuat payout");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Add Payout</h1>
        <p className="text-xs text-gray-500 mt-1">
          Buat pengiriman payout manual ke rekening vendor atau akun PayPal
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
        {initialTargets.length === 0 ? (
          <p className="text-xs text-gray-500">
            Belum ada penjual dengan saldo wallet sehingga payout tidak dapat dibuat.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Select Seller</label>
              <select
                required
                value={formData.sellerId}
                onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                {initialTargets.map((t) => (
                  <option key={t.userId} value={t.userId}>
                    {t.seller} (Saldo: Rp {Number(t.balance).toLocaleString("id-ID")})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payout Amount (IDR)</label>
              <input
                type="number"
                required
                min={minimum || 1}
                placeholder={minimum ? `e.g. ${minimum}` : "e.g. 500000"}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              {minimum ? (
                <p className="text-[11px] text-gray-500 mt-1">
                  Minimal payout metode ini: Rp {Number(minimum).toLocaleString("id-ID")}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payout Method</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="bank_transfer">Bank Transfer (BCA / Mandiri / BNI)</option>
                <option value="paypal">PayPal Balance</option>
                <option value="stripe">Stripe Direct Connect</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Transfer Note / Reference ID
              </label>
              <textarea
                rows={3}
                placeholder="Catatan transfer atau nomor referensi bank..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <Wallet className="size-3.5" />
                {saving ? "Membuat payout..." : "Create Payout"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
