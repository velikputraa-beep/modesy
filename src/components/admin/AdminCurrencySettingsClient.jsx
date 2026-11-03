"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Coins } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { saveCurrenciesAction } from "@/app/admin/settings/actions";

const emptyForm = { name: "", code: "", symbol: "", format: "" };

export function AdminCurrencySettingsClient({ initialCurrencies = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [currencies, setCurrencies] = useState(initialCurrencies);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCurrencies(initialCurrencies);
  }, [initialCurrencies]);

  const saveList = async (nextList) => {
    if (saving) return false;
    setSaving(true);
    let res;
    try {
      res = await saveCurrenciesAction(nextList);
    } catch (err) {
      res = { success: false, error: err?.message };
    }
    setSaving(false);

    if (res?.success) {
      setCurrencies(nextList);
      toast.success(res.message);
      router.refresh();
      return true;
    }
    toast.error(res?.error || "Gagal menyimpan");
    return false;
  };

  const handleSetDefault = (id) => {
    const next = currencies.map((c) => ({ ...c, isDefault: c.id === id }));
    saveList(next);
  };

  const handleDelete = (currency) => {
    if (!confirm(`Hapus mata uang "${currency.name}"?`)) return;
    saveList(currencies.filter((c) => c.id !== currency.id));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (currency) => {
    setEditingId(currency.id);
    setForm({
      name: currency.name,
      code: currency.code,
      symbol: currency.symbol,
      format: currency.format,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      toast.error("Kode mata uang harus 3 huruf (mis. IDR)");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Nama mata uang wajib diisi");
      return;
    }

    let next;
    if (editingId) {
      next = currencies.map((c) =>
        c.id === editingId
          ? { ...c, name: form.name.trim(), code, symbol: form.symbol.trim(), format: form.format.trim() }
          : c
      );
    } else {
      const newId = currencies.length ? Math.max(...currencies.map((c) => c.id)) + 1 : 1;
      const hasDefault = currencies.some((c) => c.isDefault);
      next = [
        ...currencies,
        {
          id: newId,
          name: form.name.trim(),
          code,
          symbol: form.symbol.trim(),
          format: form.format.trim(),
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
            <Coins className="size-5 text-blue-500" />
            Currency Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Konfigurasi simbol mata uang, format pecahan angka, dan nilai tukar kurs
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-60"
        >
          <Plus className="size-3.5" />
          + Add Currency
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Currency Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4 text-center">Symbol</th>
                <th className="py-3 px-4">Format Sample</th>
                <th className="py-3 px-4 text-center">Default</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currencies.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Belum ada mata uang. Klik &quot;Add Currency&quot; untuk membuat yang baru.
                  </td>
                </tr>
              )}
              {currencies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{c.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{c.name}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">{c.code}</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-800">{c.symbol}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-gray-600">{c.format}</td>
                  <td className="py-3 px-4 text-center">
                    {c.isDefault ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(c.id)}
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
                        c.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        disabled={saving}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer disabled:opacity-60"
                        title="Edit"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      {!c.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
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
                {editingId ? "Edit Currency" : "Add New Currency"}
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Currency Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Indonesian Rupiah"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Code (3 huruf)</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="IDR"
                  className="w-full px-3 py-2 border rounded text-xs uppercase font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Symbol</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                  placeholder="Rp"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Format Sample</label>
                <input
                  type="text"
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                  placeholder="Rp 1.000"
                  className="w-full px-3 py-2 border rounded text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
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
                  {saving ? "Menyimpan..." : editingId ? "Update Currency" : "Simpan Currency"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
