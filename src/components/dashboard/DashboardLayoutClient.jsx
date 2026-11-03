"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export function DashboardLayoutClient({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Deteksi mobile (window.innerWidth < 1024)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-gray-900 font-sans overflow-x-hidden">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          user={user}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white px-4 sm:px-6 py-3.5 text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
          <div>Copyright 2025 Modesy - All Rights Reserved.</div>
          <div className="font-medium text-gray-400">Version 2.7</div>
        </footer>
      </div>
    </div>
  );
}
