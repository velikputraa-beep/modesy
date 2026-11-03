"use client";

import { useEffect, useState } from "react";
import { Eye, LifeBuoy } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";

export function AdminSupportTicketsClient({ initialTickets = [] }) {
  const { toast } = useToast();
  const [tickets, setTickets] = useState(initialTickets);

  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <LifeBuoy className="size-5 text-rose-500" />
          Support Tickets
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Antrean keluhan dan tiket konsultasi teknis dari customer dan penjual
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Ticket#</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Belum ada tiket dukungan.
                  </td>
                </tr>
              )}
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center font-mono font-semibold text-blue-600">#{t.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{t.user}</td>
                  <td className="py-3 px-4 text-gray-800 font-medium max-w-sm">{t.subject}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === "Urgent"
                          ? "bg-rose-100 text-rose-700"
                          : t.priority === "High"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        t.status === "Open"
                          ? "bg-rose-100 text-rose-800"
                          : t.status === "In Progress"
                          ? "bg-amber-100 text-amber-800"
                          : t.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{t.date}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toast.info(`Buka ruang respon tiket #${t.id}`)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      title="Lihat & Balas Tiket"
                    >
                      <Eye className="size-3.5" />
                    </button>
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
