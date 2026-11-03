"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Settings2, Info } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { saveKvSettingAction } from "@/app/admin/settings/actions";

const TABS = [
  "General Settings",
  "Contact Settings",
  "Social Media Settings",
  "Custom Header Codes",
  "Custom Footer Codes",
  "Cookies Warning",
  "Bulk Upload Documentation",
];

const CAPTCHA_PROVIDERS = [
  ["cloudflare_turnstile", "Cloudflare Turnstile (CAPTCHA)"],
  ["recaptcha_v2", "Google reCAPTCHA v2"],
  ["recaptcha_v3", "Google reCAPTCHA v3"],
];

const SOCIAL_FIELDS = [
  { field: "socialFacebook", label: "Facebook Page", placeholder: "https://facebook.com/modesy" },
  { field: "socialTwitter", label: "Twitter / X", placeholder: "https://twitter.com/modesy" },
  { field: "socialInstagram", label: "Instagram", placeholder: "https://instagram.com/modesy" },
  { field: "socialLinkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/modesy" },
  { field: "socialYoutube", label: "YouTube", placeholder: "https://youtube.com/@modesy" },
  { field: "socialTiktok", label: "TikTok", placeholder: "https://tiktok.com/@modesy" },
  { field: "socialPinterest", label: "Pinterest", placeholder: "https://pinterest.com/modesy" },
  { field: "socialTelegram", label: "Telegram", placeholder: "https://t.me/modesy" },
  { field: "socialWhatsapp", label: "WhatsApp Business", placeholder: "https://wa.me/62812xxxxxxx" },
];

