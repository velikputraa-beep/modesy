"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsCreate, cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";
import { formatPriceIDR } from "@/lib/utils";

export function AdminMembershipPlansClient({ initialPlans = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [plans, setPlans] = useState(initialPlans);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    duration: "1 Month",
    features: "",
  });

  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  const openAdd = () => {
    setEditingId(null);
    setNewPlan({ name: "", price: "", duration: "1 Month", features: "" });
    setIsAddOpen(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan.id);
    setNewPlan({
      name: plan.name,
      price: plan.price === null || plan.price === undefined ? "" : String(plan.price),
      duration: plan.duration || "1 Month",
      features: plan.features || "",
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = {
      name: newPlan.name,
      price: newPlan.price,
      duration: newPlan.duration,
      features: newPlan.features || "Akses fitur standar",
    };
    const res = editingId
      ? await cmsUpdate("membership_plans", editingId, payload)
      : await cmsCreate("membership_plans", { ...payload, active: true });
    setSaving(false);

    if (res?.success) {
      toast.success(editingId ? "Perubahan tersimpan" : "Paket membership baru berhasil ditambahkan!");
      setIsAddOpen(false);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan paket");
    }
  };

  const handleDelete = async (plan) => {
    if (!confirm(`Hapus paket "${plan.name}"?`)) return;
    const res = await cmsDelete("membership_plans", plan.id);
    if (res?.success) {
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      toast.success("Paket membership berhasil dihapus");
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus paket");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Membership Plans</h1>
          <p className="text-xs text-gray-500 mt-1">
            Daftar paket biaya langganan toko penjual dan limitasi kuota produk
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-3.5" />
          + Add Plan
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Features & Limit</th>
                <th className="py-3 px-4 text-center">Active Subscribers</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Belum ada paket membership. Klik &quot;Add Plan&quot; untuk membuat yang baru.
                  </td>
                </tr>
              )}
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{p.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900 text-sm">{p.name}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {p.price === 0 ? "Gratis" : formatPriceIDR(p.price)}
                  </td>
                  <td className="py-3 px-4 font-medium text-blue-600">{p.duration}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs">{p.features}</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-800">{p.members}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
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

      {/* Add/Edit Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-800">{editingId ? "Edit Plan" : "Add New Plan"}</h3>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="e.g. Diamond Enterprise"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Price (IDR)</label>
                <input
                  type="number"
                  required
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                  placeholder="e.g. 500000 (0 jika gratis)"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={newPlan.duration}
                  onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months (1 Year)</option>
                  <option value="Unlimited">Unlimited Lifetime</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Features Description</label>
                <textarea
                  rows={2}
                  value={newPlan.features}
                  onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                  placeholder="Upload up to 500 products, priority placement..."
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
                  {saving ? "Menyimpan..." : editingId ? "Update Plan" : "Simpan Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
