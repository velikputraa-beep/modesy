"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsDelete } from "@/app/admin/cms-actions";
import { formatPriceIDR } from "@/lib/utils";

export function AdminPromotionPaymentsClient({ initialPayments = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [payments, setPayments] = useState(initialPayments);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  const handleDelete = async (payment) => {
    if (!confirm(`Hapus data promosi ${payment.paymentId}?`)) return;
    const res = await cmsDelete("promotion_payments", payment.id);
    if (res?.success) {
      setPayments((prev) => prev.filter((p) => p.id !== payment.id));
      toast.success(`Data promosi ${payment.paymentId} dihapus`);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus data promosi");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Promotion Payments</h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar pembayaran promosi produk unggulan, carousel homepage, dan banner spotlight
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Payment Id</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Promotion Package</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-24 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Tidak ada data pembayaran promosi.
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{p.id}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">{p.paymentId}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{p.method}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(p.amount)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{p.user}</td>
                  <td className="py-3 px-4 text-blue-700 font-semibold">{p.promotion}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{p.date}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => toast.info(`Lihat invoice ${p.paymentId}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
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
