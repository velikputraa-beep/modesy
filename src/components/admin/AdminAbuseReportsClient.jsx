"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Trash2 } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

export function AdminAbuseReportsClient({ initialReports = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [reports, setReports] = useState(initialReports);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  const handleStatusUpdate = async (report, status, label) => {
    if (busyId) return;
    setBusyId(report.id);
    const res = await cmsUpdate("abuse_reports", report.id, { status });
    setBusyId(null);

    if (res?.success) {
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: label } : r))
      );
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal memperbarui status laporan");
    }
  };

  const handleDelete = async (report) => {
    if (!confirm(`Hapus laporan pelanggaran #${report.id}?`)) return;
    const res = await cmsDelete("abuse_reports", report.id);
    if (res?.success) {
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus laporan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="size-5 text-amber-500" />
          Abuse Reports
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Laporan pelanggaran hak cipta, spam, penipuan, atau konten tidak pantas dari komunitas pengguna
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Reported Item / Target</th>
                <th className="py-3 px-4">Reason / Details</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{r.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{r.reporter}</td>
                  <td className="py-3 px-4 font-medium text-rose-600">{r.reportedItem}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs">{r.reason}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        r.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "Banned"
                          ? "bg-slate-200 text-slate-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{r.date}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status !== "Resolved" && r.status !== "Banned" && (
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleStatusUpdate(r, "resolved", "Resolved")}
                          className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                        >
                          <Check className="size-3" />
                          Resolve
                        </button>
                      )}
                      {r.status !== "Resolved" && r.status !== "Banned" && (
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleStatusUpdate(r, "banned", "Banned")}
                          className="inline-flex items-center gap-1 bg-slate-500 hover:bg-slate-600 text-white text-[11px] font-medium px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                        >
                          Ban
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus Laporan"
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
    </div>
  );
}
