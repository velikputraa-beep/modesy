"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Wrench } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { saveKvSettingAction } from "@/app/admin/settings/actions";

export function AdminSeoClient({ initialSeo = {} }) {
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState(initialSeo);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialSeo);
  }, [initialSeo]);

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await saveKvSettingAction("seo", form);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan pengaturan SEO");
    }
  };

  const fields = [
    { key: "metaTitle", label: "Meta Title (Judul Situs di Google)", type: "input", placeholder: "e.g. Modesy - Marketplace" },
    { key: "metaDescription", label: "Meta Description (Deskripsi Cuplikan Snippet)", type: "textarea", rows: 3 },
    { key: "metaKeywords", label: "Meta Keywords (Dipisahkan koma)", type: "input" },
    { key: "googleAnalyticsId", label: "Google Analytics Tracking ID / Measurement ID", type: "input", mono: true, placeholder: "e.g. G-XXXXXXXXXX atau UA-XXXXX-Y" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Wrench className="size-5 text-blue-500" />
          SEO Tools
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Pengaturan meta tag mesin pencari Google/Bing dan ID integrasi tracking analytics
        </p>
      </div>

      <div className="max-w-2xl bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  rows={field.rows}
                  required
                  value={form[field.key] ?? ""}
                  onChange={setField(field.key)}
                  className="w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="text"
                  required={field.key !== "googleAnalyticsId"}
                  placeholder={field.placeholder}
                  value={form[field.key] ?? ""}
                  onChange={setField(field.key)}
                  className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                    field.mono ? "font-mono" : ""
                  }`}
                />
              )}
            </div>
          ))}

          <div className="pt-2">
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
