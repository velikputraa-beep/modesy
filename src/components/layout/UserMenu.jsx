"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Layers,
  LayoutGrid,
  User,
  Wallet,
  Package,
  Tag,
  MessageSquare,
  Settings,
  LogOut,
  Store,
  TrendingUp,
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

export function UserMenu({ user }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      clearLocalCart();
      await logoutAction();
    });
  };

  const rawRole = user?.role?.toLowerCase() || "member";
  const role = rawRole === "buyer" ? "member" : rawRole === "seller" ? "vendor" : rawRole;

  const displayName = user?.full_name || user?.name || "Akun";
  const firstName = displayName.split(" ")[0] || "Akun";
  const username = user?.username || "admin";
  const profileUrl = `/profile/${username}`;
  const avatarUrl =
    user?.avatar_url ||
    user?.avatar ||
    `https://i.pravatar.cc/150?u=${username}`;

  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          { label: "Admin Panel", href: "/admin", icon: Layers },
          { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
          { label: "Profile", href: profileUrl, icon: User },
          { label: "Wallet", href: "/wallet", icon: Wallet },
          { label: "Orders", href: "/orders", icon: Package },
          { label: "My Coupons", href: "/my-coupons", icon: Tag },
          { label: "Messages", href: "/messages", icon: MessageSquare },
          { label: "Profile Settings", href: "/settings/edit-profile", icon: Settings },
        ];
      case "vendor":
        return [
          { label: "Seller Panel", href: "/dashboard", icon: Store },
          { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
          { label: "Profile", href: profileUrl, icon: User },
          { label: "Wallet", href: "/wallet", icon: Wallet },
          { label: "Sales", href: "/dashboard/sales", icon: TrendingUp },
          { label: "My Coupons", href: "/my-coupons", icon: Tag },
          { label: "Messages", href: "/messages", icon: MessageSquare },
          { label: "Profile Settings", href: "/settings/edit-profile", icon: Settings },
        ];
      case "moderator":
        return [
          { label: "Admin Panel", href: "/admin", icon: Layers },
          { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
          { label: "Profile", href: profileUrl, icon: User },
          { label: "Messages", href: "/messages", icon: MessageSquare },
          { label: "Profile Settings", href: "/settings/edit-profile", icon: Settings },
        ];
      case "member":
      default:
        return [
          { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
          { label: "Profile", href: profileUrl, icon: User },
          { label: "Wallet", href: "/wallet", icon: Wallet },
          { label: "Orders", href: "/orders", icon: Package },
          { label: "My Coupons", href: "/my-coupons", icon: Tag },
          { label: "Messages", href: "/messages", icon: MessageSquare },
          { label: "Profile Settings", href: "/settings/edit-profile", icon: Settings },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-gray-100 transition-all duration-200 focus:outline-none cursor-pointer">
        <img
          src={avatarUrl}
          alt={displayName}
          className="size-8 rounded-full object-cover border border-teal-500/40 transition-transform duration-200 group-hover:scale-105"
        />
        <span className="hidden text-sm font-semibold text-gray-800 md:inline max-w-[120px] truncate">
          {firstName}
        </span>
        <ChevronDown className="size-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.label}
              asChild
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600 hover:translate-x-1 transition-all duration-150 rounded-none cursor-pointer w-full font-normal"
            >
              <Link href={item.href}>
                <Icon className="size-4 text-gray-500 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}

        {/* Divider */}
        <DropdownMenuSeparator className="border-t border-gray-200 my-1 mx-0 h-0 bg-transparent" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 hover:translate-x-1 transition-all duration-150 rounded-none cursor-pointer w-full font-normal"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-gray-500 shrink-0" />
          ) : (
            <LogOut className="size-4 text-gray-500 shrink-0 transition-transform duration-150 group-hover:scale-110" />
          )}
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
