"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Mail, Send, Info } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { saveEmailSettingsAction } from "@/app/admin/settings/actions";

export function AdminEmailSettingsClient({ initialSettings, secretStatus = {} }) {
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState(initialSettings ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) setForm(initialSettings);
  }, [initialSettings]);

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await saveEmailSettingsAction(form);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan pengaturan email");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Mail className="size-5 text-blue-500" />
          Email Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Konfigurasi protokol pengiriman email sistem (SMTP, notifikasi pesanan, verifikasi akun, reset sandi)
        </p>
      </div>

      <div className="flex items-start gap-2 max-w-2xl bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-3.5 text-[11px]">
        <Info className="size-4 shrink-0 mt-0.5" />
        <p>
          Password SMTP tidak diketik dan tidak disimpan di database. Server membaca dari environment
          variable, dan halaman ini hanya menampilkan status apakah variabel itu sudah tersedia.
        </p>
      </div>

      <div className="max-w-2xl bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mail Protocol</label>
            <select
              value={form.protocol ?? "smtp"}
              onChange={setField("protocol")}
              className="w-full px-3 py-2 text-xs border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="smtp">SMTP (Recommended)</option>
              <option value="mail">PHP Mail()</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">SMTP Host</label>
              <input
                type="text"
                value={form.host ?? ""}
                onChange={setField("host")}
                placeholder="smtp.mailgun.org"
                className="w-full px-3 py-2 text-xs border rounded-md font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">SMTP Port</label>
              <input
                type="text"
                value={form.port ?? ""}
                onChange={setField("port")}
                placeholder="587"
                className="w-full px-3 py-2 text-xs border rounded-md font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">SMTP Username</label>
            <input
              type="text"
              value={form.username ?? ""}
              onChange={setField("username")}
              className="w-full px-3 py-2 text-xs border rounded-md font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">SMTP Password</label>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  secretStatus.password?.configured
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {secretStatus.password?.configured ? "Env var terdeteksi" : "Env var belum di-set"}
              </span>
            </div>
            <input
              type="text"
              value={form.passwordEnv ?? ""}
              onChange={setField("passwordEnv")}
              placeholder="Nama env var, mis. SMTP_PASSWORD"
              className="w-full px-3 py-2 text-xs border rounded-md font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Isi dengan nama environment variable (bukan passwordnya). Sandi diset di environment deploy.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Encryption Protocol</label>
            <select
              value={form.encryption ?? "tls"}
              onChange={setField("encryption")}
              className="w-full px-3 py-2 text-xs border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="tls">TLS (Port 587)</option>
              <option value="ssl">SSL (Port 465)</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Sender Email (From)</label>
              <input
                type="email"
                value={form.senderEmail ?? ""}
                onChange={setField("senderEmail")}
                placeholder="noreply@example.com"
                className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Sender Name (From Name)</label>
              <input
                type="text"
                value={form.senderName ?? ""}
                onChange={setField("senderName")}
                className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-start justify-between gap-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded shadow-xs transition-colors cursor-pointer"
            >
              <Save className="size-3.5" />
              {saving ? "Menyimpan..." : "Save Changes"}
            </button>

            <div className="text-right">
              <button
                type="button"
                disabled
                title="Belum tersedia: proyek ini tidak punya library pengirim email (nodemailer/Resend) di package.json"
                className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-400 text-xs font-semibold px-4 py-2 rounded cursor-not-allowed"
              >
                <Send className="size-3.5" />
                Kirim Test Email (belum tersedia)
              </button>
              <p className="text-[11px] text-gray-400 mt-1.5 max-w-[240px]">
                Tombol dinonaktifkan supaya tidak ada toast &ldquo;terkirim&rdquo; palsu; provider email
                belum terpasang di dependency.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
