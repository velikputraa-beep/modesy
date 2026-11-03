"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { savePayoutSettingsAction } from "@/app/admin/payouts/actions";

export function AdminPayoutSettingsClient({ initialSettings = null }) {
  const { toast } = useToast();
  const router = useRouter();

  const [settings, setSettings] = useState({
    minPayoutBank: String(initialSettings?.minPayoutBank ?? 100000),
    minPayoutPaypal: String(initialSettings?.minPayoutPaypal ?? 150000),
    processingDays: String(initialSettings?.processingDays ?? 3),
    payoutFeePercentage: String(initialSettings?.payoutFeePercentage ?? 0),
    autoPayoutEnabled: !!initialSettings?.autoPayoutEnabled,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await savePayoutSettingsAction(settings);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan pengaturan payout");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Payout Settings</h1>
        <p className="text-xs text-gray-500 mt-1">
          Konfigurasi batas minimum penarikan dana, metode payout, dan estimasi proses kerja
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Minimum Payout Amount - Bank Transfer (IDR)
            </label>
            <input
              type="number"
              value={settings.minPayoutBank}
              onChange={(e) => setSettings({ ...settings, minPayoutBank: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Minimum Payout Amount - PayPal (IDR)
            </label>
            <input
              type="number"
              value={settings.minPayoutPaypal}
              onChange={(e) => setSettings({ ...settings, minPayoutPaypal: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Processing Days (Hari Kerja)
            </label>
            <input
              type="number"
              value={settings.processingDays}
              onChange={(e) => setSettings({ ...settings, processingDays: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Payout Processing Fee (%)
            </label>
            <input
              type="number"
              value={settings.payoutFeePercentage}
              onChange={(e) => setSettings({ ...settings, payoutFeePercentage: e.target.value })}
              className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoPayout"
              checked={settings.autoPayoutEnabled}
              onChange={(e) => setSettings({ ...settings, autoPayoutEnabled: e.target.checked })}
              className="rounded text-blue-600"
            />
            <label htmlFor="autoPayout" className="text-xs text-gray-700 cursor-pointer">
              Aktifkan persetujuan otomatis untuk vendor berperingkat tinggi
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Save className="size-3.5" />
              {saving ? "Menyimpan..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
