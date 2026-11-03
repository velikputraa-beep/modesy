"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { cmsDelete } from "@/app/admin/cms-actions";

export function AdminContactMessagesClient({ initialMessages = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [messages, setMessages] = useState(initialMessages);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleDelete = async (id) => {
    if (busyId) return;
    setBusyId(id);
    const res = await cmsDelete("contact_messages", id);
    setBusyId(null);

    if (res?.success) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menghapus pesan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Contact Messages</h1>
        <p className="text-xs text-gray-500 mt-1">
          Pesan masuk dari form 'Hubungi Kami' yang dikirimkan oleh pengunjung situs
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Id</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{m.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{m.name}</td>
                  <td className="py-3 px-4 text-blue-600 font-mono text-[11px]">{m.email}</td>
                  <td className="py-3 px-4 font-medium text-gray-800 max-w-[180px] truncate">{m.subject}</td>
                  <td className="py-3 px-4 text-gray-500 max-w-[280px] truncate">{m.message}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{m.date}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => toast.info(`Baca pesan dari ${m.name}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Lihat Pesan Lengkap"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        disabled={busyId === m.id}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
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
    </div>
  );
}
