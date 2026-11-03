"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Wallet,
  Eye,
  ShoppingBag,
  Heart,
  MessageSquare,
  Star,
  Minus,
  X,
} from "lucide-react";
import { formatPriceIDR } from "@/lib/utils";

import { isMember, isVendor, isAdmin } from "@/lib/auth-utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function compactRp(value) {
  if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)} M`;
  if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)} jt`;
  if (value >= 1e3) return `Rp ${Math.round(value / 1e3)} rb`;
  return `Rp ${Math.round(value)}`;
}

export function DashboardHomeClient({ user, overview = null }) {
  const stats = overview?.stats || {};
  const sales = useMemo(() => overview?.sales || [], [overview]);
  const orders = useMemo(() => overview?.orders || [], [overview]);
  const reviews = useMemo(() => overview?.reviews || [], [overview]);
  const comments = useMemo(() => overview?.comments || [], [overview]);

  const donut = useMemo(() => {
    const total = sales.filter((s) => s.statusKey !== "cancelled").length;
    const completed = sales.filter((s) => s.statusKey === "completed").length;
    const active = total - completed;
    const circumference = 238.76;
    const completedArc = total ? (completed / total) * circumference : 0;
    const activeArc = total ? (active / total) * circumference : 0;
    return { total, completed, active, completedArc, activeArc, circumference };
  }, [sales]);

  const monthly = useMemo(() => {
    const year = new Date().getFullYear();
    const totals = Array.from({ length: 12 }, () => 0);
    sales.forEach((sale) => {
      if (sale.statusKey === "cancelled") return;
      const d = new Date(sale.createdAt);
      if (!Number.isNaN(d.getTime()) && d.getFullYear() === year) {
        totals[d.getMonth()] += Number(sale.total) || 0;
      }
    });
    const max = Math.max(...totals, 1);
    const hasData = totals.some((t) => t > 0);
    const points = totals.map((total, i) => ({
      label: MONTHS[i],
      total,
      x: 50 + i * 48,
      y: 180 - (hasData ? (total / max) * 140 : 0),
    }));
    return { year, max, points, hasData };
  }, [sales]);

  // Cek apakah user adalah Vendor (atau Admin) vs Member (Buyer)
  const isVendorUser = isVendor(user) || isAdmin(user) || user?.role === "vendor";

  if (!isVendorUser) {
    // ==========================================
    // BUYER (MEMBER) DASHBOARD
    // ==========================================
    const recentOrders = orders.slice(0, 5);

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6"
      >
        {/* Judul Dashboard */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">
          Dashboard
        </h1>

        {/* 4 Stat Cards Member */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1 — Total Orders (teal) */}
          <Link href="/orders" className="block group">
            <Card className="border-l-4 border-l-teal-500 border-gray-200 shadow-xs bg-white p-5 flex items-center justify-between group-hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <div>
                <div className="text-3xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                  {stats.orders ?? 0}
                </div>
                <div className="text-xs font-medium text-gray-500 mt-1">
                  Total Orders
                </div>
              </div>
              <ShoppingBag className="size-8 text-teal-500 shrink-0 group-hover:scale-110 transition-transform" />
            </Card>
          </Link>

          {/* Card 2 — Wishlist (red) */}
          <Link href="/wishlist" className="block group">
            <Card className="border-l-4 border-l-red-500 border-gray-200 shadow-xs bg-white p-5 flex items-center justify-between group-hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <div>
                <div className="text-3xl font-bold text-gray-900 group-hover:text-red-500 transition-colors">
                  {stats.wishlist ?? 0}
                </div>
                <div className="text-xs font-medium text-gray-500 mt-1">
                  Wishlist
                </div>
              </div>
              <Heart className="size-8 text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
            </Card>
          </Link>

          {/* Card 3 — Messages (blue) */}
          <Link href="/messages" className="block group">
            <Card className="border-l-4 border-l-blue-500 border-gray-200 shadow-xs bg-white p-5 flex items-center justify-between group-hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <div>
                <div className="text-3xl font-bold text-gray-900 group-hover:text-blue-500 transition-colors">
                  {stats.messages ?? 0}
                </div>
                <div className="text-xs font-medium text-gray-500 mt-1">
                  Messages
                </div>
              </div>
              <MessageSquare className="size-8 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
            </Card>
          </Link>

          {/* Card 4 — Reviews (yellow) */}
          <Link href="/dashboard/reviews" className="block group">
            <Card className="border-l-4 border-l-yellow-500 border-gray-200 shadow-xs bg-white p-5 flex items-center justify-between group-hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <div>
                <div className="text-3xl font-bold text-gray-900 group-hover:text-amber-500 transition-colors">
                  {stats.reviews ?? 0}
                </div>
                <div className="text-xs font-medium text-gray-500 mt-1">
                  Reviews
                </div>
              </div>
              <Star className="size-8 text-yellow-500 shrink-0 group-hover:scale-110 transition-transform" />
            </Card>
          </Link>
        </div>

        {/* Widget Recent Orders */}
        <Card className="border border-gray-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-4 px-5">
            <CardTitle className="text-base font-semibold text-gray-800">
              Recent Orders
            </CardTitle>
            <div className="flex items-center gap-2 text-gray-400">
              <Minus className="size-4 cursor-pointer hover:text-gray-600 transition-colors" />
              <X className="size-4 cursor-pointer hover:text-gray-600 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Product / Store</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 text-xs">
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-xs text-gray-400">
                        Belum ada pesanan.
                      </td>
                    </tr>
                  )}
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-teal-600">
                        {order.orderNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900 truncate max-w-[220px]">
                          {order.product}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {order.seller}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        {formatPriceIDR(order.total)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {order.date}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href="/orders"
                          className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* View All Button */}
            <div className="flex justify-end p-4 border-t border-gray-100">
              <Link
                href="/orders"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                View All
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ==========================================
  // VENDOR (SELLER) DASHBOARD
  // ==========================================
  const recentSales = sales.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Judul "Dashboard" (text-2xl font-bold mb-6) */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">
        Dashboard
      </h1>

      {/* 4 stat card PUTIH border-l-4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products: border-teal-500 */}
        <Link href="/dashboard/products" className="block group">
          <Card className="border-l-4 border-l-teal-500 border-gray-200 shadow-xs bg-white p-5 flex items-center justify-between group-hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div>
              <div className="text-3xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                {stats.products ?? 0}
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Total Products
              </div>
            </div>
            <Package className="size-8 text-teal-500 shrink-0 group-hover:scale-110 transition-transform" />
          </Card>
        </Link>

        {/* Sales: border-blue-500 */}
        <Link href="/dashboard/sales/active" className="block group">
          <Card className="border-l-4 border-l-blue-500 border-gray-200 shadow-xs bg-white p-5 flex items-center justify-between group-hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div>
              <div className="text-3xl font-bold text-gray-900 group-hover:text-blue-500 transition-colors">
                {stats.sales ?? 0}
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Sales
              </div>
            </div>
            <ShoppingCart className="size-8 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
          </Card>
        </Link>

        {/* Balance: border-green-500 */}
        <Link href="/wallet" className="block group">
          <Card className="border-l-4 border-l-green-500 border-gray-200 shadow-xs bg-white p-5 flex items-center justify-between group-hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div>
              <div className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                {formatPriceIDR(stats.balance ?? 0)}
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Balance
              </div>
            </div>
            <Wallet className="size-8 text-green-500 shrink-0 group-hover:scale-110 transition-transform" />
          </Card>
        </Link>

        {/* Views: border-purple-500 */}
        <Link href="/dashboard/products" className="block group">
          <Card className="border-l-4 border-l-purple-500 border-gray-200 shadow-xs bg-white p-5 flex items-center justify-between group-hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div>
              <div className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                {stats.views ?? 0}
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Views
              </div>
            </div>
            <Eye className="size-8 text-purple-500 shrink-0" />
          </Card>
        </Link>
      </div>

      {/* Row 2: Charts (Sales donut chart & Monthly sales chart persis seperti dashboard.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Donut Chart (col 5) */}
        <Card className="lg:col-span-5 border border-gray-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-3.5 px-5">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Sales
            </CardTitle>
            <div className="flex items-center gap-2 text-gray-400">
              <Minus className="size-3.5 cursor-pointer hover:text-gray-600" />
              <X className="size-3.5 cursor-pointer hover:text-gray-600" />
            </div>
          </CardHeader>
          <CardContent className="p-5 flex flex-col items-center">
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs font-medium text-gray-600 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-2 rounded bg-teal-400" />
                <span>Active Sales ({donut.active})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-2 rounded bg-indigo-500" />
                <span>Completed Sales ({donut.completed})</span>
              </div>
            </div>

            {/* SVG Donut Chart */}
            <div className="relative size-52 flex items-center justify-center my-1">
              <svg className="size-full -rotate-90 transition-transform duration-700" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="16"
                />
                {/* Segment 1: Completed Sales (Blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#6366F1"
                  strokeWidth="16"
                  strokeDasharray={`${donut.completedArc.toFixed(2)} ${donut.circumference}`}
                  strokeDashoffset="0"
                  className="transition-all duration-500 hover:stroke-[18px] cursor-pointer"
                />
                {/* Segment 2: Active Sales (Teal) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#14B8A6"
                  strokeWidth="16"
                  strokeDasharray={`${donut.activeArc.toFixed(2)} ${donut.circumference}`}
                  strokeDashoffset={`-${donut.completedArc.toFixed(2)}`}
                  className="transition-all duration-500 hover:stroke-[18px] cursor-pointer"
                />
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-2xl font-black text-gray-900 block leading-none">
                  {donut.total}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1 block">
                  Total Sales
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly sales Line/Area Chart (col 7) */}
        <Card className="lg:col-span-7 border border-gray-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-3.5 px-5">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Monthly sales
            </CardTitle>
            <div className="flex items-center gap-2 text-gray-400">
              <Minus className="size-3.5 cursor-pointer hover:text-gray-600" />
              <X className="size-3.5 cursor-pointer hover:text-gray-600" />
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {/* Legend */}
            <div className="flex justify-end mb-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-teal-500 text-[11px] text-gray-700 rounded">
                <span className="size-2 bg-teal-500 rounded-xs" />
                <span>Sales ({monthly.year})</span>
              </div>
            </div>

            {/* SVG Area Chart */}
            <div className="w-full h-56">
              <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line
                    key={i}
                    x1="45"
                    y1={30 + i * 30}
                    x2="590"
                    y2={30 + i * 30}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                ))}

                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <text
                    key={i}
                    x="40"
                    y={34 + i * 30}
                    textAnchor="end"
                    fontSize="9"
                    fill="#94A3B8"
                  >
                    {monthly.hasData
                      ? compactRp((monthly.max * (5 - i)) / 5)
                      : "0"}
                  </text>
                ))}

                {/* Area under curve */}
                <path
                  d={`M ${monthly.points[0].x} 180 ${monthly.points
                    .map((p) => `L ${p.x} ${p.y.toFixed(1)}`)
                    .join(" ")} L ${monthly.points[11].x} 180 Z`}
                  fill="url(#salesGrad)"
                />

                {/* Line */}
                <path
                  d={`M ${monthly.points.map((p) => `${p.x} ${p.y.toFixed(1)}`).join(" L ")}`}
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth="2.5"
                />

                {/* Data Points */}
                {monthly.points.map((p) => (
                  <circle
                    key={p.label}
                    cx={p.x}
                    cy={p.y.toFixed(1)}
                    r="3.5"
                    fill="#FFFFFF"
                    stroke="#14B8A6"
                    strokeWidth="2"
                  />
                ))}

                {/* X-axis Month Labels */}
                {monthly.points.map((p) => (
                  <text key={`label-${p.label}`} x={p.x} y="205" textAnchor="middle" fontSize="10" fill="#64748B">
                    {p.label}
                  </text>
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Latest Comments & Latest Reviews (seperti di dashboard.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Comments Card */}
        <Card className="border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-semibold text-gray-800">
                Latest Comments
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-400">
                <Minus className="size-3.5 cursor-pointer hover:text-gray-600" />
                <X className="size-3.5 cursor-pointer hover:text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {comments.length === 0 ? (
                <div className="min-h-[140px] flex items-center justify-center">
                  <p className="text-xs text-gray-400">No records found!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-semibold text-gray-500 border-b border-gray-100 bg-gray-50/50">
                      <tr>
                        <th className="px-4 py-2">Komentar</th>
                        <th className="px-4 py-2">Produk</th>
                        <th className="px-4 py-2 whitespace-nowrap">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {comments.slice(0, 4).map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/60">
                          <td className="px-4 py-2.5 max-w-[220px]">
                            <p className="line-clamp-2 text-gray-600 text-[11px] leading-tight">
                              {c.comment}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{c.user}</p>
                          </td>
                          <td className="px-4 py-2.5 text-gray-800 font-medium">
                            {c.productSlug ? (
                              <Link href={`/products/${c.productSlug}`} className="hover:text-teal-600">
                                {c.product}
                              </Link>
                            ) : (
                              c.product
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{c.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </div>
          <div className="flex justify-end p-3 border-t border-gray-100">
            <Link
              href="/dashboard/comments"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
            >
              View All
            </Link>
          </div>
        </Card>

        {/* Latest Reviews Card */}
        <Card className="border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-semibold text-gray-800">
                Latest Reviews
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-400">
                <Minus className="size-3.5 cursor-pointer hover:text-gray-600" />
                <X className="size-3.5 cursor-pointer hover:text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-semibold text-gray-500 border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-2 w-12">Id</th>
                      <th className="px-4 py-2">Comment</th>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2 whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-xs text-gray-400">
                          No records found!
                        </td>
                      </tr>
                    )}
                    {reviews.map((rev, idx) => (
                      <tr key={rev.id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-2.5 font-medium text-gray-600">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2.5 max-w-[200px]">
                          <div className="flex items-center gap-0.5 text-amber-400 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`size-3 ${
                                  i < rev.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="line-clamp-2 text-gray-600 text-[11px] leading-tight">
                            {rev.comment}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 text-gray-800 font-medium">
                          {rev.productSlug ? (
                            <Link href={`/products/${rev.productSlug}`} className="hover:text-teal-600">
                              {rev.product}
                            </Link>
                          ) : (
                            rev.product
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                          {rev.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </div>
          <div className="flex justify-end p-3 border-t border-gray-100">
            <Link
              href="/dashboard/reviews"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
            >
              View All
            </Link>
          </div>
        </Card>
      </div>

      {/* Row 4: Widget Recent Sales (tabel 5 baris persis seperti dashboard.png) */}
      <Card className="border border-gray-200 bg-white shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-3.5 px-5">
          <CardTitle className="text-sm font-semibold text-gray-800">
            Latest Sales
          </CardTitle>
          <div className="flex items-center gap-2 text-gray-400">
            <Minus className="size-3.5 cursor-pointer hover:text-gray-600" />
            <X className="size-3.5 cursor-pointer hover:text-gray-600" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/60 text-[11px] font-semibold text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-2.5">Sale</th>
                  <th className="px-5 py-2.5">Status</th>
                  <th className="px-5 py-2.5">Payment</th>
                  <th className="px-5 py-2.5">Date</th>
                  <th className="px-5 py-2.5 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-xs text-gray-400">
                      No records found!
                    </td>
                  </tr>
                )}
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      {sale.orderNumber}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {sale.status}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {sale.paymentStatus}
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {sale.date}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href="/dashboard/sales/active"
                        className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-[11px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* View All Button */}
          <div className="flex justify-end p-4 border-t border-gray-100">
            <Link
              href="/dashboard/sales/active"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              View All
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
