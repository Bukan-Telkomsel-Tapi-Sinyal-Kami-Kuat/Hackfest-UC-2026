"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-surface-muted)" }}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top-bar */}
        <header
          className="md:hidden sticky top-0 z-10 flex items-center gap-3 px-4 h-14 border-b"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-muted)]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Image src="/logo visea.png" alt="VISEA" width={90} height={30} className="h-7 w-auto" />
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
