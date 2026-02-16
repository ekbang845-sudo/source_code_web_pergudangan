"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    role?: string | null;
  };
}

export default function DashboardLayoutClient({
  children,
  user,
}: DashboardLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen font-sans bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        user={user}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <Topbar user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-4 md:p-6 relative">
          {children}
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}
