"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  CreditCard,
  ShoppingBag,
  Hourglass,
  Minus,
  X,
  Star,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { formatPriceIDR } from "@/lib/utils";

// Geometri donut: Radius = 38, Circumference = 238.76
const CIRCUMFERENCE = 238.76;

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

function label(value) {
  if (!value) return "-";
  if (STATUS_LABELS[value]) return STATUS_LABELS[value];
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Sumbu Y terlalu sempit untuk formatPriceIDR penuh, jadi disingkat tetap Rupiah.
function compactIDR(value) {
  const v = Number(value) || 0;
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)} M`;
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(0)} jt`;
  if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)} rb`;
  return `Rp ${Math.round(v)}`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-gray-200 bg-white p-5 shadow-2xs h-[92px] animate-pulse">
            <div className="h-7 w-16 rounded bg-gray-100" />
            <div className="mt-2 h-3 w-28 rounded bg-gray-100" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 border border-gray-200 bg-white shadow-2xs h-72 animate-pulse" />
        <Card className="lg:col-span-7 border border-gray-200 bg-white shadow-2xs h-72 animate-pulse" />
      </div>
      <Card className="border border-gray-200 bg-white shadow-2xs h-64 animate-pulse" />
    </div>
  );
}

export function AdminDashboardClient({ overview = null, currentUser = null }) {
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredDonut, setHoveredDonut] = useState(null); // 'active' | 'completed' | null
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [collapsedCards, setCollapsedCards] = useState({});
  const [closedCards, setClosedCards] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  const toggleCollapse = (key) => {
    setCollapsedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const closeCard = (key) => {
    setClosedCards((prev) => ({ ...prev, [key]: true }));
  };

  if (!overview) {
    return <DashboardSkeleton />;
  }

  const counts = overview.counts ?? {};
  const totalOrders = counts.orders ?? 0;
  const completedCount = counts.completedOrders ?? 0;
  const cancelledCount = counts.cancelledOrders ?? 0;
  const activeCount = Math.max(0, totalOrders - completedCount - cancelledCount);

  const revenue = overview.revenue ?? 0;
  const recentOrders = overview.recentOrders ?? [];
  const recentProducts = overview.recentProducts ?? [];
  const months = overview.months ?? [];

  const hasSales = totalOrders > 0;
  const activeArc = hasSales ? (activeCount / totalOrders) * CIRCUMFERENCE : 0;
  const completedArc = hasSales ? (completedCount / totalOrders) * CIRCUMFERENCE : 0;
  const activePct = hasSales ? ((activeCount / totalOrders) * 100).toFixed(1) : "0.0";
  const completedPct = hasSales ? ((completedCount / totalOrders) * 100).toFixed(1) : "0.0";

  const maxMonthTotal = months.reduce((mx, m) => Math.max(mx, Number(m.total) || 0), 0);
  const monthPoints = months.map((m, idx) => {
    const count = months.length;
    const x = count > 1 ? 60 + idx * (500 / (count - 1)) : 300;
    const total = Number(m.total) || 0;
    const y = maxMonthTotal > 0 ? 180 - (total / maxMonthTotal) * 140 : 180;
    return { key: m.key ?? `${idx}`, m: m.label ?? "-", x, y, total, amount: formatPriceIDR(total) };
  });
  const hasMonthlySales = maxMonthTotal > 0;
  const peakIdx = monthPoints.reduce(
    (best, pt, idx) => (pt.total > (monthPoints[best]?.total ?? -1) ? idx : best),
    0
  );
  const linePath = monthPoints.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");
  const areaPath =
    monthPoints.length > 0
      ? `${linePath} L ${monthPoints[monthPoints.length - 1].x} 180 L ${monthPoints[0].x} 180 Z`
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* ========================================================= */}
      {/* ROW 1: 4 STAT CARDS (Persis references/Dashboard.png) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Sales */}
        <Card className="border border-gray-200 bg-white p-5 shadow-2xs flex items-center justify-between hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] hover:border-teal-500/40 transition-all duration-200 group cursor-default">
          <div>
            <div className="text-3xl font-extrabold text-gray-900 tracking-tight group-hover:text-teal-600 transition-colors">
              {totalOrders}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-1">
              Number of total sales
            </div>
          </div>
          <ShoppingCart className="size-8 text-gray-400 stroke-[1.5] shrink-0 group-hover:scale-110 group-hover:text-teal-600 transition-all duration-300" />
        </Card>

        {/* Card 2: Revenue */}
        <Card className="border border-gray-200 bg-white p-5 shadow-2xs flex items-center justify-between hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] hover:border-emerald-500/40 transition-all duration-200 group cursor-default">
          <div>
            <div className="text-2xl font-extrabold text-gray-900 tracking-tight group-hover:text-emerald-600 transition-colors">
              {formatPriceIDR(revenue)}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-1">
              Total Revenue (Dibayar)
            </div>
          </div>
          <CreditCard className="size-8 text-gray-400 stroke-[1.5] shrink-0 group-hover:scale-110 group-hover:text-emerald-600 transition-all duration-300" />
        </Card>

        {/* Card 3: Products */}
        <Card className="border border-gray-200 bg-white p-5 shadow-2xs flex items-center justify-between hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] hover:border-indigo-500/40 transition-all duration-200 group cursor-default">
          <div>
            <div className="text-3xl font-extrabold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              {counts.products ?? 0}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-1">
              Products
            </div>
          </div>
          <ShoppingBag className="size-8 text-gray-400 stroke-[1.5] shrink-0 group-hover:scale-110 group-hover:text-indigo-600 transition-all duration-300" />
        </Card>

        {/* Card 4: Pending Products */}
        <Card className="border border-gray-200 bg-white p-5 shadow-2xs flex items-center justify-between hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-500/40 transition-all duration-200 group cursor-default">
          <div>
            <div className="text-3xl font-extrabold text-gray-900 tracking-tight group-hover:text-amber-600 transition-colors">
              {counts.pendingProducts ?? 0}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-1">
              Pending Products
            </div>
          </div>
          <Hourglass className="size-8 text-gray-400 stroke-[1.5] shrink-0 group-hover:scale-110 group-hover:text-amber-600 transition-all duration-300" />
        </Card>
      </div>

      {/* ========================================================= */}
      {/* ROW 2: CHARTS (Sales Animated Donut & Monthly Sales Area) */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Card 1: Sales Donut Chart (5 cols) */}
        {!closedCards.sales && (
          <Card className="lg:col-span-5 border border-gray-200 bg-white shadow-2xs transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-semibold text-gray-800">
                Sales
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-400">
                <button
                  type="button"
                  onClick={() => toggleCollapse("sales")}
                  className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Collapse"
                >
                  <Minus className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => closeCard("sales")}
                  className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </CardHeader>

            {!collapsedCards.sales && (
              <CardContent className="p-5 flex flex-col items-center">
                {/* Interactive Legend with hover states */}
                <div className="flex items-center justify-center gap-4 text-xs font-medium text-gray-600 mb-3 select-none">
                  <button
                    type="button"
                    onClick={() => setHoveredDonut((prev) => (prev === "active" ? null : "active"))}
                    onMouseEnter={() => setHoveredDonut("active")}
                    onMouseLeave={() => setHoveredDonut(null)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all cursor-pointer ${
                      hoveredDonut === "active"
                        ? "bg-teal-50 text-teal-700 font-bold"
                        : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span className="w-4 h-2 rounded-xs bg-[#14B8A6] inline-block shadow-2xs" />
                    <span>Active Sales ({activeCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHoveredDonut((prev) => (prev === "completed" ? null : "completed"))}
                    onMouseEnter={() => setHoveredDonut("completed")}
                    onMouseLeave={() => setHoveredDonut(null)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all cursor-pointer ${
                      hoveredDonut === "completed"
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span className="w-4 h-2 rounded-xs bg-[#6366F1] inline-block shadow-2xs" />
                    <span>Completed Sales ({completedCount})</span>
                  </button>
                </div>

                {/* Animated SVG Donut Chart */}
                <div className="relative size-56 flex items-center justify-center my-1">
                  <svg
                    className="size-full -rotate-90 transition-transform duration-700"
                    viewBox="0 0 100 100"
                  >
                    {/* Background Ring (faint guide track) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#F1F5F9"
                      strokeWidth="16"
                    />

                    {/* Segment 1: Completed Sales (Blue/Indigo, offset = 0) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#6366F1"
                      strokeWidth={hoveredDonut === "completed" ? 19 : 16}
                      strokeDasharray={`${isMounted ? completedArc : 0} ${CIRCUMFERENCE}`}
                      strokeDashoffset="0"
                      onMouseEnter={() => setHoveredDonut("completed")}
                      onMouseLeave={() => setHoveredDonut(null)}
                      style={{
                        transition:
                          "stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.25s ease, opacity 0.25s ease, filter 0.25s ease",
                        opacity: hoveredDonut === "active" ? 0.35 : 1,
                        filter:
                          hoveredDonut === "completed"
                            ? "drop-shadow(0 2px 8px rgba(99, 102, 241, 0.45))"
                            : "none",
                        cursor: "pointer",
                      }}
                    />

                    {/* Segment 2: Active Sales (Teal, starts after Completed) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#14B8A6"
                      strokeWidth={hoveredDonut === "active" ? 19 : 16}
                      strokeDasharray={`${isMounted ? activeArc : 0} ${CIRCUMFERENCE}`}
                      strokeDashoffset={-completedArc}
                      onMouseEnter={() => setHoveredDonut("active")}
                      onMouseLeave={() => setHoveredDonut(null)}
                      style={{
                        transition:
                          "stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.25s ease, opacity 0.25s ease, filter 0.25s ease",
                        opacity: hoveredDonut === "completed" ? 0.35 : 1,
                        filter:
                          hoveredDonut === "active"
                            ? "drop-shadow(0 2px 8px rgba(20, 184, 166, 0.45))"
                            : "none",
                        cursor: "pointer",
                      }}
                    />
                  </svg>

                  {/* Interactive Animated Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none transition-all duration-300">
                    {hasSales && hoveredDonut === "active" && (
                      <div className="text-center animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-3xl font-black text-[#14B8A6] block leading-none">
                          {activeCount}
                        </span>
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide mt-1 block">
                          Active ({activePct}%)
                        </span>
                      </div>
                    )}
                    {hasSales && hoveredDonut === "completed" && (
                      <div className="text-center animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-3xl font-black text-[#6366F1] block leading-none">
                          {completedCount}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide mt-1 block">
                          Completed ({completedPct}%)
                        </span>
                      </div>
                    )}
                    {(!hoveredDonut || !hasSales) && (
                      <div className="text-center animate-in fade-in duration-200">
                        {hasSales ? (
                          <>
                            <span className="text-3xl font-black text-gray-900 block leading-none">
                              {totalOrders}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1 block">
                              Total Sales
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400 px-4">
                            Belum ada penjualan
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Card 2: Monthly Sales Area Chart (7 cols) */}
        {!closedCards.monthly && (
          <Card className="lg:col-span-7 border border-gray-200 bg-white shadow-2xs transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-semibold text-gray-800">
                Monthly sales
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-400">
                <button
                  type="button"
                  onClick={() => toggleCollapse("monthly")}
                  className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Collapse"
                >
                  <Minus className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => closeCard("monthly")}
                  className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </CardHeader>

            {!collapsedCards.monthly && (
              <CardContent className="p-5">
                {/* Legend */}
                <div className="flex justify-end mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-teal-500 text-[11px] text-gray-700 rounded-xs">
                    <span className="size-2 bg-teal-500 rounded-xs inline-block" />
                    <span>Sales (6 bulan terakhir)</span>
                  </div>
                </div>

                {/* SVG Area Chart with interactive hover & animated path */}
                <div className="w-full h-56 relative">
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox="0 0 600 220"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="adminSalesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.4" />
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
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const y = 30 + i * 30;
                      const axisValue = maxMonthTotal > 0 ? ((180 - y) / 140) * maxMonthTotal : 0;
                      return (
                        <text key={i} x="40" y={y + 4} textAnchor="end" fontSize="9" fill="#94A3B8">
                          {compactIDR(Math.max(0, axisValue))}
                        </text>
                      );
                    })}

                    {/* Area fill with smooth fade-in */}
                    {areaPath && (
                      <path
                        d={areaPath}
                        fill="url(#adminSalesGrad)"
                        style={{
                          opacity: isMounted ? 1 : 0,
                          transition: "opacity 1.2s ease-in-out 0.2s",
                        }}
                      />
                    )}

                    {/* Curved Line with draw-in animation */}
                    {linePath && (
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#14B8A6"
                        strokeWidth="2.5"
                        strokeDasharray="1000"
                        strokeDashoffset={isMounted ? "0" : "1000"}
                        style={{
                          transition: "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      />
                    )}

                    {/* Peak pulsing highlight */}
                    {hasMonthlySales && monthPoints[peakIdx] && (
                      <circle
                        cx={monthPoints[peakIdx].x}
                        cy={monthPoints[peakIdx].y}
                        r="9"
                        fill="none"
                        stroke="#14B8A6"
                        strokeWidth="1.5"
                        className="animate-ping opacity-60"
                      />
                    )}

                    {/* Interactive Data Points */}
                    {monthPoints.map((pt, idx) => {
                      const isHovered = hoveredMonth === pt.key;
                      const isPeak = hasMonthlySales && idx === peakIdx;
                      return (
                        <g key={pt.key} className="cursor-pointer">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 6 : isPeak ? 4.5 : 3.5}
                            fill={isHovered || isPeak ? "#14B8A6" : "#FFFFFF"}
                            stroke="#14B8A6"
                            strokeWidth={isHovered ? 2.5 : 2}
                            onMouseEnter={() => setHoveredMonth(pt.key)}
                            onMouseLeave={() => setHoveredMonth(null)}
                            className="transition-all duration-200"
                          />

                          {/* Hover Tooltip */}
                          {isHovered && (
                            <g className="pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                              <rect
                                x={Math.min(Math.max(pt.x - 65, 5), 465)}
                                y={Math.max(pt.y - 32, 5)}
                                width="130"
                                height="22"
                                rx="4"
                                fill="#0F172A"
                                opacity="0.92"
                              />
                              <text
                                x={Math.min(Math.max(pt.x, 70), 530)}
                                y={Math.max(pt.y - 17, 20)}
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="bold"
                                fill="#FFFFFF"
                              >
                                {pt.m}: {pt.amount}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* X-axis Month Labels */}
                    {monthPoints.map(({ key, m, x }) => (
                      <text
                        key={key}
                        x={x}
                        y="205"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight={hoveredMonth === key ? "700" : "500"}
                        fill={hoveredMonth === key ? "#0D9488" : "#64748B"}
                        className="transition-colors cursor-pointer select-none"
                        onMouseEnter={() => setHoveredMonth(key)}
                        onMouseLeave={() => setHoveredMonth(null)}
                      >
                        {m}
                      </text>
                    ))}
                  </svg>

                  {!hasMonthlySales && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-semibold text-gray-400 bg-white/70 px-3 py-1 rounded">
                        Belum ada penjualan
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </motion.div>

      {/* ========================================================= */}
      {/* ROW 3: LATEST COMMENTS & LATEST PRODUCTS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Comments Card */}
        <Card className="border border-gray-200 bg-white shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-semibold text-gray-800">
                Latest Comments
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-400">
                <button
                  type="button"
                  onClick={() => toggleCollapse("comments")}
                  className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Collapse"
                >
                  <Minus className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => closeCard("comments")}
                  className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </CardHeader>
            {!collapsedCards.comments && (
              <CardContent className="p-0">
                <div className="overflow-x-auto min-h-[140px] flex flex-col items-center justify-center gap-1">
                  <p className="text-2xl font-extrabold text-gray-900">{counts.comments ?? 0}</p>
                  <p className="text-xs text-gray-500 font-medium">Total komentar</p>
                </div>
              </CardContent>
            )}
          </div>
          {!collapsedCards.comments && (
            <div className="flex justify-end p-3 border-t border-gray-100">
              <Link
                href="/admin/comments"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-2xs cursor-pointer"
              >
                View All
              </Link>
            </div>
          )}
        </Card>

        {/* Latest Products Card */}
        <Card className="border border-gray-200 bg-white shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-semibold text-gray-800">
                Latest Products
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-400">
                <button
                  type="button"
                  onClick={() => toggleCollapse("products")}
                  className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Collapse"
                >
                  <Minus className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => closeCard("products")}
                  className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </CardHeader>
            {!collapsedCards.products && (
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {recentProducts.length === 0 ? (
                    <div className="min-h-[140px] flex items-center justify-center">
                      <p className="text-xs text-gray-400 font-medium">Belum ada produk.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] font-semibold text-gray-500 border-b border-gray-100 bg-gray-50/50">
                        <tr>
                          <th className="px-4 py-2">Product</th>
                          <th className="px-4 py-2">Rating</th>
                          <th className="px-4 py-2 whitespace-nowrap">Price</th>
                          <th className="px-4 py-2 text-right">Options</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {recentProducts.slice(0, 5).map((prod) => (
                          <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                {prod.image ? (
                                  <img
                                    src={prod.image}
                                    alt={prod.title}
                                    className="size-8 rounded object-cover bg-gray-100 shrink-0"
                                  />
                                ) : (
                                  <span className="size-8 rounded bg-gray-100 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 truncate max-w-[160px]">
                                    {prod.title}
                                  </p>
                                  {prod.seller?.username ? (
                                    <Link
                                      href={`/profile/${prod.seller.username}`}
                                      className="text-[10px] text-gray-400 hover:text-teal-600"
                                    >
                                      @{prod.seller.username}
                                    </Link>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-0.5 text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`size-3 ${
                                      i < Math.round(prod.rating || 0)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {prod.reviewsCount ?? 0} review
                              </p>
                            </td>
                            <td className="px-4 py-2.5 text-gray-800 font-semibold whitespace-nowrap">
                              {formatPriceIDR(prod.price)}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <Link
                                href={`/products/${prod.slug}`}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-[11px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs inline-block cursor-pointer"
                              >
                                Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            )}
          </div>
          {!collapsedCards.products && (
            <div className="flex justify-end p-3 border-t border-gray-100">
              <Link
                href="/admin/products"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-2xs cursor-pointer"
              >
                View All
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* ========================================================= */}
      {/* ROW 4: LATEST SALES */}
      {/* ========================================================= */}
      <Card className="border border-gray-200 bg-white shadow-2xs hover:shadow-xs transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-3.5 px-5">
          <CardTitle className="text-sm font-semibold text-gray-800">
            Latest Sales
          </CardTitle>
          <div className="flex items-center gap-2 text-gray-400">
            <button
              type="button"
              onClick={() => toggleCollapse("salesList")}
              className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
              title="Collapse"
            >
              <Minus className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => closeCard("salesList")}
              className="p-1 hover:text-gray-600 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </CardHeader>

        {!collapsedCards.salesList && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/60 text-[11px] font-semibold text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-2.5">Sale</th>
                    <th className="px-5 py-2.5">Buyer</th>
                    <th className="px-5 py-2.5 text-right">Total</th>
                    <th className="px-5 py-2.5">Status</th>
                    <th className="px-5 py-2.5">Payment</th>
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                        No records found!
                      </td>
                    </tr>
                  )}
                  {recentOrders.slice(0, 6).map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3 font-semibold text-gray-800">
                        {sale.orderNumber}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {sale.buyerUsername ? (
                          <Link
                            href={`/profile/${sale.buyerUsername}`}
                            className="hover:text-teal-600"
                          >
                            {sale.buyer}
                          </Link>
                        ) : (
                          sale.buyer
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800">
                        {formatPriceIDR(sale.total)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {label(sale.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {label(sale.paymentStatus)}
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {sale.date}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href="/admin/orders"
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-[11px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs inline-block cursor-pointer"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end p-4 border-t border-gray-100">
              <Link
                href="/admin/orders"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
              >
                View All
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
