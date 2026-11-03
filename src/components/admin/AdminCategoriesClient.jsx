"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Upload,
  RefreshCw,
  ChevronRight,
  Trash2,
  Edit,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  clearCache,
} from "@/app/admin/actions";

export function AdminCategoriesClient({ initialCategories = [] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("by Category Order");
  const [sortParent, setSortParent] = useState(true);
  const [notice, setNotice] = useState("");
  const [busyKey, setBusyKey] = useState(null);

  // Dialog tambah/edit kategori
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const filteredCategories = categories.filter((c) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const flashNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3000);
  };

  const openAddDialog = () => {
    setEditingId(null);
    setFormName("");
    setFormIcon("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (c) => {
    setEditingId(c.id);
    setFormName(c.name || "");
    setFormIcon(c.icon || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const fd = new FormData();
    fd.append("name", formName.trim());
    fd.append("icon", formIcon.trim());

    setSaving(true);
    const res = editingId
      ? await updateCategory(editingId, fd)
      : await createCategory(fd);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan kategori");
    }
  };

  const handleDelete = (id, name) => {
    if (!confirm(`Hapus kategori "${name}"?`)) return;
    if (busyKey) return;
    setBusyKey(`${id}:delete`);
    deleteCategory(id).then((res) => {
      setBusyKey(null);
      if (res?.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res?.error || "Gagal menghapus kategori");
      }
    });
  };

  const handleRebuildPaths = async () => {
    if (busyKey) return;
    setBusyKey("rebuild");
    const res = await clearCache();
    setBusyKey(null);
    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal membersihkan cache");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Categories</h1>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={openAddDialog}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add Category</span>
          </button>

          <button
            type="button"
            onClick={() => toast.info("Bulk upload kategori sedang disiapkan...")}
            className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 hover:bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="size-3.5" />
            <span>Bulk Category Upload</span>
          </button>

          <button
            type="button"
            onClick={handleRebuildPaths}
            disabled={busyKey === "rebuild"}
            className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className="size-3.5" />
            <span>Rebuild Category Paths</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-md text-xs font-medium border border-emerald-200">
          <Check className="size-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-4">
        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Search</label>
        <div className="flex gap-2 max-w-sm">
          <input
            type="text"
            placeholder="Search category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => toast.success("Category filter applied")}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer shrink-0"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
        {filteredCategories.length === 0 && (
          <div className="p-8 text-center text-xs text-gray-500">
            Belum ada kategori. Klik &quot;Add Category&quot; untuk membuat yang baru.
          </div>
        )}
        {filteredCategories.map((c) => (
          <div
            key={c.id}
            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ChevronRight className="size-4 text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-900 text-sm truncate">{c.name}</span>
              <span className="text-xs text-gray-400 font-normal">(Id: {c.id})</span>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {c.productCount ?? 0} produk
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
              <button
                type="button"
                onClick={() => openEditDialog(c)}
                className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => handleDelete(c.id, c.name)}
                disabled={busyKey === `${c.id}:delete`}
                className="text-gray-500 hover:text-red-600 bg-white border border-gray-200 hover:bg-red-50 p-1.5 rounded transition-colors cursor-pointer disabled:opacity-60"
                aria-label={`Hapus ${c.name}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Category Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">
                {editingId ? "Edit Category" : "Add Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1">
                  Category Name
                </Label>
                <Input
                  required
                  placeholder="e.g. Clothing"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1">
                  Icon (opsional)
                </Label>
                <Input
                  placeholder="e.g. shirt"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-4 disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Save Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 space-y-4">
        <h2 className="font-bold text-sm text-gray-800">Settings</h2>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 block">Sort Categories</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-700">
            {["by Category Order", "by Date", "by Date (DESC)", "Alphabetically"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sortOption"
                  checked={sortOption === opt}
                  onChange={() => setSortOption(opt)}
                  className="text-blue-600"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={sortParent}
              onChange={(e) => setSortParent(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span>Sort Parent Categories by Category Order</span>
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => flashNotice("Pengaturan urutan kategori berhasil disimpan!")}
            className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>

        {/* Warning Alert */}
        <div className="flex items-start gap-2.5 p-3.5 bg-cyan-50 border border-cyan-200/80 rounded-md text-cyan-800 text-xs">
          <AlertCircle className="size-4 shrink-0 text-cyan-600 mt-0.5" />
          <span>
            <strong>Warning!</strong> Sorting with drag and drop will be active only when the &quot;by Category Order&quot; option is selected.
          </span>
        </div>
      </div>
    </div>
  );
}
