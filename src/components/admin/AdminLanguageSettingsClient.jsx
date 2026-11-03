"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Globe } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { saveLanguagesAction } from "@/app/admin/settings/actions";

const emptyForm = { name: "", code: "", order: "" };

export function AdminLanguageSettingsClient({ initialLanguages = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [languages, setLanguages] = useState(initialLanguages);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLanguages(initialLanguages);
  }, [initialLanguages]);

  const saveList = async (nextList) => {
    if (saving) return false;
    setSaving(true);
    let res;
    try {
      res = await saveLanguagesAction(nextList);
    } catch (err) {
      res = { success: false, error: err?.message };
    }
    setSaving(false);

    if (res?.success) {
      setLanguages(nextList);
      toast.success(res.message);
      router.refresh();
      return true;
    }
    toast.error(res?.error || "Gagal menyimpan");
    return false;
  };

  const handleSetDefault = (id) => {
    const next = languages.map((l) => ({ ...l, isDefault: l.id === id }));
    saveList(next);
  };

  const handleDelete = (language) => {
    if (!confirm(`Hapus bahasa "${language.name}"?`)) return;
    saveList(languages.filter((l) => l.id !== language.id));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({
      name: "",
      code: "",
      order: String(languages.length ? Math.max(...languages.map((l) => l.order)) + 1 : 1),
    });
    setIsFormOpen(true);
  };

  const openEdit = (language) => {
    setEditingId(language.id);
    setForm({
      name: language.name,
      code: language.code,
      order: String(language.order),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const code = form.code.trim().toLowerCase();
    if (!/^[a-z]{2}(-[a-z]{2})?$/.test(code)) {
      toast.error("Kode bahasa harus 2 huruf (mis. en) atau 2-2 (mis. pt-br)");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Nama bahasa wajib diisi");
      return;
    }
    const order = Number(form.order) || languages.length + 1;

    let next;
    if (editingId) {
      next = languages.map((l) =>
        l.id === editingId ? { ...l, name: form.name.trim(), code, order } : l
      );
    } else {
      const newId = languages.length ? Math.max(...languages.map((l) => l.id)) + 1 : 1;
      const hasDefault = languages.some((l) => l.isDefault);
      next = [
        ...languages,
        {
          id: newId,
          name: form.name.trim(),
          code,
          order,
          isDefault: !hasDefault,
          status: "Active",
        },
      ];
    }

    const saved = await saveList(next);
    if (saved) setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Globe className="size-5 text-blue-500" />
            Language Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Konfigurasi bahasa multi-lingual antarmuka, bahasa default, dan urutan tampilan
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-60"
        >
          <Plus className="size-3.5" />
          + Add Language
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Language Name</th>
                <th className="py-3 px-4">Short Code</th>
                <th className="py-3 px-4 text-center">Order</th>
                <th className="py-3 px-4 text-center">Default</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {languages.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Belum ada bahasa. Klik &quot;Add Language&quot; untuk membuat yang baru.
                  </td>
                </tr>
              )}
              {languages.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{l.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{l.name}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">{l.code}</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-700">{l.order}</td>
                  <td className="py-3 px-4 text-center">
                    {l.isDefault ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(l.id)}
                        disabled={saving}
                        className="text-[11px] text-blue-600 hover:underline cursor-pointer disabled:opacity-60"
                      >
                        Set Default
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        l.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(l)}
                        disabled={saving}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer disabled:opacity-60"
                        title="Edit Kata/Translasi"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      {!l.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDelete(l)}
                          disabled={saving}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-60"
                          title="Hapus"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-800">
                {editingId ? "Edit Language" : "Add New Language"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Language Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Bahasa Indonesia"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Short Code (2 huruf)
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="id"
                  className="w-full px-3 py-2 border rounded text-xs lowercase font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  placeholder="1"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Menyimpan..." : editingId ? "Update Language" : "Simpan Bahasa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
