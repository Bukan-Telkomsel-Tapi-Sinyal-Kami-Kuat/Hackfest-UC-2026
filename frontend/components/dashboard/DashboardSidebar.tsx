"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Video, BookOpen, LogOut, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/context/AuthContext";

const PARENT_NAV = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/dashboard/children", label: "Data Anak", icon: Users },
  { href: "/modules", label: "Modul", icon: BookOpen },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Video },
];

const ADMIN_NAV = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/dashboard/admin", label: "Admin Panel", icon: ShieldCheck },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Video },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin ? ADMIN_NAV : PARENT_NAV;

  async function onLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-[var(--color-border)] flex flex-col p-5">
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-8">
        <div className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--color-blue-600)] text-white font-extrabold">
          V
        </div>
        <span className="font-bold text-lg tracking-tight">VISEA</span>
      </Link>

      {isAdmin && (
        <div className="px-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-blue-700)] bg-[var(--color-blue-50)] rounded-full px-2 py-0.5">
            Admin
          </span>
        </div>
      )}

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && href !== "/modules" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--color-blue-50)] text-[var(--color-blue-700)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] pt-4 mt-4">
        <div className="px-3 mb-3">
          <div className="text-sm font-semibold truncate">{user?.name ?? "—"}</div>
          <div className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 h-10 w-full rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
