"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Trash2, RefreshCw } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { clearCacheAction } from "@/app/admin/settings/actions";

export function AdminCacheClient({ lastCleared = null }) {
  const { toast } = useToast();
  const router = useRouter();

  const [clearing, setClearing] = useState(false);

  const formatted = lastCleared
    ? new Date(lastCleared).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "medium" })
    : "Belum pernah dibersihkan dari panel ini.";

  const handleClear = async () => {
    if (clearing) return;
    setClearing(true);
    const res = await clearCacheAction();
    setClearing(false);

    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal membersihkan cache");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Database className="size-5 text-blue-500" />
          Cache System
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manajemen penyimpanan sementara (static rendering, API cache, and temporary views)
        </p>
      </div>

      <div className="max-w-xl bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-100 rounded-xl text-slate-700">
            <Database className="size-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-base">Route &amp; Render Cache</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Bersihkan cache rendering jika ada perubahan layout, kategori, atau produk yang belum
              muncul seketika di storefront.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-[11px] font-medium text-gray-500 uppercase">Last Cleared</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">{formatted}</p>
          <p className="text-[11px] text-gray-500 mt-2 leading-normal">
            Tindakan ini memanggil <code>revalidatePath("/", "layout")</code> pada server, sehingga
            seluruh cache rute dan komponen halaman dibangun ulang pada permintaan berikutnya. Ukuran
            byte cache tidak dilaporkan karena Next.js tidak menyediakan angka tersebut.
          </p>
        </div>

        <div>
          <button
            type="button"
            disabled={clearing}
            onClick={handleClear}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {clearing ? <RefreshCw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            {clearing ? "Clearing..." : "Clear Cache"}
          </button>
        </div>
      </div>
    </div>
  );
}
