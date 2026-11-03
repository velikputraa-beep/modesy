"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, Eye, Edit2, X } from "lucide-react";

import { formatPriceIDR } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-context";
import { cmsUpdate } from "@/app/admin/cms-actions";

const STATUS_BY_LABEL = { Active: "active", Pending: "pending", Banned: "banned" };

export function AdminAffiliateClient({ initialAffiliates = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    affiliate_name: "",
    referrals: "",
    earnings: "",
    conversion_rate: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAffiliates(initialAffiliates);
  }, [initialAffiliates]);

  const openEdit = (affiliate) => {
    setEditingId(affiliate.id);
    setForm({
      affiliate_name: affiliate.affiliate || "",
      referrals: String(affiliate.referrals ?? ""),
      earnings: String(affiliate.earnings ?? ""),
      conversion_rate: String(affiliate.conversionRate || "").replace("%", "").trim(),
      status: STATUS_BY_LABEL[affiliate.status] || "pending",
    });
    setIsEditOpen(true);
  };

  const numOrEmpty = (value) => (String(value).trim() === "" ? "" : Number(value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await cmsUpdate("affiliates", editingId, {
      affiliate_name: form.affiliate_name,
      referrals: numOrEmpty(form.referrals),
      earnings: numOrEmpty(form.earnings),
      conversion_rate: numOrEmpty(form.conversion_rate),
      status: form.status,
    });
    setSaving(false);

    if (res?.success) {
      toast.success(res.message);
      setIsEditOpen(false);
      setEditingId(null);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan data afiliasi");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <LinkIcon className="size-5 text-blue-500" />
          Affiliate Program
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar mitra afiliasi rujukan (referral traffic), performa konversi, dan komisi earned
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Affiliate Partner</th>
                <th className="py-3 px-4 text-center">Referral Orders</th>
                <th className="py-3 px-4 text-center">Conversion Rate</th>
                <th className="py-3 px-4">Commission Earnings</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {affiliates.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{a.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{a.affiliate}</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-800">{a.referrals}</td>
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-blue-600 font-semibold">
                    {a.conversionRate}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    {formatPriceIDR(a.earnings)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        a.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          toast.info(`Rincian statistik afiliasi ${a.affiliate}`);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Lihat Statistik"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(a)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit Afiliasi"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-800">Edit Affiliate</h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Affiliate Name</label>
                <input
                  type="text"
                  required
                  value={form.affiliate_name}
                  onChange={(e) => setForm({ ...form, affiliate_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Referral Orders</label>
                <input
                  type="number"
                  min="0"
                  value={form.referrals}
                  onChange={(e) => setForm({ ...form, referrals: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Commission Earnings</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.earnings}
                  onChange={(e) => setForm({ ...form, earnings: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Conversion Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.conversion_rate}
                  onChange={(e) => setForm({ ...form, conversion_rate: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Menyimpan..." : "Update Affiliate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
