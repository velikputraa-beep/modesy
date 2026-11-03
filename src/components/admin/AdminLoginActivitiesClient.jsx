"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Monitor } from "lucide-react";

export function AdminLoginActivitiesClient({ initialActivities = [] }) {
  const [activities, setActivities] = useState(initialActivities);

  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">User Login Activities</h1>
        <p className="text-xs text-gray-500 mt-1">
          Catatan log aktivitas masuk (login security auditing) untuk deteksi akses mencurigakan
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
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Device / Client</th>
                <th className="py-3 px-4">Estimated Location</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activities.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Belum ada aktivitas login.
                  </td>
                </tr>
              )}
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{a.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{a.user}</td>
                  <td className="py-3 px-4 font-mono text-gray-600 font-medium">{a.ip}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Monitor className="size-3.5 text-gray-400 shrink-0" />
                      <span>{a.device}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{a.location}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
