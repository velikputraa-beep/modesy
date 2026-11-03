"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, BookOpen, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsCreate, cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

export function AdminKnowledgeBaseClient({ initialArticles = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [articles, setArticles] = useState(initialArticles);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newArticle, setNewArticle] = useState({ title: "", category: "Vendor Onboarding" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  const openAdd = () => {
    setEditingId(null);
    setNewArticle({ title: "", category: "Vendor Onboarding" });
    setIsAddOpen(true);
  };

  const openEdit = (article) => {
    setEditingId(article.id);
    setNewArticle({ title: article.title, category: article.category || "Vendor Onboarding" });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = { title: newArticle.title, category: newArticle.category };
    const res = editingId
      ? await cmsUpdate("knowledge_base_articles", editingId, payload)
      : await cmsCreate("knowledge_base_articles", { ...payload, status: "published" });
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsAddOpen(false);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan artikel");
    }
  };

  const handleDelete = async (article) => {
    if (!confirm(`Hapus artikel "${article.title}"?`)) return;
    const res = await cmsDelete("knowledge_base_articles", article.id);
    if (res?.success) {
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus artikel");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="size-5 text-blue-500" />
            Knowledge Base
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Artikel tutorial mandiri dan dokumentasi FAQ bagi pengguna platform
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-3.5" />
          + Add Article
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Article Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Views</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Belum ada artikel. Klik &quot;Add Article&quot; untuk membuat yang baru.
                  </td>
                </tr>
              )}
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{a.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900 max-w-sm">{a.title}</td>
                  <td className="py-3 px-4 text-blue-600 font-medium">{a.category}</td>
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-gray-600">
                    {a.views.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(a)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit Artikel"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a)}
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
              <h3 className="font-semibold text-gray-800">{editingId ? "Edit Article" : "Add New Article"}</h3>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  placeholder="e.g. Cara Konfirmasi Pembayaran Manual"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newArticle.category}
                  onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Vendor Onboarding">Vendor Onboarding</option>
                  <option value="Payment Setup">Payment Setup</option>
                  <option value="Buyer Protection">Buyer Protection</option>
                  <option value="Shipping & Delivery">Shipping & Delivery</option>
                  <option value="Digital Products">Digital Products</option>
                  <option value="Seller Payout">Seller Payout</option>
                  <option value="Account Security">Account Security</option>
                </select>
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
                  {saving ? "Menyimpan..." : editingId ? "Update Artikel" : "Terbitkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
