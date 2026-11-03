"use client";

import Link from "next/link";

import { Users, CreditCard, Store, ShieldAlert, ChevronRight } from "lucide-react";

export function AdminMembershipOverviewClient({ initialUsers = [] }) {
  const users = initialUsers || [];
  const countBy = (role) => users.filter((u) => u.role === role).length;
  const vendors = countBy("vendor");
  const members = countBy("member");
  const staff = countBy("admin") + countBy("moderator");

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Membership Overview</h1>
        <p className="text-xs text-gray-500 mt-1">
          Ringkasan anggota platform berdasarkan role dari data profil user
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Total Members</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{users.length} Users</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Users className="size-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Vendors</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{vendors}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <Store className="size-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Members</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{members}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <CreditCard className="size-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Admin &amp; Moderator</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{staff}</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <ShieldAlert className="size-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/membership/users"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <span className="text-xs font-semibold text-gray-800">Users Directory</span>
          <ChevronRight className="size-4 text-gray-400" />
        </Link>
        <Link
          href="/admin/membership/plans"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <span className="text-xs font-semibold text-gray-800">Membership Plans</span>
          <ChevronRight className="size-4 text-gray-400" />
        </Link>
        <Link
          href="/admin/membership/shop-requests"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <span className="text-xs font-semibold text-gray-800">Shop Opening Requests</span>
          <ChevronRight className="size-4 text-gray-400" />
        </Link>
        <Link
          href="/admin/membership/login-activities"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <span className="text-xs font-semibold text-gray-800">Login Activities</span>
          <ChevronRight className="size-4 text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
