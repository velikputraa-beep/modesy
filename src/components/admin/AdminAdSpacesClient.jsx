"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Megaphone, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsCreate, cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

export function AdminAdSpacesClient({ initialAdSpaces = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [ads, setAds] = useState(initialAdSpaces);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newAd, setNewAd] = useState({ name: "", location: "Header", size: "728x90" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAds(initialAdSpaces);
  }, [initialAdSpaces]);

  const openAdd = () => {
    setEditingId(null);
    setNewAd({ name: "", location: "Header", size: "728x90" });
    setIsAddOpen(true);
  };

  const openEdit = (ad) => {
    setEditingId(ad.id);
    setNewAd({ name: ad.name, location: ad.location, size: ad.size });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = { name: newAd.name, location: newAd.location, size: newAd.size };
    const res = editingId
      ? await cmsUpdate("ad_spaces", editingId, payload)
      : await cmsCreate("ad_spaces", { ...payload, impressions: 0, clicks: 0, active: true });
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsAddOpen(false);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan slot iklan");
    }
  };

  const handleDelete = async (ad) => {
    if (!confirm(`Hapus slot iklan "${ad.name}"?`)) return;
    const res = await cmsDelete("ad_spaces", ad.id);
    if (res?.success) {
      setAds((prev) => prev.filter((a) => a.id !== ad.id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus slot iklan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Megaphone className="size-5 text-blue-500" />
            Ad Spaces
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manajemen penempatan banner iklan display pihak ketiga (Google AdSense / custom ads)
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-3.5" />
          + Add Ad Space
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Ad Slot Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Dimension Size</th>
                <th className="py-3 px-4 text-center">Impressions</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ads.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{a.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{a.name}</td>
                  <td className="py-3 px-4 text-blue-600 font-medium">{a.location}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-gray-600">{a.size}</td>
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-gray-600">
                    {a.impressions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        a.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(a)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Slot"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-800">{editingId ? "Edit Ad Space" : "Add New Ad Space"}</h3>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Slot Name</label>
                <input
                  type="text"
                  required
                  value={newAd.name}
                  onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
                  placeholder="e.g. Floating Bottom Bar"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Placement Location</label>
                <select
                  value={newAd.location}
                  onChange={(e) => setNewAd({ ...newAd, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Header">Header Banner</option>
                  <option value="Sidebar">Sidebar Widget</option>
                  <option value="Product Feed">Product Feed Stream</option>
                  <option value="Product Details">Product Details Sticky</option>
                  <option value="Footer">Footer Banner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dimension Size</label>
                <input
                  type="text"
                  required
                  value={newAd.size}
                  onChange={(e) => setNewAd({ ...newAd, size: e.target.value })}
                  placeholder="728x90 atau 300x250"
                  className="w-full px-3 py-2 border rounded text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
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
                  {saving ? "Menyimpan..." : editingId ? "Update Slot" : "Simpan Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
