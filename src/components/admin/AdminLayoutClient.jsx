"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export function AdminLayoutClient({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Di mobile (< 1024px), sidebar otomatis tertutup awal
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
    <div className="flex h-screen w-full bg-[#F1F5F9] text-gray-900 font-sans overflow-hidden">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      <div className="flex flex-1 flex-col h-screen min-w-0 overflow-hidden">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="min-h-full flex flex-col justify-between space-y-8">
            <div className="flex-1">
              {children}
            </div>
            <footer className="border-t border-gray-200 bg-white px-4 sm:px-6 py-3.5 text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2 rounded-lg shrink-0">
              <div>Copyright 2025 Modesy - All Rights Reserved.</div>
              <div className="font-medium text-gray-400">Version 2.7</div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
