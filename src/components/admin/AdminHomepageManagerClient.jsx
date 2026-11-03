"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  Eye,
  EyeOff,
  Save,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { saveHomepageSectionsAction } from "@/app/admin/homepage-manager/actions";

export function AdminHomepageManagerClient({ initialSections = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [sections, setSections] = useState(initialSections);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const reindex = (list) => list.map((sec, idx) => ({ ...sec, order: idx + 1 }));

  const saveList = async (nextList) => {
    if (saving) return false;
    setSaving(true);
    let res;
    try {
      res = await saveHomepageSectionsAction(nextList);
    } catch (err) {
      res = { success: false, error: err?.message };
    }
    setSaving(false);

    if (res?.success) {
      setSections(nextList);
      toast.success(res.message);
      router.refresh();
      return true;
    }
    toast.error(res?.error || "Gagal menyimpan");
    return false;
  };

  const toggleSection = (id) => {
    const next = reindex(
      sections.map((sec) => (sec.id === id ? { ...sec, enabled: !sec.enabled } : sec))
    );
    saveList(next);
  };

  const moveSection = (idx, direction) => {
    const target = idx + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    saveList(reindex(next));
  };

  const handleSave = () => {
    saveList(reindex(sections));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Homepage Manager</h1>
          <p className="text-xs text-gray-500 mt-1">
            Atur urutan modul, visibilitas, dan tata letak landing page utama
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-5 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-60"
        >
          <Save className="size-3.5" />
          {saving ? "Menyimpan..." : "Save Changes"}
        </button>
      </div>

      {/* Section List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-700">
          <span>Section Name</span>
          <span>Status & Visibility</span>
        </div>

        {sections.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-xs">
            Belum ada section homepage terdaftar.
          </div>
        )}
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-700">
                <GripVertical className="size-4" />
              </span>
              <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{sec.name}</p>
                <p className="text-[11px] text-gray-400 font-mono">{sec.key}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSection(idx, -1)}
                  disabled={saving || idx === 0}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Naikkan Urutan"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(idx, 1)}
                  disabled={saving || idx === sections.length - 1}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Turunkan Urutan"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  sec.enabled
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {sec.enabled ? "Visible" : "Hidden"}
              </span>
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                disabled={saving}
                className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-60 ${
                  sec.enabled
                    ? "text-emerald-600 hover:bg-emerald-50"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
                title={sec.enabled ? "Sembunyikan Section" : "Tampilkan Section"}
              >
                {sec.enabled ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Save Bar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-6 py-2.5 rounded shadow-xs transition-colors cursor-pointer disabled:opacity-60"
        >
          <Save className="size-4" />
          {saving ? "Menyimpan..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
