"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, Sparkles } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { activateTheme } from "@/app/admin/cms-actions";

export function AdminThemeClient({ initialThemes = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [themes, setThemes] = useState(initialThemes);
  const [activatingId, setActivatingId] = useState(null);

  useEffect(() => {
    setThemes(initialThemes);
  }, [initialThemes]);

  const handleActivate = async (theme) => {
    if (activatingId) return;
    setActivatingId(theme.id);
    const res = await activateTheme(theme.id);
    setActivatingId(null);

    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal mengaktifkan tema");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Theme</h1>
          <p className="text-xs text-gray-500 mt-1">
            Pilih atau unggah tampilan visual storefront marketplace Modesy
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Pilih file zip tema untuk diunggah")}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Upload className="size-3.5" />
          Upload Theme
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {themes.map((theme) => {
          const isActive = theme.isActive;
          return (
            <div
              key={theme.id}
              className={`bg-white rounded-lg border overflow-hidden transition-all duration-200 flex flex-col ${
                isActive
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              <div className="relative aspect-16/10 bg-slate-100 overflow-hidden group">
                <img
                  src={theme.preview}
                  alt={theme.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {isActive && (
                  <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                    <Check className="size-3" />
                    Active
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 text-sm">{theme.name}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      v{theme.version}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  {isActive ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded border border-emerald-200 flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <Check className="size-3.5" />
                      Active Theme
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleActivate(theme)}
                      disabled={activatingId === theme.id}
                      className="w-full py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <Sparkles className="size-3.5" />
                      {activatingId === theme.id ? "Mengaktifkan..." : "Activate"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
