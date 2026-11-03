"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Tag, DownloadCloud, Flag } from "lucide-react";

const navItems = [
  {
    name: "Orders",
    href: "/orders",
    icon: Package,
    isActive: (pathname) => pathname === "/orders",
  },
  {
    name: "Quote Requests",
    href: "/orders/quote-requests",
    icon: Tag,
    isActive: (pathname) => pathname.startsWith("/orders/quote-requests"),
  },
  {
    name: "Downloads",
    href: "/orders/downloads",
    icon: DownloadCloud,
    isActive: (pathname) => pathname.startsWith("/orders/downloads"),
  },
  {
    name: "Refund Requests",
    href: "/orders/refund-requests",
    icon: Flag,
    isActive: (pathname) => pathname.startsWith("/orders/refund-requests"),
  },
];

export function OrdersSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full">
      <nav className="flex md:flex-col overflow-x-auto md:overflow-visible no-scrollbar gap-1 bg-white p-2 rounded-lg border border-gray-200/80 shadow-2xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm whitespace-nowrap transition-colors ${
                active
                  ? "bg-gray-100 text-gray-900 font-semibold shadow-2xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`size-4.5 shrink-0 ${
                  active ? "text-gray-800" : "text-gray-500"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
