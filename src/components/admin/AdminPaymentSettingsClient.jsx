"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, CreditCard, Info } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { savePaymentSettingsAction } from "@/app/admin/settings/actions";

const TABS = [
  { key: "stripe", label: "Stripe" },
  { key: "paypal", label: "PayPal" },
  { key: "midtrans", label: "Midtrans (QRIS & VA)" },
  { key: "bank", label: "Bank Transfer" },
  { key: "cod", label: "Cash on Delivery" },
];

const MODES = {
  stripe: [
    ["test", "Test (Sandbox)"],
    ["live", "Live (Production)"],
  ],
  paypal: [
    ["sandbox", "Sandbox"],
    ["live", "Live (Production)"],
  ],
  midtrans: [
    ["sandbox", "Sandbox"],
    ["production", "Production"],
  ],
};

const ENV_LABEL = {
  publishableKeyEnv: "Publishable Key",
  secretKeyEnv: "Secret Key",
  clientIdEnv: "Client ID",
  clientKeyEnv: "Client Key",
  serverKeyEnv: "Server Key",
};

function EnvField({ gateway, field, value, status, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-gray-700">{ENV_LABEL[field] ?? field}</label>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            status?.configured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {status?.configured ? "Env var terdeteksi" : "Env var belum di-set"}
        </span>
      </div>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nama env var, mis. STRIPE_SECRET_KEY"
        className="w-full px-3 py-2 text-xs border rounded-md font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
      />
      <p className="text-[11px] text-gray-500 mt-1">
        {gateway}: nilai kunci tidak diketik dan tidak disimpan di database — panel ini hanya mencatat
        nama variabel environment yang membacanya di server.
      </p>
    </div>
  );
}

export function AdminPaymentSettingsClient({ initialSettings, secretStatus = {} }) {
  const { toast } = useToast();
  const router = useRouter();

  const [settings, setSettings] = useState(initialSettings ?? { activeGateway: "stripe", gateways: {} });
  const [tab, setTab] = useState(initialSettings?.activeGateway ?? "stripe");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  const gateways = settings.gateways ?? {};
  const current = gateways[tab] ?? {};

  const setGateway = (key, field, value) =>
    setSettings((prev) => ({
      ...prev,
      gateways: { ...prev.gateways, [key]: { ...prev.gateways?.[key], [field]: value } },
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await savePaymentSettingsAction(settings);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan pengaturan pembayaran");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CreditCard className="size-5 text-blue-500" />
          Payment Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Konfigurasi gateway pembayaran digital (Stripe, PayPal, Midtrans), transfer bank manual, dan COD
        </p>
      </div>

      <div className="flex items-start gap-2 max-w-3xl bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-3.5 text-[11px]">
        <Info className="size-4 shrink-0 mt-0.5" />
        <p>
          Kunci API tidak diketik di halaman ini dan tidak pernah ditulis ke database. Yang disimpan
          hanya status aktif, mode sandbox/live, dan nama env var pemegang kunci. Alur checkout
          storefront masih memakai daftar metode statis, jadi perubahan di sini belum otomatis
          memunculkan gateway baru di halaman bayar.
        </p>
      </div>

      <div className="max-w-3xl bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <label className="text-xs font-semibold text-gray-700">Metode pembayaran utama</label>
          <select
            value={settings.activeGateway ?? "stripe"}
            onChange={(e) => setSettings((prev) => ({ ...prev, activeGateway: e.target.value }))}
            className="px-3 py-2 text-xs border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            {TABS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50/50 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                tab === t.key
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
              {gateways[t.key]?.enabled ? " •" : ""}
            </button>
          ))}
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-xs font-bold text-gray-800">
                Aktifkan {TABS.find((t) => t.key === tab)?.label ?? tab}
              </span>
              <input
                type="checkbox"
                checked={Boolean(current.enabled)}
                onChange={(e) => setGateway(tab, "enabled", e.target.checked)}
                className="rounded text-blue-600 size-4 cursor-pointer"
              />
            </div>

            {MODES[tab] && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mode</label>
                <select
                  value={current.mode ?? MODES[tab][0][0]}
                  onChange={(e) => setGateway(tab, "mode", e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  {MODES[tab].map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {Object.keys(secretStatus[tab] ?? {}).map((field) => (
              <EnvField
                key={field}
                gateway={TABS.find((t) => t.key === tab)?.label ?? tab}
                field={field}
                value={current[field]}
                status={secretStatus[tab]?.[field]}
                onChange={(value) => setGateway(tab, field, value)}
              />
            ))}

            {tab === "bank" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rekening tujuan &amp; petunjuk transfer
                </label>
                <textarea
                  rows={4}
                  value={current.instructions ?? ""}
                  onChange={(e) => setGateway(tab, "instructions", e.target.value)}
                  placeholder="Contoh: BCA 1234-5678 a.n. PT Modesy Digital Nusantara"
                  className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {tab === "cod" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ketentuan COD</label>
                <input
                  type="text"
                  value={current.note ?? ""}
                  onChange={(e) => setGateway(tab, "note", e.target.value)}
                  placeholder="Contoh: tersedia untuk radius 20 km dari gudang"
                  className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="pt-3 border-t">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded shadow-xs transition-colors cursor-pointer"
              >
                <Save className="size-3.5" />
                {saving ? "Menyimpan..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
