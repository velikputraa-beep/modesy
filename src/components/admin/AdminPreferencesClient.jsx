"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { saveKvSettingAction } from "@/app/admin/settings/actions";

const TABS = ["System", "General", "Products", "Shop", "Wallet", "File Upload"];

const TOGGLES = [
  { key: "physicalProducts", label: "Physical Products" },
  { key: "digitalProducts", label: "Digital Products" },
  { key: "marketplace", label: "Marketplace (Selling Products on the Site)" },
  { key: "classifiedAds", label: "Classified Ads (Adding a Product or Service as an Ordinary Listing)" },
  { key: "biddingSystem", label: "Bidding System (Request Quote)" },
  { key: "licenseKeys", label: "Selling License Keys" },
  { key: "multiVendor", label: "Multi-Vendor System", hint: "If you disable it, only Admin can add product." },
];

const TIMEZONES = [
  "Asia/Jakarta (UTC+07:00)",
  "Europe/Amsterdam (UTC+01:00)",
  "America/New_York (UTC-05:00)",
  "Asia/Singapore (UTC+08:00)",
];

export function AdminPreferencesClient({ initialPreferences = {} }) {
  const { toast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("System");
  const [prefs, setPrefs] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);

  const [activeStorageTab, setActiveStorageTab] = useState("Local Storage");
  const [activeAiTab, setActiveAiTab] = useState("Gemini (Google)");
  const [aiStatus, setAiStatus] = useState(true);

  useEffect(() => {
    setPrefs(initialPreferences);
  }, [initialPreferences]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await saveKvSettingAction("preferences", prefs);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan preferences");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Preferences</h1>
        {saving && <span className="text-xs text-gray-500">Menyimpan...</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: System Preferences */}
        <div className="space-y-6">
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
              {activeTab === "System" ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {TOGGLES.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-800">{field.label}</label>
                      {field.hint && <p className="text-[11px] text-gray-500">{field.hint}</p>}
                      <div className="flex items-center gap-6 text-xs text-gray-700">
                        {[true, false].map((value) => (
                          <label key={String(value)} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={field.key}
                              checked={prefs[field.key] === value}
                              onChange={() => setPrefs((prev) => ({ ...prev, [field.key]: value }))}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{value ? "Enable" : "Disable"}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-gray-800">Timezone</label>
                    <select
                      value={prefs.timezone ?? TIMEZONES[0]}
                      onChange={(e) => setPrefs((prev) => ({ ...prev, timezone: e.target.value }))}
                      className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      {saving ? "Menyimpan..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-12 text-center text-xs text-gray-500">
                  Pengaturan untuk tab <span className="font-semibold text-gray-700">{activeTab}</span> akan tersedia segera.
                </div>
              )}
            </div>
          </div>

          {/* AI Content Generator Card — belum punya model data, jadi tidak disimpan */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 space-y-4">
            <h2 className="font-bold text-sm text-gray-800">AI Content Generator</h2>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAiStatus(!aiStatus)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  aiStatus ? "bg-teal-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    aiStatus ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-gray-700">Status</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Active Provider</label>
              <select
                value={activeAiTab}
                onChange={(e) => setActiveAiTab(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white text-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="Gemini (Google)">Gemini (Google)</option>
                <option value="ChatGPT (OpenAI)">ChatGPT (OpenAI)</option>
              </select>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
              <div className="flex gap-2 border-b border-gray-200 pb-2">
                {["ChatGPT (OpenAI)", "Gemini (Google)"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActiveAiTab(p)}
                    className={`text-xs px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      activeAiTab === p
                        ? "bg-white text-blue-600 shadow-xs border border-gray-200"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Api Key</label>
                <input
                  type="password"
                  placeholder="Api Key"
                  className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white text-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Model</label>
                <select className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white text-gray-800 focus:ring-1 focus:ring-blue-500 outline-none">
                  {activeAiTab.includes("Gemini") ? (
                    <>
                      <option>Gemini 1.5 Flash (Fastest)</option>
                      <option>Gemini 1.5 Pro (Best Quality)</option>
                    </>
                  ) : (
                    <>
                      <option>GPT-4o (Best Quality)</option>
                      <option>GPT-4o-mini (Fastest)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled
                title="Masih belum tersimpan ke database"
                className="bg-gray-200 text-gray-500 text-xs font-semibold px-4 py-2 rounded-md cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              Kartu ini masih pratinjau — API key provider tidak disimpan lewat panel ini.
            </p>
          </div>
        </div>

        {/* Right Column: Storage Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-sm text-gray-800">Storage</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Active Storage</label>
            <select
              value={activeStorageTab}
              onChange={(e) => setActiveStorageTab(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white text-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="Local Storage">Local Storage</option>
              <option value="AWS S3">AWS S3</option>
              <option value="Cloudflare R2">Cloudflare R2</option>
              <option value="Backblaze B2">Backblaze B2</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-gray-700">Storage Settings</label>
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
              {["Local Storage", "AWS S3", "Cloudflare R2", "Backblaze B2"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveStorageTab(s)}
                  className={`text-xs px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    activeStorageTab === s
                      ? "bg-white text-blue-600 shadow-xs border border-gray-200"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {activeStorageTab === "Local Storage" ? (
              <div className="flex items-start gap-2.5 p-3.5 bg-cyan-50 border border-cyan-200/80 rounded-md text-cyan-800 text-xs">
                <Info className="size-4 shrink-0 text-cyan-600 mt-0.5" />
                <span>
                  There is no need to enter additional API settings for Local Storage. Uploaded files are
                  hosted directly on your server.
                </span>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="Bucket Name"
                  className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white text-gray-800"
                />
                <input
                  type="text"
                  placeholder="Access Key / Key ID"
                  className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white text-gray-800"
                />
                <input
                  type="password"
                  placeholder="Secret Key / Key Secret"
                  className="w-full text-xs border border-gray-200 rounded-md p-2.5 bg-white text-gray-800"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              disabled
              title="Masih belum tersimpan ke database"
              className="bg-gray-200 text-gray-500 text-xs font-semibold px-4 py-2 rounded-md cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Kredensial storage belum punya model data di database, jadi tombol ini sengaja dinonaktifkan.
          </p>
        </div>
      </div>
    </div>
  );
}
