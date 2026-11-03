"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2, UserMinus } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsUpdate, cmsDelete } from "@/app/admin/cms-actions";

export function AdminNewsletterClient({ initialSubscribers = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [busyKey, setBusyKey] = useState(null);

  useEffect(() => {
    setSubscribers(initialSubscribers);
  }, [initialSubscribers]);

  const handleUnsubscribe = async (id) => {
    if (busyKey) return;
    setBusyKey(`unsub:${id}`);
    const res = await cmsUpdate("newsletter_subscribers", id, { status: "unsubscribed" });
    setBusyKey(null);

    if (res?.success) {
      setSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Unsubscribed" } : s)));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal membatalkan langganan");
    }
  };

  const handleDelete = async (id) => {
    if (busyKey) return;
    setBusyKey(`del:${id}`);
    const res = await cmsDelete("newsletter_subscribers", id);
    setBusyKey(null);

    if (res?.success) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus subscriber");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Newsletter Subscribers</h1>
          <p className="text-xs text-gray-500 mt-1">
            Daftar alamat email pelanggan buletin promosi mingguan
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Membuka dialog pengiriman email massal newsletter!")}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Send className="size-3.5" />
          Send Newsletter
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Subscriber Email</th>
                <th className="py-3 px-4">Subscribed Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{s.id}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-gray-900 text-xs">
                    {s.email}
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{s.subscribedDate}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        s.status === "Subscribed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {s.status === "Subscribed" && (
                        <button
                          type="button"
                          onClick={() => handleUnsubscribe(s.id)}
                          disabled={busyKey === `unsub:${s.id}`}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                          title="Berhenti Langganan"
                        >
                          <UserMinus className="size-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        disabled={busyKey === `del:${s.id}`}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        title="Hapus Subscriber"
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
