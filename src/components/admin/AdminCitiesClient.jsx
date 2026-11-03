"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsCreate, cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

export function AdminCitiesClient({ initialCities = [], initialStates = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [cities, setCities] = useState(initialCities);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCity, setNewCity] = useState({ name: "", state_id: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCities(initialCities);
  }, [initialCities]);

  const selectedState = initialStates.find((s) => String(s.id) === String(newCity.state_id));

  const openAdd = () => {
    setEditingId(null);
    setNewCity({ name: "", state_id: initialStates[0] ? String(initialStates[0].id) : "" });
    setIsAddOpen(true);
  };

  const openEdit = (city) => {
    const matched = initialStates.find((s) => s.name === city.state);
    setEditingId(city.id);
    setNewCity({ name: city.name, state_id: matched ? String(matched.id) : "" });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = { name: newCity.name, state_id: newCity.state_id };
    const res = editingId
      ? await cmsUpdate("cities", editingId, payload)
      : await cmsCreate("cities", { ...payload, active: true });
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsAddOpen(false);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan kota");
    }
  };

  const handleDelete = async (city) => {
    if (!confirm(`Hapus kota "${city.name}"?`)) return;
    const res = await cmsDelete("cities", city.id);
    if (res?.success) {
      setCities((prev) => prev.filter((c) => c.id !== city.id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus kota");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Cities</h1>
          <p className="text-xs text-gray-500 mt-1">
            Daftar nama kota untuk penentuan ongkos kirim dan cakupan kurir pengiriman
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-3.5" />
          + Add City
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Id</th>
                <th className="py-3 px-4">City Name</th>
                <th className="py-3 px-4">State / Province</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cities.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Belum ada kota. Klik &quot;Add City&quot; untuk membuat yang baru.
                  </td>
                </tr>
              )}
              {cities.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{c.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800 text-sm">{c.name}</td>
                  <td className="py-3 px-4 text-gray-700">{c.state}</td>
                  <td className="py-3 px-4 font-medium text-blue-600">{c.country}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Hapus"
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

      {/* Add/Edit Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-800">{editingId ? "Edit City" : "Add New City"}</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City Name</label>
                <input
                  type="text"
                  required
                  value={newCity.name}
                  onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                  placeholder="e.g. Malang"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State / Province</label>
                <select
                  required
                  value={newCity.state_id}
                  onChange={(e) => setNewCity({ ...newCity, state_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="" disabled>
                    Pilih state/provinsi
                  </option>
                  {initialStates.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  readOnly
                  value={selectedState ? selectedState.country : ""}
                  placeholder="Otomatis dari state"
                  className="w-full px-3 py-2 border rounded text-xs bg-gray-50 text-gray-600 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || !newCity.state_id}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Menyimpan..." : editingId ? "Update Kota" : "Simpan Kota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
