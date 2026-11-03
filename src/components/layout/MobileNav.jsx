"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ChevronRight,
  Home,
  ShoppingBag,
  BookOpen,
  HelpCircle,
  Mail,
  Store,
  Layers,
  LayoutGrid,
  LogOut,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logoutAction } from "@/app/(auth)/actions";
import { clearLocalCart } from "@/lib/cart-storage";
import { Button } from "@/components/ui/button";

export function MobileNav({ user, categories = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on pathname change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const rawRole = user?.role?.toLowerCase() || "member";
  const role = rawRole === "buyer" ? "member" : rawRole === "seller" ? "vendor" : rawRole;
  const username = user?.username || "user";
  const displayName = user?.full_name || user?.name || "Akun";
  const avatarUrl =
    user?.avatar_url ||
    user?.avatar ||
    `https://i.pravatar.cc/150?u=${username}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-700 hover:bg-gray-100 lg:hidden cursor-pointer active:scale-95 transition-all"
        aria-label="Open mobile menu"
      >
        <Menu className="size-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Offcanvas Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/70">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-baseline select-none"
                >
                  <span className="text-2xl font-black tracking-tight text-gray-950 font-sans">
                    <span className="text-teal-600">M</span>odes
                    <span className="text-teal-600">y</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* User Section (Mobile) */}
              <div className="p-4 border-b border-gray-100 bg-white">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="size-10 rounded-full object-cover border border-teal-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {displayName}
                        </p>
                        <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 capitalize">
                          {role}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {role === "admin" || role === "moderator" ? (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800"
                        >
                          <Layers className="size-3.5" />
                          <span>Admin</span>
                        </Link>
                      ) : null}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-teal-600 text-white rounded-md text-xs font-medium hover:bg-teal-700"
                      >
                        <LayoutGrid className="size-3.5" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href={`/profile/${username}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50"
                      >
                        <User className="size-3.5" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/dashboard/add-product"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 border border-teal-600 text-teal-700 rounded-md text-xs font-medium hover:bg-teal-50"
                      >
                        <Store className="size-3.5" />
                        <span>Sell Now</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                      >
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          Register
                        </Link>
                      </Button>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white text-xs"
                    >
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        Sell on Modesy
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Scrollable Nav Items */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {/* Navigation Links */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Navigation
                  </h4>
                  <nav className="space-y-1">
                    <Link
                      href="/"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <Home className="size-4 text-gray-400" />
                      <span>Home</span>
                    </Link>
                    <Link
                      href="/products"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <ShoppingBag className="size-4 text-gray-400" />
                      <span>All Products</span>
                    </Link>
                    <Link
                      href="/blog"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <BookOpen className="size-4 text-gray-400" />
                      <span>Blog</span>
                    </Link>
                    <Link
                      href="/help-center"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <HelpCircle className="size-4 text-gray-400" />
                      <span>Help Center</span>
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <Mail className="size-4 text-gray-400" />
                      <span>Contact</span>
                    </Link>
                  </nav>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Categories
                    </h4>
                    <div className="space-y-0.5">
                      {categories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={cat.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors"
                        >
                          <span>{cat.name}</span>
                          <ChevronRight className="size-3.5 text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer in Drawer */}
              {user && (
                <div className="p-3 border-t border-gray-100 bg-gray-50/60">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsOpen(false);
                      clearLocalCart();
                      await logoutAction();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
