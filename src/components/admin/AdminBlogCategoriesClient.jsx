"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsCreate, cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

export function AdminBlogCategoriesClient({ initialCategories = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [categories, setCategories] = useState(initialCategories);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCat, setNewCat] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const openAdd = () => {
    setEditingId(null);
    setNewCat({ name: "", slug: "" });
    setIsAddOpen(true);
  };

  const openEdit = (category) => {
    setEditingId(category.id);
    setNewCat({ name: category.name, slug: category.slug });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = editingId
      ? await cmsUpdate("blog_categories", editingId, newCat)
      : await cmsCreate("blog_categories", newCat);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsAddOpen(false);
      setEditingId(null);
      setNewCat({ name: "", slug: "" });
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan kategori");
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Hapus kategori "${category.name}"?`)) return;
    const res = await cmsDelete("blog_categories", category.id);
    if (res?.success) {
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus kategori");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Blog Categories</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola topik dan pengelompokan rubrik artikel blog
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-3.5" />
          + Add Category
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Id</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4 text-center">Posts Count</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{c.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{c.name}</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{c.slug}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full text-[11px]">
                      {c.postCount}
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
              <h3 className="font-semibold text-gray-800">
                {editingId ? "Edit Blog Category" : "Add Blog Category"}
              </h3>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="e.g. Shopping Tips"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={newCat.slug}
                  onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                  placeholder="shopping-tips"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
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
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Menyimpan..." : editingId ? "Update Kategori" : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
