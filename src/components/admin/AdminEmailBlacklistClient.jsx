"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Ban, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsCreate, cmsDelete } from "@/app/admin/cms-actions";

export function AdminEmailBlacklistClient({ initialBlacklist = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [blacklist, setBlacklist] = useState(initialBlacklist);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({ email: "", reason: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBlacklist(initialBlacklist);
  }, [initialBlacklist]);

  const handleDelete = async (entry) => {
    if (!confirm(`Hapus ${entry.email} dari daftar blacklist?`)) return;
    const res = await cmsDelete("email_blacklist", entry.id);
    if (res?.success) {
      setBlacklist((prev) => prev.filter((b) => b.id !== entry.id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus email dari blacklist");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await cmsCreate("email_blacklist", {
      email: newEmail.email,
      reason: newEmail.reason || "Manual admin block",
    });
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsAddOpen(false);
      setNewEmail({ email: "", reason: "" });
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal memblokir email");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Ban className="size-5 text-rose-500" />
            Email Blacklist
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Daftar domain dan alamat email terlarang yang diblokir dari registrasi dan transaksi
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-3.5" />
          + Add Email
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Blacklisted Email</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Added Date</th>
                <th className="py-3 px-4 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blacklist.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{b.id}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-rose-600">{b.email}</td>
                  <td className="py-3 px-4 text-gray-600">{b.reason}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{b.addedDate}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(b)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Hapus dari Blacklist"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-800">Blacklist New Email</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email / Domain</label>
                <input
                  type="text"
                  required
                  value={newEmail.email}
                  onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
                  placeholder="e.g. spammer@badmail.com atau *@botdomain.org"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={newEmail.reason}
                  onChange={(e) => setNewEmail({ ...newEmail, reason: e.target.value })}
                  placeholder="e.g. Chargeback fraud"
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
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Menyimpan..." : "Blokir Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
