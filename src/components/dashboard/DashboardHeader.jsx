"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  Menu,
  Eye,
  Globe,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/app/(auth)/actions";
import { clearLocalCart } from "@/lib/cart-storage";
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/permissions";

export function DashboardHeader({ onToggleSidebar, user }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      clearLocalCart();
      await logoutAction();
    });
  };

  const displayName = user?.full_name?.split(" ")[0] || "User";
  const roleLabel = ROLE_LABELS[user?.role] || (user?.role === "vendor" ? "Vendor" : "Member");
  const roleBadgeClass = ROLE_COLORS[user?.role] || ROLE_COLORS.member;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-xs">
      {/* Left: Hamburger menu icon */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
          title="Hide / Show Sidebar"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Right: View Site, Language Dropdown, User Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* View Site Button */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-md bg-teal-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-600 transition-colors shadow-xs"
        >
          <Eye className="size-3.5" />
          <span className="hidden sm:inline">View Site</span>
        </Link>

        {/* Language Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer">
            <Globe className="size-4 text-gray-500" />
            <span className="hidden sm:inline">English</span>
            <ChevronDown className="size-3.5 text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 p-1 bg-white shadow-md">
            <DropdownMenuItem className="cursor-pointer text-xs font-medium">
              English
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-xs font-medium">
              Bahasa Indonesia
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer">
            <img
              src={user?.avatar_url || "https://i.pravatar.cc/150?u=user"}
              alt={user?.full_name || "User"}
              className="size-8 rounded-full object-cover border border-gray-200"
            />
            <span className="hidden text-xs font-semibold text-gray-800 md:inline max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="size-3.5 text-gray-400" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl bg-white">
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-xs font-bold text-gray-900 truncate">
                {user?.full_name || "User"}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {user?.email || `@${user?.username || "user"}`}
              </p>
              <span
                className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${roleBadgeClass}`}
              >
                {roleLabel}
              </span>
            </div>

            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 text-gray-700 hover:text-teal-600 text-xs font-medium cursor-pointer"
              >
                <User className="size-4" />
                <span>Dashboard Home</span>
              </Link>
            </DropdownMenuItem>

            {(user?.role === "admin" || user?.role === "moderator") && (
              <DropdownMenuItem asChild>
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 text-purple-700 hover:text-purple-900 text-xs font-medium cursor-pointer"
                >
                  <ShieldCheck className="size-4 text-purple-600" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className="flex items-center gap-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer text-xs font-semibold"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4 text-red-600" />
              )}
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
