"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, RefreshCw, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsCreate, cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

const emptyForm = (categories) => ({
  title: "",
  category: categories[0] ? String(categories[0].id) : "",
});

export function AdminBlogPostsClient({ initialPosts = [], initialCategories = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [posts, setPosts] = useState(initialPosts);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newPost, setNewPost] = useState(() => emptyForm(initialCategories));
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const openAdd = () => {
    setEditingId(null);
    setNewPost(emptyForm(initialCategories));
    setIsAddOpen(true);
  };

  const openEdit = (post) => {
    const match = initialCategories.find((c) => c.name === post.category);
    const categoryId = post.categoryId ?? (match ? match.id : null);
    setEditingId(post.id);
    setNewPost({ title: post.title, category: categoryId ? String(categoryId) : "" });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const payload = editingId
      ? { title: newPost.title, category_id: newPost.category }
      : {
          title: newPost.title,
          category_id: newPost.category,
          author_name: "Super Admin",
          status: "published",
        };

    const res = editingId
      ? await cmsUpdate("blog_posts", editingId, payload)
      : await cmsCreate("blog_posts", payload);
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsAddOpen(false);
      setEditingId(null);
      setNewPost(emptyForm(initialCategories));
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan artikel");
    }
  };

  const handleDelete = async (post) => {
    if (!confirm(`Hapus artikel "${post.title}"?`)) return;
    setBusyId(post.id);
    const res = await cmsDelete("blog_posts", post.id);
    setBusyId(null);

    if (res?.success) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus artikel");
    }
  };

  const handleToggleStatus = async (post) => {
    if (busyId) return;
    setBusyId(post.id);
    const nextStatus = post.status === "Published" ? "draft" : "published";
    const res = await cmsUpdate("blog_posts", post.id, { status: nextStatus });
    setBusyId(null);

    if (res?.success) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, status: nextStatus === "published" ? "Published" : "Draft" }
            : p
        )
      );
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal mengubah status artikel");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Blog Posts</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola seluruh artikel, konten editorial, dan publikasi blog
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-3.5" />
          + Add Post
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4 w-20">Thumbnail</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4 text-center">Views</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{p.id}</td>
                  <td className="py-3 px-4">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-16 h-10 rounded object-cover border border-gray-200 shadow-2xs"
                      />
                    ) : (
                      <div className="w-16 h-10 rounded bg-gray-100 border border-gray-200" />
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 max-w-xs">{p.title}</td>
                  <td className="py-3 px-4 font-medium text-blue-600">{p.category}</td>
                  <td className="py-3 px-4 text-gray-700">{p.author}</td>
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-gray-500">{p.views}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.status === "Published"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{p.date}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p)}
                        disabled={busyId === p.id}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        title={p.status === "Published" ? "Jadikan Draft" : "Terbitkan Post"}
                      >
                        <RefreshCw className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit Post"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        disabled={busyId === p.id}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        title="Delete Post"
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
                {editingId ? "Edit Post" : "Add New Post"}
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g. Tren Desain Interior 2027"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  {initialCategories.length === 0 && <option value="">Belum ada kategori</option>}
                  {initialCategories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
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
                  disabled={saving || initialCategories.length === 0}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Menyimpan..." : editingId ? "Update Post" : "Terbitkan Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
