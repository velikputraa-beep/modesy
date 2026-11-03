"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Paintbrush,
  Sliders,
  Layout,
  ShoppingCart,
  FileText,
  RotateCcw,
  Package,
  MessageSquare,
  Folder,
  Tag,
  Sparkles,
  ToggleLeft,
  CreditCard,
  TrendingUp,
  Wallet,
  MapPin,
  Users,
  Key,
  HelpCircle,
  Database,
  Wrench,
  Megaphone,
  Send,
  Star,
  Mail,
  Link as LinkIcon,
  AlertTriangle,
  Ban,
  ListOrdered,
  Settings,
  Download,
  ChevronDown,
  X,
} from "lucide-react";
import { hasPermission } from "@/lib/permissions";
import { useToast } from "@/components/ui/toast-context";
import { motion, AnimatePresence } from "framer-motion";

export function AdminSidebar({ isOpen, onClose, user }) {
  const pathname = usePathname();
  const { toast } = useToast();

  // Helper untuk cek izin akses menu per role
  const canShow = (permKey) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "moderator") {
      const modAllowed = [
        "admin-panel",
        "slider",
        "homepage-manager",
        "products",
        "quote-requests",
        "categories",
        "custom-fields",
        "contact-messages",
        "reviews",
        "comments",
        "abuse-reports",
        "tags",
        "preferences",
      ];
      return modAllowed.includes(permKey);
    }
    return false;
  };

  // State accordion
  const [openMenus, setOpenMenus] = useState({
    orders: false,
    products: false,
    payments: false,
    earnings: false,
    payouts: false,
    blog: false,
    location: false,
    membership: false,
    helpCenter: false,
    comments: false,
    settings: false,
  });

  // Otomatis buka accordion jika sub-route aktif
  useEffect(() => {
    setOpenMenus((prev) => ({
      ...prev,
      orders: pathname.startsWith("/admin/orders"),
      products: pathname.startsWith("/admin/products"),
      payments: pathname.startsWith("/admin/payments"),
      earnings: pathname.startsWith("/admin/earnings"),
      payouts: pathname.startsWith("/admin/payouts"),
      blog: pathname.startsWith("/admin/blog"),
      location: pathname.startsWith("/admin/location"),
      membership: pathname.startsWith("/admin/membership"),
      helpCenter: pathname.startsWith("/admin/help-center"),
      comments: pathname.startsWith("/admin/comments"),
      settings: pathname.startsWith("/admin/settings"),
    }));
  }, [pathname]);

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Definisi Menu Groups
  const groups = [
    {
      title: "NAVIGATION",
      items: [
        { label: "Home", href: "/admin", icon: Home, perm: "admin-panel", exact: true },
        { label: "Theme", href: "/admin/theme", icon: Paintbrush, perm: "theme" },
        { label: "Slider", href: "/admin/slider", icon: Sliders, perm: "slider" },
        { label: "Homepage Manager", href: "/admin/homepage-manager", icon: Layout, perm: "homepage-manager" },
      ],
    },
    {
      title: "ORDERS",
      items: [
        {
          label: "Orders",
          icon: ShoppingCart,
          perm: "orders",
          accordionKey: "orders",
          children: [
            { label: "Orders", href: "/admin/orders", exact: true },
            { label: "Transactions", href: "/admin/orders/transactions" },
          ],
        },
        { label: "Digital Sales", href: "/admin/digital-sales", icon: FileText, perm: "digital-sales" },
        { label: "Refund Requests", href: "/admin/refund-requests", icon: RotateCcw, perm: "refund-requests" },
      ],
    },
    {
      title: "PRODUCTS",
      items: [
        {
          label: "Products",
          icon: Package,
          perm: "products",
          accordionKey: "products",
          children: [
            { label: "Products", href: "/admin/products", exact: true },
            { label: "Featured Products", href: "/admin/products/featured" },
            { label: "Special Offers", href: "/admin/products/special-offers" },
            { label: "Pending Products", href: "/admin/products/pending" },
            { label: "Hidden Products", href: "/admin/products/hidden" },
            { label: "Expired Products", href: "/admin/products/expired" },
            { label: "Sold Products", href: "/admin/products/sold" },
            { label: "Drafts", href: "/admin/products/drafts" },
            { label: "Deleted Products", href: "/admin/products/deleted" },
            { label: "Add Product", href: "/dashboard/add-product" },
            { label: "Bulk Product Upload", href: "/dashboard/bulk-upload" },
          ],
        },
        { label: "Quote Requests", href: "/admin/quote-requests", icon: MessageSquare, perm: "quote-requests" },
        { label: "Categories", href: "/admin/categories", icon: Folder, perm: "categories" },
        { label: "Tags", href: "/admin/tags", icon: Tag, perm: "tags" },
        { label: "Brands", href: "/admin/brands", icon: Sparkles, perm: "brands" },
        { label: "Custom Fields", href: "/admin/custom-fields", icon: ToggleLeft, perm: "custom-fields" },
      ],
    },
    {
      title: "PAYMENTS",
      items: [
        {
          label: "Payments",
          icon: CreditCard,
          perm: "payments",
          accordionKey: "payments",
          children: [
            { label: "Membership Payments", href: "/admin/payments/membership" },
            { label: "Promotion Payments", href: "/admin/payments/promotion" },
            { label: "Wallet Deposits", href: "/admin/payments/wallet-deposits" },
            { label: "Bank Transfer Reports", href: "/admin/payments/bank-transfer" },
          ],
        },
        {
          label: "Earnings",
          icon: TrendingUp,
          perm: "earnings",
          accordionKey: "earnings",
          children: [
            { label: "Earnings", href: "/admin/earnings", exact: true },
            { label: "Seller Balances", href: "/admin/earnings/seller-balances" },
          ],
        },
        {
          label: "Payouts",
          icon: Wallet,
          perm: "payouts",
          accordionKey: "payouts",
          children: [
            { label: "Add Payout", href: "/admin/payouts/add" },
            { label: "Payout Requests", href: "/admin/payouts/requests" },
            { label: "Payout Settings", href: "/admin/payouts/settings" },
          ],
        },
      ],
    },
    {
      title: "CONTENT",
      items: [
        { label: "Pages", href: "/admin/pages", icon: FileText, perm: "pages" },
        {
          label: "Blog",
          icon: FileText,
          perm: "blog",
          accordionKey: "blog",
          children: [
            { label: "Posts", href: "/admin/blog/posts" },
            { label: "Categories", href: "/admin/blog/categories" },
          ],
        },
        {
          label: "Location",
          icon: MapPin,
          perm: "location",
          accordionKey: "location",
          children: [
            { label: "Countries", href: "/admin/location/countries" },
            { label: "States", href: "/admin/location/states" },
            { label: "Cities", href: "/admin/location/cities" },
          ],
        },
      ],
    },
    {
      title: "MEMBERSHIP",
      items: [
        {
          label: "Membership",
          icon: Users,
          perm: "membership",
          accordionKey: "membership",
          children: [
            { label: "Users", href: "/admin/membership/users" },
            { label: "Membership Plans", href: "/admin/membership/plans" },
            { label: "Shop Opening Requests", href: "/admin/membership/shop-requests" },
            { label: "User Login Activities", href: "/admin/membership/login-activities" },
            { label: "Account Deletion Requests", href: "/admin/membership/deletion-requests" },
          ],
        },
        { label: "Roles & Permissions", href: "/admin/roles", icon: Key, perm: "roles-permissions" },
      ],
    },
    {
      title: "MANAGEMENT TOOLS",
      items: [
        {
          label: "Help Center",
          icon: HelpCircle,
          perm: "help-center",
          accordionKey: "helpCenter",
          children: [
            { label: "Support Tickets", href: "/admin/help-center/tickets" },
            { label: "Knowledge Base", href: "/admin/help-center/knowledge-base" },
          ],
        },
        { label: "Cache System", href: "/admin/cache", icon: Database, perm: "cache-system" },
        { label: "SEO Tools", href: "/admin/seo", icon: Wrench, perm: "seo-tools" },
        { label: "Ad Spaces", href: "/admin/ads", icon: Megaphone, perm: "ad-spaces" },
        { label: "Chat Messages", href: "/admin/chat-messages", icon: MessageSquare, perm: "chat-messages" },
        { label: "Contact Messages", href: "/admin/contact-messages", icon: Send, perm: "contact-messages" },
        { label: "Reviews", href: "/admin/reviews", icon: Star, perm: "reviews" },
        {
          label: "Comments",
          icon: MessageSquare,
          perm: "comments",
          accordionKey: "comments",
          children: [
            { label: "Product Comments", href: "/admin/comments/product" },
            { label: "Blog Comments", href: "/admin/comments/blog" },
          ],
        },
        { label: "Newsletter", href: "/admin/newsletter", icon: Mail, perm: "newsletter" },
        { label: "Affiliate Program", href: "/admin/affiliate", icon: LinkIcon, perm: "affiliate" },
        { label: "Abuse Reports", href: "/admin/abuse-reports", icon: AlertTriangle, perm: "abuse-reports" },
        { label: "Email Blacklist", href: "/admin/email-blacklist", icon: Ban, perm: "email-blacklist" },
      ],
    },
    {
      title: "SETTINGS",
      items: [
        { label: "Preferences", href: "/admin/preferences", icon: ListOrdered, perm: "preferences" },
        {
          label: "Settings",
          icon: Settings,
          perm: "settings",
          accordionKey: "settings",
          children: [
            { label: "General Settings", href: "/admin/settings/general" },
            { label: "Language Settings", href: "/admin/settings/language" },
            { label: "Product Settings", href: "/admin/settings/product" },
            { label: "Payment Settings", href: "/admin/settings/payment" },
            { label: "Currency Settings", href: "/admin/settings/currency" },
            { label: "Email Settings", href: "/admin/settings/email" },
            { label: "Social Login", href: "/admin/settings/social" },
            { label: "Visual Settings", href: "/admin/settings/visual" },
            { label: "Font Settings", href: "/admin/settings/font" },
            { label: "Route Settings", href: "/admin/settings/route" },
          ],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#1E293B] text-slate-300 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none lg:static shrink-0 ${
          isOpen
            ? "translate-x-0 lg:ml-0"
            : "-translate-x-full lg:translate-x-0 lg:-ml-64"
        }`}
      >
        {/* Header Sidebar */}
        <div className="p-4 border-b border-slate-750 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xl font-bold tracking-tight text-white hover:text-teal-400 transition-colors">
              Modesy Panel
            </Link>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/60"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-700/50 flex items-center gap-3 shrink-0 bg-slate-900/30">
          <img
            src={user?.avatar_url || "https://i.pravatar.cc/150?u=admin"}
            alt={user?.full_name || "User"}
            className="size-10 rounded-full object-cover border-2 border-slate-600 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {user?.full_name || "Admin"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 no-scrollbar">
          {groups.map((group) => {
            // Filter items sesuai permission user
            const visibleItems = group.items.filter((item) => canShow(item.perm));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <div className="px-3 text-[11px] font-bold tracking-wider uppercase text-slate-400 mt-2 mb-1">
                  {group.title}
                </div>

                {visibleItems.map((item) => {
                  const Icon = item.icon;

                  // 1. Accordion item
                  if (item.children) {
                    const isExpanded = !!openMenus[item.accordionKey];
                    const hasActiveChild = item.children.some((c) =>
                      c.exact ? pathname === c.href : pathname.startsWith(c.href)
                    );

                    return (
                      <div key={item.label} className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => toggleMenu(item.accordionKey)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer group hover:translate-x-1 ${
                            hasActiveChild
                              ? "text-white bg-slate-700/60"
                              : "text-slate-300 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className="size-4 shrink-0 text-slate-400 group-hover:text-white transition-colors" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <ChevronDown
                            className={`size-4 text-slate-400 transition-transform duration-300 shrink-0 ${
                              isExpanded ? "rotate-180 text-white" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="bg-[#162032] py-1 pl-8 pr-2 rounded-md space-y-0.5 mt-0.5 border-l-2 border-slate-700 ml-3">
                                {item.children.map((child) => {
                                  const isChildActive = child.exact
                                    ? pathname === child.href
                                    : pathname.startsWith(child.href);

                                  return (
                                    <Link
                                      key={child.href + child.label}
                                      href={child.href}
                                      onClick={() => {
                                        if (window.innerWidth < 1024) onClose();
                                      }}
                                      className={`block px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 hover:translate-x-1 ${
                                        isChildActive
                                          ? "bg-teal-600 text-white font-semibold"
                                          : "text-slate-400 hover:text-white hover:bg-slate-800/80"
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

                  // 2. Single item
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                        isActive
                          ? "bg-teal-600 text-white font-semibold shadow-xs"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom Sidebar */}
        <div className="p-3 border-t border-slate-750 shrink-0 bg-slate-900/40">
          <button
            type="button"
            onClick={() => toast.info("Database backup sedang diproses...")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all duration-200 hover:scale-102 active:scale-98 shadow-xs cursor-pointer"
          >
            <Download className="size-3.5 text-slate-400" />
            <span>Download Database Backup</span>
          </button>
        </div>
      </aside>
    </>
  );
}
