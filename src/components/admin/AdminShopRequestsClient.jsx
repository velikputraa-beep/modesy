"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Store } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsUpdate } from "@/app/admin/cms-actions";

export function AdminShopRequestsClient({ initialRequests = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  const setStatus = async (request, status, label) => {
    if (busyId) return;
    setBusyId(request.id);
    const res = await cmsUpdate("shop_requests", request.id, { status });
    setBusyId(null);

    if (res?.success) {
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: label } : r))
      );
      toast.success(`Permohonan buka toko #${request.id} ${label === "Approved" ? "disetujui" : "ditolak"}.`);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal memproses permohonan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Store className="size-5 text-blue-500" />
          Shop Opening Requests
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar pengajuan permohonan pembukaan toko resmi oleh member untuk menjadi vendor terverifikasi
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Shop Name</th>
                <th className="py-3 px-4">Categories</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Request Date</th>
                <th className="py-3 px-4 w-36 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Belum ada permohonan buka toko.
                  </td>
                </tr>
              )}
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{String(r.id).slice(0, 8)}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{r.user}</td>
                  <td className="py-3 px-4 font-semibold text-blue-600 text-sm">{r.shopName}</td>
                  <td className="py-3 px-4 text-gray-600">{r.categories}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        r.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "Rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{r.date}</td>
                  <td className="py-3 px-4 text-right">
                    {r.status === "Pending" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => setStatus(r, "approved", "Approved")}
                          className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium px-2 py-1 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                        >
                          <Check className="size-3" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => setStatus(r, "rejected", "Rejected")}
                          className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-medium px-2 py-1 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                        >
                          <X className="size-3" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">Diselesaikan</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
