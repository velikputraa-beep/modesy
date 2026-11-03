"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  ChevronDown,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Check,
} from "lucide-react";

import { ROLE_COLORS, ROLE_LABELS } from "@/lib/permissions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast-context";
import {
  updateUserRole,
  deleteUser,
  setUserVerified,
} from "@/app/admin/actions";

const ROLE_OPTIONS = ["member", "vendor", "moderator", "admin"];

export function AdminUsersClient({ initialUsers = [] }) {
  const { toast } = useToast();
  const [usersList, setUsersList] = useState(initialUsers);
  const [busyKey, setBusyKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    setUsersList(initialUsers);
  }, [initialUsers]);

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const runAction = async (key, fn) => {
    if (busyKey) return;
    setBusyKey(key);
    const res = await fn();
    setBusyKey(null);
    if (res?.success) toast.success(res.message);
    else toast.error(res?.error || "Aksi gagal dilakukan");
    return res;
  };

  const handleDelete = (id, name) => {
    if (!confirm(`Yakin ingin menghapus user "${name}"?`)) return;
    runAction(`${id}:delete`, async () => {
      const res = await deleteUser(id);
      if (res?.success) setUsersList((prev) => prev.filter((u) => u.id !== id));
      return res;
    });
  };

  const handleChangeRole = (userId, targetRole) => {
    runAction(`${userId}:role`, async () => {
      const res = await updateUserRole(userId, targetRole);
      if (res?.success)
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: targetRole } : u))
        );
      return res;
    });
  };

  const handleToggleVerified = (userId, next) => {
    runAction(`${userId}:verify`, async () => {
      const res = await setUserVerified(userId, next);
      if (res?.success)
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, verified: next } : u))
        );
      return res;
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Add User Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Users</h1>
        <button
          type="button"
          onClick={() =>
            toast.info("Pembuatan user dilakukan lewat halaman registrasi publik.")
          }
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Show</label>
            <select className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700">
              <option>15</option>
              <option>30</option>
              <option>50</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700"
            >
              <option value="All">All</option>
              <option value="member">Member</option>
              <option value="vendor">Vendor</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Status</label>
            <select className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700">
              <option>All</option>
              <option>Active</option>
              <option>Banned</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Email Status</label>
            <select className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700">
              <option>All</option>
              <option>Confirmed</option>
              <option>Unconfirmed</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-800"
              />
              <button
                type="button"
                onClick={() => toast.success("User filter applied")}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-1.5 rounded text-xs font-semibold shrink-0 cursor-pointer"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-700 font-semibold text-[11px]">
              <tr>
                <th className="p-3 w-10">Id</th>
                <th className="p-3 min-w-[200px]">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Membership Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Belum ada user terdaftar.
                  </td>
                </tr>
              )}
              {paginatedUsers.map((u) => {
                const roleBadgeClass = ROLE_COLORS[u.role] || "bg-gray-100 text-gray-800";
                const roleLabelText = ROLE_LABELS[u.role] || "Member";

                return (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3 font-semibold text-gray-500 truncate max-w-[110px]">
                      {u.id}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/profile/${u.username}`}
                        className="flex items-center gap-3 group"
                      >
                        <img
                          src={u.avatar_url || `https://i.pravatar.cc/150?u=${u.username || "user"}`}
                          alt={u.full_name}
                          className="size-10 rounded-full object-cover border border-gray-200 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                            {u.full_name}
                          </p>
                          <span
                            className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded ${roleBadgeClass}`}
                          >
                            {roleLabelText}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3">
                      <p className="text-gray-800 font-medium">
                        {u.email || `${u.username}@modesy.local`}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {u.verified ? "(Confirmed)" : "(Unconfirmed)"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {u.role === "vendor" ? "Professional (Unlimited)" : "-"}
                    </td>
                    <td className="p-3">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                        Active
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 whitespace-nowrap">{u.joined}</td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={!!busyKey}
                          className="inline-flex items-center gap-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-xs transition-colors cursor-pointer focus:outline-none disabled:opacity-60"
                        >
                          <span>Select an option</span>
                          <ChevronDown className="size-3" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1.5 text-xs shadow-lg">
                          <DropdownMenuLabel className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1">
                            Ubah Role User
                          </DropdownMenuLabel>
                          {ROLE_OPTIONS.map((role) => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => handleChangeRole(u.id, role)}
                              className="cursor-pointer text-xs flex items-center justify-between"
                            >
                              <span>Set {ROLE_LABELS[role] || role}</span>
                              {u.role === role && <Check className="size-3.5 text-teal-600" />}
                            </DropdownMenuItem>
                          ))}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleToggleVerified(u.id, !u.verified)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {u.verified ? (
                              <>
                                <UserX className="size-3.5 text-amber-500" />
                                <span>Cabut Verifikasi</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="size-3.5 text-emerald-500" />
                                <span>Verifikasi User</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast.info(`Pembukaan email untuk ${u.email || u.username} dilakukan manual.`)
                            }
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Mail className="size-3.5 text-gray-500" />
                            <span>Send Email</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(u.id, u.full_name)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 cursor-pointer font-medium"
                          >
                            <Trash2 className="size-3.5 text-red-500" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
          <div>
            Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} entries
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  currentPage === idx + 1
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 hover:bg-white text-gray-700"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
