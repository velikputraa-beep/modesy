"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Share2, Info } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { saveSocialSettingsAction } from "@/app/admin/settings/actions";

const PROVIDERS = [
  {
    key: "google",
    label: "Google OAuth 2.0",
    idField: "clientId",
    idLabel: "Google Client ID",
    idPlaceholder: "1234567890-abcdefg.apps.googleusercontent.com",
    secret: true,
  },
  {
    key: "facebook",
    label: "Facebook Login",
    idField: "appId",
    idLabel: "Facebook App ID",
    idPlaceholder: "981234567890123",
    secret: true,
  },
  {
    key: "apple",
    label: "Sign in with Apple",
    idField: "serviceId",
    idLabel: "Apple Service ID",
    idPlaceholder: "com.modesy.signin",
    secret: false,
  },
];

export function AdminSocialSettingsClient({ initialSettings, secretStatus = {} }) {
  const { toast } = useToast();
  const router = useRouter();

  const [providers, setProviders] = useState(initialSettings ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) setProviders(initialSettings);
  }, [initialSettings]);

  const patch = (key, field, value) =>
    setProviders((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await saveSocialSettingsAction(providers);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan pengaturan social login");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Share2 className="size-5 text-blue-500" />
          Social Login Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Konfigurasi autentikasi pihak ketiga untuk pendaftaran &amp; login cepat (OAuth 2.0)
        </p>
      </div>

      <div className="flex items-start gap-2 max-w-2xl bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-3.5 text-[11px]">
        <Info className="size-4 shrink-0 mt-0.5" />
        <p>
          Client secret tidak diketik dan tidak disimpan di database — yang tercatat hanya nama env var
          penampungnya. Catatan penting: halaman login saat ini hanya memakai email + password, jadi
          provider OAuth juga harus diaktifkan di dashboard Supabase (Authentication &rarr; Third-party
          providers) agar benar-benar bisa dipakai.
        </p>
      </div>

      <div className="max-w-2xl bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {PROVIDERS.map((provider) => {
            const value = providers[provider.key] ?? {};
            const status = secretStatus[provider.key];
            return (
              <div key={provider.key} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-xs font-bold text-gray-800">{provider.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(value.enabled)}
                    onChange={(e) => patch(provider.key, "enabled", e.target.checked)}
                    className="rounded text-blue-600 size-4 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{provider.idLabel}</label>
                  <input
                    type="text"
                    value={value[provider.idField] ?? ""}
                    onChange={(e) => patch(provider.key, provider.idField, e.target.value)}
                    placeholder={provider.idPlaceholder}
                    className="w-full px-3 py-2 text-xs border rounded-md font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {provider.secret && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">
                        {provider.label.split(" ")[0]} Client Secret
                      </label>
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
                      value={value.secretEnv ?? ""}
                      onChange={(e) => patch(provider.key, "secretEnv", e.target.value)}
                      placeholder="Nama env var, mis. GOOGLE_CLIENT_SECRET"
                      className="w-full px-3 py-2 text-xs border rounded-md font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2 border-t">
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
  );
}
