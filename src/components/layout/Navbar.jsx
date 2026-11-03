import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { getCurrentUser } from "@/lib/mock-auth";
import { getNavCategories } from "@/lib/queries/categories";
import { UserMenu } from "@/components/layout/UserMenu";
import { NavbarIcons } from "@/components/layout/NavbarIcons";
import { MobileNav } from "@/components/layout/MobileNav";
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/permissions";

export async function Navbar() {
  const [user, navCategories] = await Promise.all([getCurrentUser(), getNavCategories()]);
  const rawRole = user?.role?.toLowerCase() || "member";
  const role = rawRole === "buyer" ? "member" : rawRole === "seller" ? "vendor" : rawRole;
  const roleColor = user ? (ROLE_COLORS[role] || ROLE_COLORS.member) : "";
  const roleLabel = user ? (ROLE_LABELS[role] || "Member") : "";
  const sellHref = user ? "/dashboard/add-product" : "/login";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-xs">
      {/* Baris Utama Navbar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-3">
            <MobileNav user={user} categories={navCategories} />

            <Link href="/" className="flex items-baseline select-none transition-transform duration-200 hover:scale-105 active:scale-95">
              <span className="text-2xl font-black tracking-tight sm:text-3xl text-gray-950 font-sans">
                <span className="text-teal-600">M</span>
                odes
                <span className="text-teal-600">y</span>
              </span>
            </Link>
          </div>

          {/* Search Bar Tengah */}
          <div className="hidden flex-1 items-center justify-center px-2 md:flex md:max-w-xl lg:max-w-2xl">
            <form action="/products" method="GET" className="relative w-full">
              <input
                type="text"
                name="search"
                placeholder="Search for products, categories or brands"
                className="w-full rounded-md border border-transparent bg-gray-100 py-2.5 pl-4 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-md text-gray-500 hover:text-teal-600 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                aria-label="Search"
              >
                <Search className="size-4" />
              </button>
            </form>
          </div>

          {/* Sisi Kanan: Icons, Sign In / UserMenu & Sell Now */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Mobile Search Button */}
            <Link
              href="/products"
              className="text-gray-600 hover:text-teal-600 hover:scale-110 active:scale-95 transition-all duration-200 md:hidden cursor-pointer"
              aria-label="Search mobile"
            >
              <Search className="size-5" />
            </Link>

            {/* Navbar Icons (Cart, Heart, MessageCircle) */}
            <NavbarIcons user={user} />

            {/* User Auth or Sign In & Sell Now */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <UserMenu user={user} />
                  <span
                    className={`hidden md:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleColor}`}
                  >
                    {roleLabel}
                  </span>
                </div>
                <div className="hidden sm:inline-block">
                  <Link
                    href={sellHref}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 inline-flex items-center justify-center whitespace-nowrap cursor-pointer"
                  >
                    Sell Now
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="hidden text-sm font-medium text-gray-700 hover:text-teal-600 sm:inline transition-colors hover:scale-105"
                >
                  Sign In
                </Link>
                <Link
                  href={sellHref}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 inline-flex items-center justify-center whitespace-nowrap cursor-pointer"
                >
                  Sell Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="pb-3 md:hidden">
          <form action="/products" method="GET" className="relative w-full">
            <input
              type="text"
              name="search"
              placeholder="Search for products, categories..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-3.5 pr-10 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Search mobile form"
            >
              <Search className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Menu Kategori Horizontal */}
      {navCategories.length > 0 && (
        <div className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-6 overflow-x-auto py-2.5 text-xs font-semibold text-gray-700 no-scrollbar sm:text-sm">
              {navCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="group relative shrink-0 whitespace-nowrap py-1 transition-colors duration-200 hover:text-teal-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-teal-600 hover:after:w-full after:transition-all after:duration-250"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
