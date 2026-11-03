"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Info, Palette, Package, Signpost, Type } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { saveKvSettingAction } from "@/app/admin/settings/actions";

const KIND_ICONS = { visual: Palette, product: Package, routes: Signpost, fonts: Type };

const inputClass =
  "w-full px-3 py-2 text-xs border border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500";

export function AdminKvForm({ kind, title, subtitle, note, fields, initialSettings = {} }) {
  const { toast } = useToast();
  const router = useRouter();
  const Icon = KIND_ICONS[kind] ?? Save;
  const [form, setForm] = useState(() => ({ ...(initialSettings ?? {}) }));
  const [pending, startTransition] = useTransition();

  const setField = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (pending) return;
    startTransition(async () => {
      const res = await saveKvSettingAction(kind, form);
      if (res?.success) {
        toast.success("Pengaturan tersimpan ke app_settings");
        router.refresh();
      } else {
        toast.error(res?.error || "Gagal menyimpan pengaturan");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {Icon ? <Icon className="size-5 text-blue-500" /> : null}
          {title}
        </h1>
        {subtitle ? <p className="text-xs text-gray-500 mt-1">{subtitle}</p> : null}
      </div>

      {note ? (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-3.5 text-[11px]">
          <Info className="size-4 shrink-0 mt-0.5" />
          <p>{note}</p>
        </div>
      ) : null}

      <div className="max-w-2xl bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4">
          {fields.map((field) =>
            field.type === "bool" ? (
              <div key={field.key} className="flex items-center justify-between gap-4 py-1">
                <div>
                  <p className="text-xs font-semibold text-gray-800">{field.label}</p>
                  {field.help ? (
                    <p className="text-[11px] text-gray-400">{field.help}</p>
                  ) : null}
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form[field.key])}
                  onChange={setField(field.key)}
                  className="rounded text-blue-600 size-4 cursor-pointer"
                />
              </div>
            ) : field.type === "select" ? (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{field.label}</label>
                <select value={form[field.key] ?? ""} onChange={setField(field.key)} className={inputClass}>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label ?? option.value}
                    </option>
                  ))}
                </select>
                {field.help ? <p className="text-[11px] text-gray-400 mt-1">{field.help}</p> : null}
              </div>
            ) : field.type === "color" ? (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{field.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(form[field.key] ?? "") ? form[field.key] : "#0284C7"}
                    onChange={setField(field.key)}
                    className="size-9 rounded border border-gray-200 cursor-pointer p-0.5"
                    aria-label={field.label}
                  />
                  <input
                    type="text"
                    value={form[field.key] ?? ""}
                    onChange={setField(field.key)}
                    placeholder="#0284C7"
                    className={`${inputClass} flex-1 font-mono`}
                  />
                </div>
              </div>
            ) : (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={form[field.key] ?? ""}
                  onChange={setField(field.key)}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  required={field.required}
                  placeholder={field.placeholder}
                  className={`${inputClass} ${field.mono ? "font-mono" : ""}`}
                />
                {field.help ? <p className="text-[11px] text-gray-400 mt-1">{field.help}</p> : null}
              </div>
            ),
          )}

          <div className="pt-3 border-t">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded shadow-xs transition-colors cursor-pointer"
            >
              <Save className="size-3.5" />
              {pending ? "Menyimpan..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