export function AdminGeneralSettingsClient({ initialSettings, secretStatus = {} }) {
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState(initialSettings ?? {});
  const [activeTab, setActiveTab] = useState("General Settings");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) setForm(initialSettings);
  }, [initialSettings]);

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setBool = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const res = await saveKvSettingAction("general", form);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan pengaturan umum");
    }
  };

  const textClass =
    "w-full border border-gray-200 rounded p-2 text-xs text-gray-800 outline-none focus:border-blue-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Settings2 className="size-5 text-blue-500" />
          <h1 className="text-xl font-bold text-gray-800">General Settings</h1>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Settings Language</label>
          <select
            value={form.language ?? "English"}
            onChange={setField("language")}
            className="border border-gray-200 rounded px-3 py-1.5 text-xs bg-white text-gray-700 min-w-[160px]"
          >
            <option>English</option>
            <option>Bahasa Indonesia</option>
          </select>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-3.5 text-[11px]">
        <Info className="size-4 shrink-0 mt-0.5" />
        <p>
          Semua field di bawah disimpan ke <code>app_settings</code> key <code>general</code>. Logo dan
          favicon cukup diisi URL (upload file ke storage belum punya model tersendiri). Maintenance mode
          dan CAPTCHA tersimpan di database tetapi belum dibaca middleware/storefront, jadi statusnya baru
          konfigurasi, bukan efek langsung di situs.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar bg-gray-50/50">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "General Settings" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800">Application Icon</label>
                <p className="text-[11px] text-gray-500">
                  URL gambar 512&times;512 px untuk app icon, favicon, dan ikon PWA.
                </p>
                <div className="flex items-center gap-4 pt-1">
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.logoUrl}
                      alt="Application icon"
                      className="size-16 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="size-16 rounded-lg bg-gray-100 text-gray-400 text-[10px] flex items-center justify-center border border-dashed border-gray-300">
                      kosong
                    </div>
                  )}
                  <input
                    type="text"
                    value={form.logoUrl ?? ""}
                    onChange={setField("logoUrl")}
                    placeholder="https://.../logo.png"
                    className={textClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">Favicon URL</label>
                <input
                  type="text"
                  value={form.faviconUrl ?? ""}
                  onChange={setField("faviconUrl")}
                  placeholder="https://.../favicon.png"
                  className={textClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">Application Name</label>
                <input type="text" value={form.applicationName ?? ""} onChange={setField("applicationName")} className={textClass} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">Site Title</label>
                <input type="text" value={form.siteTitle ?? ""} onChange={setField("siteTitle")} className={textClass} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">Homepage Title</label>
                <input type="text" value={form.homepageTitle ?? ""} onChange={setField("homepageTitle")} className={textClass} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">Site Description</label>
                <input type="text" value={form.siteDescription ?? ""} onChange={setField("siteDescription")} className={textClass} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">Keywords</label>
                <input type="text" value={form.keywords ?? ""} onChange={setField("keywords")} className={textClass} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">Copyright</label>
                <input type="text" value={form.copyright ?? ""} onChange={setField("copyright")} className={textClass} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">Footer About Section</label>
                <textarea
                  rows={4}
                  value={form.footerAbout ?? ""}
                  onChange={setField("footerAbout")}
                  className="w-full border border-gray-200 rounded p-3 text-xs text-gray-800 outline-none resize-y focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <SaveButton saving={saving} onClick={handleSave} />
              </div>
            </div>
          ) : activeTab === "Contact Settings" ? (
            <div className="space-y-5">
              <PanelNote>
                Data kontak ini disimpan ke <code>app_settings</code> key <code>general</code>.
                Halaman <code>/contact</code> dan Footer saat ini menampilkan teks statis karena
                storefront tamu tidak diizinkan membaca tabel settings oleh RLS, jadi perubahan
                di sini tersimpan permanen tetapi belum otomatis tampil di halaman publik.
              </PanelNote>

              <LabeledInput
                label="Support Email"
                value={form.contactEmail ?? ""}
                onChange={setField("contactEmail")}
                placeholder="support@modesy.com"
              />
              <LabeledInput
                label="Phone / WhatsApp"
                value={form.contactPhone ?? ""}
                onChange={setField("contactPhone")}
                placeholder="62812xxxxxxx"
              />
              <LabeledTextarea
                label="Office Address"
                rows={3}
                value={form.contactAddress ?? ""}
                onChange={setField("contactAddress")}
                placeholder="Alamat kantor / gudang"
              />
              <LabeledInput
                label="Working Hours"
                value={form.contactWorkingHours ?? ""}
                onChange={setField("contactWorkingHours")}
                placeholder="Senin - Jumat, 09.00 - 17.00 WIB"
              />

              <div className="flex justify-end pt-2">
                <SaveButton saving={saving} onClick={handleSave} />
              </div>
            </div>
          ) : activeTab === "Social Media Settings" ? (
            <div className="space-y-5">
              <PanelNote>
                URL profil sosial media disimpan ke <code>app_settings</code> key{" "}
                <code>general</code>. Ini berbeda dari menu Social Login (OAuth
                Google/Facebook/Apple) yang tersimpan di tabel <code>social_settings</code>.
              </PanelNote>

              {SOCIAL_FIELDS.map(({ field, label, placeholder }) => (
                <LabeledInput
                  key={field}
                  label={label}
                  value={form[field] ?? ""}
                  onChange={setField(field)}
                  placeholder={placeholder}
                />
              ))}

              <div className="flex justify-end pt-2">
                <SaveButton saving={saving} onClick={handleSave} />
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-500">
              Pengaturan untuk tab <span className="font-semibold text-gray-700">{activeTab}</span> belum
              punya model data di database, jadi tab ini sengaja belum bisa disimpan.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-sm text-gray-800">Captcha Settings</h2>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBool("captchaEnabled", !form.captchaEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.captchaEnabled ? "bg-teal-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  form.captchaEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-xs font-semibold text-gray-700">
              Status: {form.captchaEnabled ? "Aktif" : "Nonaktif"}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">Captcha Provider</label>
            <select value={form.captchaProvider ?? "cloudflare_turnstile"} onChange={setField("captchaProvider")} className={textClass}>
              {CAPTCHA_PROVIDERS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">Site Key</label>
            <input
              type="text"
              value={form.captchaSiteKey ?? ""}
              onChange={setField("captchaSiteKey")}
              className="w-full border border-gray-200 rounded p-2 text-xs text-gray-800 font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700">Secret Key</label>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  secretStatus.captchaSecret?.configured
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {secretStatus.captchaSecret?.configured ? "Env var terdeteksi" : "Env var belum di-set"}
              </span>
            </div>
            <input
              type="text"
              value={form.captchaSecretEnv ?? ""}
              onChange={setField("captchaSecretEnv")}
              placeholder="Nama env var, mis. TURNSTILE_SECRET_KEY"
              className="w-full border border-gray-200 rounded p-2 text-xs text-gray-800 font-mono outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-gray-500">
              Secret CAPTCHA tidak disimpan di database, hanya nama env var-nya.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <SaveButton saving={saving} onClick={handleSave} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-sm text-gray-800">Maintenance Mode</h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">Title</label>
            <input type="text" value={form.maintenanceTitle ?? ""} onChange={setField("maintenanceTitle")} className={textClass} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">Description</label>
            <textarea
              rows={3}
              value={form.maintenanceDescription ?? ""}
              onChange={setField("maintenanceDescription")}
              className={textClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">Status</label>
            <div className="flex items-center gap-6 text-xs text-gray-700 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="maintenanceEnabled"
                  checked={Boolean(form.maintenanceEnabled)}
                  onChange={() => setBool("maintenanceEnabled", true)}
                  className="text-blue-600"
                />
                <span>Enable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="maintenanceEnabled"
                  checked={!form.maintenanceEnabled}
                  onChange={() => setBool("maintenanceEnabled", false)}
                  className="text-blue-600"
                />
                <span>Disable</span>
              </label>
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Preferensi tersimpan permanen, tetapi middleware belum memblokir storefront saat Enable.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <SaveButton saving={saving} onClick={handleSave} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveButton({ saving, onClick }) {
  return (
    <button
      type="button"
      disabled={saving}
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors cursor-pointer"
    >
      <Save className="size-3.5" />
      {saving ? "Menyimpan..." : "Save Changes"}
    </button>
  );
}

function PanelNote({ children }) {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-[11px]">
      <Info className="size-4 shrink-0 mt-0.5" />
      <p className="space-y-1">{children}</p>
    </div>
  );
}

const inputClass =
  "w-full border border-gray-200 rounded p-2 text-xs text-gray-800 outline-none focus:border-blue-500";

function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-800">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function LabeledTextarea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-800">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded p-2 text-xs text-gray-800 outline-none resize-y focus:border-blue-500"
      />
    </div>
  );
}
