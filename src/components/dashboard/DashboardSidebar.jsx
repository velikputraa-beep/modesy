"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  UploadCloud,
  ShoppingBasket,
  ShoppingCart,
  Tag,
  Ticket,
  Flag,
  Banknote,
  CreditCard,
  MessageSquare,
  Star,
  Settings,
  FileText,
  Truck,
  ChevronLeft,
  X,
} from "lucide-react";
import { isVendor, isMember, isAdmin } from "@/lib/auth-utils";
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/permissions";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardSidebar({ isOpen, onClose, user }) {
  const pathname = usePathname();

  // Role permissions: Buyer cuma lihat menu tertentu
  const isBuyerRole = isMember(user) && !isVendor(user);

  // Accordion state
  const [openMenus, setOpenMenus] = useState({
    products: false,
    sales: false,
    payments: false,
  });

  // Auto-expand accordion when active subroute is visited
  useEffect(() => {
    setOpenMenus((prev) => ({
      ...prev,
      products: pathname.startsWith("/dashboard/products"),
      sales: pathname.startsWith("/dashboard/sales"),
      payments: pathname.startsWith("/dashboard/payments"),
    }));
  }, [pathname]);

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Menu structure definition
  const menuGroups = [
    {
      title: "NAVIGATION",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          exact: true,
          vendorOnly: false,
        },
      ],
    },
    {
      title: "PRODUCTS",
      vendorOnly: true,
      items: [
        {
          label: "Add Product",
          href: "/dashboard/add-product",
          icon: Plus,
          vendorOnly: true,
        },
        {
          label: "Bulk Product Upload",
          href: "/dashboard/bulk-upload",
          icon: UploadCloud,
          vendorOnly: true,
        },
        {
          label: "Products",
          icon: ShoppingBasket,
          accordionKey: "products",
          vendorOnly: true,
          children: [
            { label: "Products", href: "/dashboard/products", exact: true },
            { label: "Pending Products", href: "/dashboard/products/pending" },
            { label: "Hidden Products", href: "/dashboard/products/hidden" },
            { label: "Sold Products", href: "/dashboard/products/sold" },
            { label: "Drafts", href: "/dashboard/products/drafts" },
          ],
        },
      ],
    },
    {
      title: "SALES",
      items: [
        {
          label: "Sales",
          icon: ShoppingCart,
          accordionKey: "sales",
          vendorOnly: true,
          children: [
            { label: "Active Sales", href: "/dashboard/sales/active" },
            { label: "Completed Sales", href: "/dashboard/sales/completed" },
            { label: "Cancelled Sales", href: "/dashboard/sales/cancelled" },
          ],
        },
        {
          label: "Quote Requests",
          href: "/dashboard/quote-requests",
          icon: Tag,
          badge: "1",
          vendorOnly: false,
        },
        {
          label: "Coupons",
          href: "/dashboard/coupons",
          icon: Ticket,
          vendorOnly: false,
        },
        {
          label: "Refund Requests",
          href: "/dashboard/refund-requests",
          icon: Flag,
          badge: "1",
          vendorOnly: false,
        },
        {
          label: "Cash on Delivery",
          href: "/dashboard/cash-on-delivery",
          icon: Banknote,
          vendorOnly: true,
        },
      ],
    },
    {
      title: "PAYMENTS",
      vendorOnly: true,
      items: [
        {
          label: "Payments",
          icon: CreditCard,
          accordionKey: "payments",
          vendorOnly: true,
          children: [
            { label: "Membership Payments", href: "/dashboard/payments/membership" },
            { label: "Promotion Payments", href: "/dashboard/payments/promotion" },
          ],
        },
      ],
    },
    {
      title: "COMMENTS",
      items: [
        {
          label: "Comments",
          href: "/dashboard/comments",
          icon: MessageSquare,
          vendorOnly: false,
        },
        {
          label: "Reviews",
          href: "/dashboard/reviews",
          icon: Star,
          vendorOnly: false,
        },
      ],
    },
    {
      title: "SETTINGS",
      vendorOnly: true,
      items: [
        {
          label: "Shop Settings",
          href: "/dashboard/shop-settings",
          icon: Settings,
          vendorOnly: true,
        },
        {
          label: "Shop Policies",
          href: "/dashboard/shop-policies",
          icon: FileText,
          vendorOnly: true,
        },
        {
          label: "Shipping Settings",
          href: "/dashboard/shipping-settings",
          icon: Truck,
          vendorOnly: true,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out flex flex-col shrink-0 lg:static overflow-y-auto ${
          isOpen
            ? "translate-x-0 lg:ml-0 opacity-100"
            : "-translate-x-full lg:translate-x-0 lg:-ml-64 lg:opacity-0 lg:pointer-events-none"
        }`}
      >
        {/* Close/Hide sidebar button */}
        <div className="flex justify-end p-2 pb-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Hide Sidebar"
            aria-label="Hide sidebar"
          >
            <ChevronLeft className="size-4.5 hidden lg:block" />
            <X className="size-5 lg:hidden" />
          </button>
        </div>

        {/* HEADER SIDEBAR (PUTIH) */}
        <div className="pt-4 pb-4 px-4 border-b border-gray-100 flex flex-col items-center shrink-0">
          {/* Logo Modesy */}
          <Link
            href="/dashboard"
            className="text-2xl font-bold tracking-tight text-gray-900 select-none hover:opacity-90 transition-opacity"
          >
            <span className="text-[#14B8A6]">M</span>
            odes
            <span className="text-[#14B8A6]">y</span>
          </Link>

          {/* Avatar bulat BESAR (size-20) dengan border teal 2px */}
          <div className="mt-4 relative">
            <img
              src={user?.avatar_url || "https://i.pravatar.cc/150?u=user"}
              alt={user?.full_name || "User"}
              className="size-20 rounded-full object-cover border-2 border-[#14B8A6] mx-auto shadow-xs"
            />
          </div>

          {/* Teks "Hi, {user.full_name}" */}
          <h2 className="text-base font-bold text-gray-800 text-center mt-3 truncate max-w-full px-2">
            Hi, {user?.full_name || "User"}
          </h2>

          {/* Badge role (Vendor/Member) pakai ROLE_COLORS */}
          <div className="mt-1.5 text-center">
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${
                ROLE_COLORS[user?.role] || ROLE_COLORS.member
              }`}
            >
              {ROLE_LABELS[user?.role] || (isBuyerRole ? "Member" : "Vendor")}
            </span>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-3 space-y-4">
          {menuGroups.map((group) => {
            // Sembunyikan group khusus vendor jika user adalah Buyer
            if (isBuyerRole && group.vendorOnly) return null;

            // Filter item di dalam group
            const visibleItems = group.items.filter((item) => {
              if (isBuyerRole && item.vendorOnly) return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                {/* Group label UPPERCASE */}
                <div className="text-xs uppercase text-gray-400 mt-4 mb-2 px-3 font-semibold tracking-wider">
                  {group.title}
                </div>

                {visibleItems.map((item) => {
                  const Icon = item.icon;

                  // 1. Accordion menu item
                  if (item.children) {
                    const isExpanded = !!openMenus[item.accordionKey];
                    const hasActiveChild = item.children.some((child) =>
                      child.exact
                        ? pathname === child.href
                        : pathname.startsWith(child.href)
                    );

                    return (
                      <div key={item.label} className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => toggleMenu(item.accordionKey)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 cursor-pointer font-medium hover:translate-x-1 ${
                            hasActiveChild
                              ? "bg-teal-50 text-teal-600 border-l-4 border-teal-600 font-semibold"
                              : "text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className="size-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {/* Chevron accordion: ChevronLeft rotate saat expand */}
                          <ChevronLeft
                            className={`size-4 text-gray-400 transition-transform duration-300 shrink-0 ${
                              isExpanded ? "-rotate-90 text-teal-600" : ""
                            }`}
                          />
                        </button>

                        {/* Accordion children submenu */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pl-9 pr-2 py-1 space-y-1">
                                {item.children.map((child) => {
                                  const isChildActive = child.exact
                                    ? pathname === child.href
                                    : pathname.startsWith(child.href);

                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      onClick={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                                          onClose();
                                        }
                                      }}
                                      className={`block px-3 py-1.5 rounded-md text-sm transition-all duration-150 hover:translate-x-1 ${
                                        isChildActive
                                          ? "text-teal-600 font-semibold bg-teal-50/60"
                                          : "text-gray-600 hover:text-teal-600 hover:bg-gray-50 font-normal"
                                      }`}
                                    >
                                      {child.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  // 2. Normal link item
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 font-medium hover:translate-x-1 ${
                        isActive
                          ? "bg-teal-50 text-teal-600 border-l-4 border-teal-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {/* Badge notif */}
                      {item.badge && (
                        <span className="bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-bold ml-auto shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Hide Sidebar button di bagian bawah menu */}
        <div className="p-3 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer group"
          >
            <ChevronLeft className="size-4 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:-translate-x-0.5" />
            <span>Hide Sidebar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
