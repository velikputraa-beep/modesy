"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsCreate, cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

export function AdminSliderClient({ initialSliders = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [sliders, setSliders] = useState(initialSliders);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    link: "",
    order: 1,
    image: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSliders(initialSliders);
  }, [initialSliders]);

  const openAdd = () => {
    setEditingId(null);
    setNewSlide({ title: "", subtitle: "", link: "", order: 1, image: "" });
    setIsAddOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setNewSlide({
      title: item.title,
      subtitle: item.subtitle,
      link: item.link,
      order: item.order,
      image: item.image,
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = {
      title: newSlide.title,
      subtitle: newSlide.subtitle,
      button_link: newSlide.link,
      image_url: newSlide.image,
      sort_order: newSlide.order,
    };
    const res = editingId
      ? await cmsUpdate("banners", editingId, payload)
      : await cmsCreate("banners", { ...payload, active: true });
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsAddOpen(false);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan slide");
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Hapus slide "${item.title}"?`)) return;
    const res = await cmsDelete("banners", item.id);
    if (res?.success) {
      setSliders((prev) => prev.filter((s) => s.id !== item.id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus slide");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Slider</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola banner slider utama di homepage Modesy
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-3.5" />
          + Add Slide
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4 w-28">Image</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Subtitle</th>
                <th className="py-3 px-4">Link</th>
                <th className="py-3 px-4 w-20 text-center">Order</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sliders.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{item.id}</td>
                  <td className="py-3 px-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-12 object-cover rounded border border-gray-200 shadow-2xs"
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800 max-w-xs">{item.title}</td>
                  <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{item.subtitle}</td>
                  <td className="py-3 px-4 text-blue-600 font-mono text-[11px] truncate max-w-[150px]">
                    {item.link}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-gray-700">
                    <span className="inline-flex items-center justify-center size-6 bg-slate-100 rounded-full text-xs">
                      {item.order}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Slide"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus Slide"
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
              <h3 className="font-semibold text-gray-800">{editingId ? "Edit Slide" : "Add New Slide"}</h3>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                  placeholder="e.g. Promo Spesial Ramadhan"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={newSlide.subtitle}
                  onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                  placeholder="e.g. Dapatkan diskon hingga 50% produk pilihan"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Link URL</label>
                <input
                  type="text"
                  value={newSlide.link}
                  onChange={(e) => setNewSlide({ ...newSlide, link: e.target.value })}
                  placeholder="/category/clothing"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={newSlide.image}
                  onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })}
                  placeholder="https://.../banner.jpg"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  min="1"
                  value={newSlide.order}
                  onChange={(e) => setNewSlide({ ...newSlide, order: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
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
                  {saving ? "Menyimpan..." : editingId ? "Update Slide" : "Simpan Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
