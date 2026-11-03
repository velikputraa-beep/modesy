"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Key, Plus, ShieldCheck } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { saveRolePermissionsAction } from "@/app/admin/settings/actions";

export function AdminRolesClient({ roles = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [draft, setDraft] = useState({});
  const [savingRole, setSavingRole] = useState(null);

  const catalog = useMemo(
    () => [...new Set(roles.flatMap((r) => r.permissions ?? []))].sort((a, b) => a.localeCompare(b)),
    [roles],
  );

  useEffect(() => {
    const next = {};
    roles.forEach((role) => {
      next[role.id] = Object.fromEntries((role.permissions ?? []).map((perm) => [perm, true]));
    });
    setDraft(next);
  }, [roles]);

  const toggle = (roleKey, perm) => {
    setDraft((prev) => ({
      ...prev,
      [roleKey]: { ...prev[roleKey], [perm]: !prev[roleKey]?.[perm] },
    }));
  };

  const selectedOf = (role) => catalog.filter((perm) => draft[role.id]?.[perm]);
  const isDirty = (role) =>
    selectedOf(role).join("|") !== [...(role.permissions ?? [])].sort((a, b) => a.localeCompare(b)).join("|");

  const handleSave = async (role) => {
    if (savingRole) return;
    setSavingRole(role.id);
    const res = await saveRolePermissionsAction(role.id, selectedOf(role));
    setSavingRole(null);

    if (res?.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan hak akses role");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Key className="size-5 text-blue-500" />
            Roles &amp; Permissions
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Pengaturan peran pengguna dan hak akses granular fitur Modesy (RBAC)
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Pembuatan role baru belum tersedia di database"
          className="inline-flex items-center gap-2 bg-gray-200 text-gray-500 text-xs font-semibold px-4 py-2 rounded self-start sm:self-auto cursor-not-allowed"
        >
          <Plus className="size-3.5" />
          + Add Role
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-52">Role Name</th>
                <th className="py-3 px-4">Permissions ({catalog.length})</th>
                <th className="py-3 px-4 w-28 text-center">Users</th>
                <th className="py-3 px-4 w-32 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
                    Belum ada data role.
                  </td>
                </tr>
              )}
              {roles.map((role) => (
                <tr key={role.id} className="align-top hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-gray-400 shrink-0" />
                      <span className="font-bold text-gray-900 text-sm">{role.name}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-normal">{role.description}</p>
                  </td>

                  <td className="py-4 px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {catalog.map((perm) => (
                        <label
                          key={perm}
                          className="flex items-center gap-2 text-gray-700 cursor-pointer whitespace-nowrap"
                        >
                          <input
                            type="checkbox"
                            checked={!!draft[role.id]?.[perm]}
                            onChange={() => toggle(role.id, perm)}
                            disabled={!!savingRole}
                            className="size-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span>{perm}</span>
                        </label>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 rounded-full font-bold text-gray-800">
                      {role.usersCount} users
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSave(role)}
                      disabled={!!savingRole || !isDirty(role)}
                      className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-100 disabled:text-gray-400 text-white px-3 py-1.5 rounded text-[11px] font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {savingRole === role.id ? "Saving..." : isDirty(role) ? "Save" : "No Change"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Daftar izin di atas berasal dari tabel <code>role_permissions</code>; perubahan hanya tersimpan
        setelah tombol Save per role ditekan.
      </p>
    </div>
  );
}
