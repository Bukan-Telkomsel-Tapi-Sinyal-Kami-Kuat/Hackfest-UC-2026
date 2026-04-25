"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Video, BookOpen, LogOut, Users, ShieldCheck, Sparkles, FileText } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/context/AuthContext";

const PARENT_NAV = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, color: "var(--color-kids-purple-mid)" },
  { href: "/dashboard/children", label: "Data Anak", icon: Users, color: "var(--color-kids-pink-mid)" },
  { href: "/modules", label: "Modul Belajar", icon: BookOpen, color: "var(--color-kids-mint-mid)" },
  { href: "/dashboard/generate-module", label: "Generate Modul AI", icon: Sparkles, color: "var(--color-kids-sun-mid)" },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Video, color: "var(--color-kids-sky-mid)" },
];

const ADMIN_NAV = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, color: "var(--color-kids-purple-mid)" },
  { href: "/dashboard/admin", label: "Admin Panel", icon: ShieldCheck, color: "var(--color-kids-pink-mid)" },
  { href: "/dashboard/admin/modules", label: "Kelola Modul", icon: FileText, color: "var(--color-kids-mint-mid)" },
  { href: "/dashboard/admin/generate", label: "Buat Modul AI", icon: Sparkles, color: "var(--color-kids-sun-mid)" },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Video, color: "var(--color-kids-sky-mid)" },
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
    <aside
      className="w-64 min-h-screen flex flex-col p-5 border-r"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-8">
        <Image src="/logo-visea.svg" alt="VISEA" width={32} height={21} />
        <span className="font-extrabold text-xl" style={{ color: "var(--color-navy)" }}>
          VISEA
        </span>
      </Link>

      {isAdmin && (
        <div className="px-3 mb-4">
          <span
            className="text-[10px] font-extrabold uppercase tracking-widest rounded-full px-3 py-1"
            style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-mid)" }}
          >
            ✦ Admin
          </span>
        </div>
      )}

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && href !== "/modules" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 h-11 rounded-[var(--radius-lg)] text-sm font-semibold transition-all",
                active ? "shadow-[var(--shadow-sm)]" : "hover:bg-[var(--color-surface-muted)]"
              )}
              style={
                active
                  ? { background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-mid)" }
                  : { color: "var(--color-text-muted)" }
              }
            >
              <span
                className="grid place-items-center w-7 h-7 rounded-lg flex-shrink-0"
                style={active ? { background: "var(--color-kids-purple)", color: "white" } : { color }}
              >
                <Icon className="w-4 h-4" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-3 px-3 mb-3">
          <div
            className="grid place-items-center w-9 h-9 rounded-full font-extrabold text-sm flex-shrink-0"
            style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-mid)" }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">{user?.name ?? "—"}</div>
            <div className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{user?.email}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 h-10 w-full rounded-[var(--radius-lg)] text-sm font-semibold transition-colors hover:bg-red-50 hover:text-red-500"
          style={{ color: "var(--color-text-muted)" }}
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
