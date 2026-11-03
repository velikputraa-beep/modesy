"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsCreate, cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

export function AdminCustomFieldsClient({ initialFields = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [fields, setFields] = useState(initialFields);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newField, setNewField] = useState({ name: "", type: "Text Input", category: "Clothing", required: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  const openAdd = () => {
    setEditingId(null);
    setNewField({ name: "", type: "Text Input", category: "Clothing", required: true });
    setIsAddOpen(true);
  };

  const openEdit = (field) => {
    setEditingId(field.id);
    setNewField({
      name: field.name,
      type: field.type,
      category: field.category,
      required: field.required,
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = {
      name: newField.name,
      field_type: newField.type,
      category: newField.category,
      required: newField.required,
    };
    const res = editingId
      ? await cmsUpdate("custom_fields", editingId, payload)
      : await cmsCreate("custom_fields", { ...payload, active: true });
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsAddOpen(false);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan field");
    }
  };

  const handleDelete = async (field) => {
    if (!confirm(`Hapus field "${field.name}"?`)) return;
    const res = await cmsDelete("custom_fields", field.id);
    if (res?.success) {
      setFields((prev) => prev.filter((f) => f.id !== field.id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus field");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Custom Fields</h1>
          <p className="text-xs text-gray-500 mt-1">
            Konfigurasi atribut dan spesifikasi dinamis per kategori produk
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-3.5" />
          + Add Field
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Id</th>
                <th className="py-3 px-4">Field Name</th>
                <th className="py-3 px-4">Field Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Required</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{f.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{f.name}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono">
                      {f.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-700">{f.category}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        f.required
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {f.required ? "Yes" : "Optional"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(f)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Field"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(f)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus Field"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-800">{editingId ? "Edit Field" : "Add New Field"}</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Field Name</label>
                <input
                  type="text"
                  required
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  placeholder="e.g. Battery Capacity"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Field Type</label>
                <select
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Text Input">Text Input</option>
                  <option value="Select Box">Select Box</option>
                  <option value="Checkbox">Checkbox</option>
                  <option value="Number Input">Number Input</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newField.category}
                  onChange={(e) => setNewField({ ...newField, category: e.target.value })}
                  placeholder="Clothing"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqCheck"
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="reqCheck" className="text-xs text-gray-700 cursor-pointer">
                  Wajib Diisi (Required)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : editingId ? "Update Field" : "Simpan Field"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
