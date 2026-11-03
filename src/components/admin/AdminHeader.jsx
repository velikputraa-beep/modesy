"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  Menu,
  ExternalLink,
  Globe,
  ChevronDown,
  User,
  Settings,
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

export function AdminHeader({ onToggleSidebar, user }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      clearLocalCart();
      await logoutAction();
    });
  };

  return (
    <header className="shrink-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 shadow-xs">
      {/* Left: Hamburger button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Right: View Site, Language, and User Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* View Site Button */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <ExternalLink className="size-3.5" />
          <span className="hidden sm:inline">View Site</span>
        </Link>

        {/* Language Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer">
            <Globe className="size-4 text-gray-500" />
            <span className="hidden sm:inline">English</span>
            <ChevronDown className="size-3.5 text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 p-1">
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
              src={user?.avatar_url || "https://i.pravatar.cc/150?u=admin"}
              alt={user?.full_name || "Admin"}
              className="size-8 rounded-full object-cover border border-gray-300"
            />
            <span className="hidden text-xs font-semibold text-gray-800 md:inline max-w-[120px] truncate">
              {user?.full_name?.split(" ")[0] || "Admin"}
            </span>
            <ChevronDown className="size-3.5 text-gray-400" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-xs font-bold text-gray-900 truncate">
                {user?.full_name || "Admin"}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {user?.email || `@${user?.username || "admin"}`}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                {user?.role === "moderator" ? "Moderator" : "Super Admin"}
              </span>
            </div>

            <DropdownMenuItem asChild>
              <Link
                href={`/profile/${user?.username || "admin"}`}
                className="flex items-center gap-2.5 text-gray-700 hover:text-teal-600 text-xs font-medium cursor-pointer"
              >
                <User className="size-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/admin/settings/general"
                className="flex items-center gap-2.5 text-gray-700 hover:text-teal-600 text-xs font-medium cursor-pointer"
              >
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>

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
